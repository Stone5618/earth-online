"""Game routes - complete life simulation loop with event engine, time, aging, death."""

import asyncio
import json
import logging
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session, joinedload
from sqlalchemy.exc import SQLAlchemyError

from ..database import get_db
from ..models import Character, Server, User, EventTemplate
from ..schemas import EventChoice
from ..auth import get_current_user
from ..engine.events import match_event
from ..services.scoring_service import calculate_life_score
from ..services.game_turn_service import GameTurnService
from ..cache import cache_manager
from ..utils.distributed_lock import DistributedLock, DistributedLockError
from ..rate_limiter import limiter

logger = logging.getLogger("earthonline")

router = APIRouter(prefix="/api/v1/game", tags=["game"])


def _get_live_character(char_id: int, user_id: int, db: Session) -> Character:
    """Get character or raise 404, with eager-loaded server to avoid N+1."""
    char = db.query(Character).options(
        joinedload(Character.server)
    ).filter(
        Character.id == char_id,
        Character.user_id == user_id,
        Character.is_alive == True,
    ).first()
    if not char:
        raise HTTPException(status_code=404, detail="Character not found or deceased")
    return char


@router.get("/next_event")
@limiter.limit("30/minute")
def get_next_event(
    request: Request,
    char_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get the next life event for the character. No side effects - pure matching."""
    char = _get_live_character(char_id, current_user.id, db)
    # server is eagerly loaded via joinedload in _get_live_character
    server = char.server
    if not server:
        raise HTTPException(status_code=404, detail="Server not found")

    # First event is always birth event for age 0
    if int(char.age) == 0 and not (char.flags or {}).get("has_had_birth_event"):
        return {
            "event": _birth_event(char),
            "server_context": {
                "name": server.name,
                "difficulty": server.difficulty,
                "era": (server.global_vars or {}).get("era") or _determine_era(server),
            },
            "character": _char_snapshot(char),
            "is_dead": False,
        }

    # Determine current era from server global_vars or seasons
    era = (server.global_vars or {}).get("era") or _determine_era(server)

    result = match_event(char, server, db, era=era)
    if result is None:
        # Genuinely no match — provide a default everyday event
        return {
            "event": _default_event(char),
            "server_context": {
                "name": server.name,
                "difficulty": server.difficulty,
                "era": era,
            },
            "character": _char_snapshot(char),
            "is_dead": False,
        }

    event_view, event_data = result
    return {
        "event": event_view,
        "server_context": {
            "name": server.name,
            "difficulty": server.difficulty,
            "era": era,
        },
        "character": _char_snapshot(char),
        "is_dead": False,
    }


def _char_snapshot(char: Character) -> dict:
    return {
        "age": char.age,
        "health": char.health,
        "mood": char.mood,
        "money": char.money,
        "energy": char.energy,
        "intelligence": char.intelligence,
        "charm": char.charm,
        "creativity": char.creativity,
        "luck": char.luck,
        "karma": char.karma,
        "is_married": char.is_married,
        "total_money_earned": char.total_money_earned or 0,
        "max_health": char.max_health,
        "max_energy": char.max_energy,
    }


def _compute_state_diff(old: dict, new: dict) -> dict:
    """
    Compute difference between old and new state for incremental updates.
    Returns only changed fields.
    """
    diff = {}
    for key, new_val in new.items():
        old_val = old.get(key)
        if old_val != new_val:
            diff[key] = new_val
    return diff


def _default_event(char: Character) -> dict:
    return {
        "event_id": 0,
        "title": "平凡的一天",
        "description": "生活平平淡淡，没有什么特别的事情发生。",
        "options": [
            {"index": 0, "text": "认真生活", "hint": "继续努力，过好每一天"},
            {"index": 1, "text": "摸鱼偷懒", "hint": "偶尔放松一下也不错"},
        ],
        "category": "life",
    }


def _birth_event(char: Character) -> dict:
    """Generate the fixed birth event for age 0."""
    # Extract birth info from character
    birth_server = char.birth_server or "地球"
    family_tier = char.family_tier or "R"
    talent = (char.flags or {}).get("talent", "随机天赋")
    
    tier_desc = {
        "SSS": "显赫世家",
        "SS": "富贵之家",
        "S": "中产家庭",
        "A": "普通家庭",
        "B": "工薪家庭",
        "C": "贫困家庭",
        "R": "平凡人家"
    }.get(family_tier, "平凡人家")
    
    return {
        "event_id": 1,
        "title": "你来到了这个世界",
        "description": f"你出生在{tier_desc}，服务器是{birth_server}。带着你的天赋「{talent}」，开始了你的人生旅程。",
        "options": [
            {"index": 0, "text": "哇哇大哭", "hint": "响亮地向世界宣布你的到来！"},
            {"index": 1, "text": "安静观察", "hint": "好奇地打量着这个新世界..."},
        ],
        "category": "milestone",
    }


def _determine_era(server: Server) -> str:
    """Determine current era/epoch based on server global_vars or social_mood."""
    gv = server.global_vars or {}
    year_offset = gv.get("year", 0)
    # Cycle through eras every N years for variety
    eras = ["normal", "era_boom", "normal", "era_recession", "normal", "era_tech_boom", "normal", "normal"]
    idx = (year_offset // 15) % len(eras)
    return eras[idx]


@router.post("/make_choice")
@limiter.limit("60/minute")
async def submit_choice(
    request: Request,
    char_id: int,
    body: EventChoice,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Submit a choice for the current event. This triggers the full annual tick.

    Steps:
    1. Apply choice stat changes
    2. Age character by 1 year
    3. Apply natural health decay
    4. Age NPCs
    5. Check for death
    6. Check achievements
    7. Update server global_vars (year offset)
    
    Returns incremental state diff for performance optimization.
    """
    char = _get_live_character(char_id, current_user.id, db)
    server = char.server

    old_state = _char_snapshot(char)

    lock = DistributedLock(cache_manager.redis, timeout=15)
    try:
        async with lock.acquire(f"character:{char_id}", retry_times=2, retry_delay=0.2):
            return await asyncio.to_thread(_execute_game_turn, char, server, body, db, old_state)
    except DistributedLockError:
        raise HTTPException(
            status_code=409,
            detail="角色正在处理中，请稍后再试。避免同时发送多个请求。"
        )


def _execute_game_turn(char, server, body, db, old_state):
    """Execute a full game turn via the GameTurnService."""
    service = GameTurnService(char, server, db, old_state)
    try:
        outcome = service.execute_turn(body)
        db.commit()
        return outcome
    except SQLAlchemyError as e:
        db.rollback()
        logger.error(f"Database error in game execution for char {char.id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="游戏逻辑执行失败，请稍后重试")
    except HTTPException:
        db.rollback()
        raise
    except Exception:
        db.rollback()
        logger.exception(f"Unexpected error in game execution for char {char.id}")
        raise HTTPException(status_code=500, detail="游戏逻辑执行失败，请稍后重试")


@router.get("/character/{char_id}/state")
def get_character_state(
    char_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get full character state for frontend display."""
    char = _get_live_character(char_id, current_user.id, db)
    # server is eagerly loaded via joinedload in _get_live_character
    server = char.server

    return {
        "character": _char_snapshot(char),
        "is_alive": char.is_alive,
        "death_reason": char.death_reason,
        "death_age": char.death_age,
        "occupation": char.occupation or "无业",
        "server_name": server.name if server else None,
        "family_tier": char.family_tier or "R",
        "last_event_titles": (char.recent_event_titles or [])[-5:],
    }
