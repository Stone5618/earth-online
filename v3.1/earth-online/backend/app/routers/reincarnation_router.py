"""Reincarnation / New Game Plus routes."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Character, Server, User
from ..schemas import CharacterCreate
from ..auth import get_current_user
from sqlalchemy.exc import SQLAlchemyError
import logging

router = APIRouter(prefix="/api/v1/reincarnation", tags=["reincarnation"])


_INHERITANCE_TABLE = {
    # Title keyword -> (stat_bonus, starting_money, luck_duration, luck_bonus, description)
    "富豪": {
        "money_bonus": 200000,
        "stat_bonus": 5,
        "stats": ["money", "charm", "luck"],
        "description": "前世积累了巨额财富",
    },
    "中产": {
        "money_bonus": 50000,
        "stat_bonus": 3,
        "stats": ["money", "karma"],
        "description": "前世生活优渥",
    },
    "小康": {
        "money_bonus": 20000,
        "stat_bonus": 2,
        "stats": ["money"],
        "description": "前世略有积蓄",
    },
    "企业家": {
        "money_bonus": 100000,
        "stat_bonus": 5,
        "stats": ["creativity", "luck", "money"],
        "description": "前世创下了事业",
    },
    "精英": {
        "money_bonus": 80000,
        "stat_bonus": 4,
        "stats": ["intelligence", "charm"],
        "description": "前世是行业精英",
    },
    "百岁老人": {
        "money_bonus": 30000,
        "stat_bonus": 8,
        "stats": ["health", "max_health"],
        "description": "前世长寿基因延续",
    },
    "高学历": {
        "money_bonus": 20000,
        "stat_bonus": 5,
        "stats": ["intelligence", "creativity"],
        "description": "前世知识传承",
    },
}


def _analyze_inheritance(char: Character) -> dict:
    """Analyze a deceased character and determine inheritance bonuses."""
    bonus = {
        "money_bonus": 0,
        "stat_bonus": {},
        "description": "前世一生平平，没有留下特别的遗产。",
        "titles_earned": [],
    }
    
    if not char.final_title:
        return bonus
    
    titles = char.final_title.split("•")
    bonus["titles_earned"] = [t for t in titles if t in _INHERITANCE_TABLE]
    
    # Accumulate bonuses from all matching titles
    for title_key, rule in _INHERITANCE_TABLE.items():
        if title_key in titles:
            bonus["money_bonus"] += rule["money_bonus"]
            bonus["description"] = rule["description"]
            for stat in rule["stats"]:
                cur = bonus["stat_bonus"].get(stat, 0)
                bonus["stat_bonus"][stat] = cur + rule["stat_bonus"]
    
    # Cap bonuses
    bonus["money_bonus"] = min(bonus["money_bonus"], 500000)
    for stat in bonus["stat_bonus"]:
        bonus["stat_bonus"][stat] = min(bonus["stat_bonus"][stat], 20)
    
    return bonus


@router.get("/inheritance")
def get_inheritance(
    char_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get the inheritance bonuses from a deceased character."""
    char = db.query(Character).filter(
        Character.id == char_id,
        Character.user_id == current_user.id,
    ).first()
    if not char:
        raise HTTPException(status_code=404, detail="Character not found")
    if char.is_alive:
        raise HTTPException(status_code=400, detail="Character is still alive")

    inheritance = _analyze_inheritance(char)
    life_score = _calculate_life_score_for_inheritance(char)

    return {
        "character_name": char.name,
        "death_age": char.death_age or char.age,
        "final_title": char.final_title or "普通人",
        "life_score": life_score,
        "inheritance": inheritance,
    }


@router.post("/start")
def start_reincarnation(
    char_id: int,
    body: CharacterCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Start a new character inheriting from a deceased previous character."""
    # Get the deceased character
    old_char = db.query(Character).filter(
        Character.id == char_id,
        Character.user_id == current_user.id,
    ).first()
    if not old_char:
        raise HTTPException(status_code=404, detail="Previous character not found")
    if old_char.is_alive:
        raise HTTPException(status_code=400, detail="Previous character is still alive")

    # Verify target server exists
    server = db.query(Server).filter(Server.id == body.server_id, Server.is_active == True).first()
    if not server:
        raise HTTPException(status_code=404, detail="Server not found")

    # Get inheritance bonuses
    inheritance = _analyze_inheritance(old_char)

    # Create new character with inheritance
    try:
        new_char = Character(
            user_id=current_user.id,
            server_id=body.server_id,
            name=body.name,
            is_alive=True,
            is_active=True,
            family_tier=old_char.family_tier or "R",
            # Inheritance: stat bonuses
            intelligence=min(100, 50 + inheritance["stat_bonus"].get("intelligence", 0)),
            charm=min(100, 50 + inheritance["stat_bonus"].get("charm", 0)),
            creativity=min(100, 50 + inheritance["stat_bonus"].get("creativity", 0)),
            luck=min(100, 50 + inheritance["stat_bonus"].get("luck", 0)),
            karma=min(100, 50 + inheritance["stat_bonus"].get("karma", 0)),
            health=min(100, 100 + inheritance["stat_bonus"].get("health", 0)),
            max_health=min(120, 100 + inheritance["stat_bonus"].get("max_health", 0)),
            # Inheritance: money
            total_money_earned=inheritance["money_bonus"],
            money=inheritance["money_bonus"],

            # Flags tracking inheritance
            flags={
                "reincarnated_from": old_char.name,
                "reincarnation_count": (old_char.flags or {}).get("reincarnation_count", 0) + 1,
                "inheritance_bonus": inheritance,
            },
        )

        # Mark old character inactive
        old_char.is_active = False

        db.add(new_char)
        db.commit()
        db.refresh(new_char)
    except SQLAlchemyError as e:
        db.rollback()
        logger.error(f"Database error in reincarnation for char {char_id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="转世失败，请稍后重试")
    except HTTPException:
        db.rollback()
        raise
    except Exception:
        db.rollback()
        logger.exception(f"Unexpected error in reincarnation for char {char_id}")
        raise HTTPException(status_code=500, detail="转世失败，请稍后重试")

    return {
        "character": {
            "id": new_char.id,
            "name": new_char.name,
            "server_id": new_char.server_id,
        },
        "inheritance": inheritance,
        "reincarnation_count": new_char.flags["reincarnation_count"] if new_char.flags else 1,
    }


def _calculate_life_score_for_inheritance(char: Character) -> float:
    """Simple life score for inheritance display."""
    score = 0.0
    age = char.death_age or char.age or 0
    score += min(age * 5, 500)
    money = char.total_money_earned or 0
    score += min(money / 5000, 200)
    achievements = (char.flags or {}).get("achievements", [])
    score += len(achievements) * 30
    return round(score, 1)
