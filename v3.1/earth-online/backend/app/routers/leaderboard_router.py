"""Leaderboard routes with Redis ZSET optimization."""

import logging
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from datetime import datetime, timezone

from ..database import get_db
from ..models import User, Character, Server, LeaderboardRecord
from ..auth import get_current_user, get_optional_user
from ..services.scoring_service import calculate_life_score
from ..services.leaderboard_service import get_leaderboard_service, LeaderboardService

logger = logging.getLogger("earthonline")

router = APIRouter(prefix="/api/v1/leaderboard", tags=["leaderboard"])


@router.post("/submit/{char_id}")
async def submit_score(
    char_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    lb_service: LeaderboardService = Depends(get_leaderboard_service),
):
    """Submit a deceased character's score to the leaderboard."""
    char = db.query(Character).filter(
        Character.id == char_id,
        Character.user_id == current_user.id,
    ).first()
    if not char:
        raise HTTPException(status_code=404, detail="Character not found")
    if char.is_alive:
        raise HTTPException(status_code=400, detail="Character is still alive")

    existing = db.query(LeaderboardRecord).filter(
        LeaderboardRecord.character_name == char.name,
        LeaderboardRecord.user_id == current_user.id,
        LeaderboardRecord.created_at >= datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0),
    ).first()
    if existing:
        return {"message": "Already submitted", "record_id": existing.id}

    life_score = _calculate_life_score(char)

    record = LeaderboardRecord(
        user_id=current_user.id,
        character_name=char.name,
        server_id=char.server_id,
        death_age=char.death_age or char.age,
        life_score=life_score,
        final_title=char.final_title or "普通人",
        achievements_count=len((char.flags or {}).get("achievements", [])),
        total_money_earned=char.total_money_earned or 0,
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    record_data = {
        "user_id": current_user.id,
        "character_name": record.character_name,
        "server_id": record.server_id,
        "death_age": record.death_age,
        "life_score": record.life_score,
        "final_title": record.final_title,
        "achievements_count": record.achievements_count,
        "total_money_earned": record.total_money_earned,
        "created_at": record.created_at.isoformat() if record.created_at else None,
    }
    try:
        await lb_service.add_record(record.id, record.life_score, record_data)
        rank = await lb_service.get_user_rank(record.id)
    except ConnectionError as redis_err:
        logger.warning(f"Leaderboard Redis connection failed: {redis_err}")
        rank = None
    except TimeoutError as redis_err:
        logger.warning(f"Leaderboard Redis timeout: {redis_err}")
        rank = None
    except Exception:
        logger.exception("Leaderboard Redis add_record failed")
        rank = None

    return {
        "message": "Score submitted",
        "record_id": record.id,
        "life_score": life_score,
        "rank": rank,
    }


@router.get("/top")
async def get_top_scores(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User | None = Depends(get_optional_user),
    lb_service: LeaderboardService = Depends(get_leaderboard_service),
):
    """Get top leaderboard scores with Redis ZSET optimization."""
    try:
        redis_records = await lb_service.get_top_records(offset=(page - 1) * size, limit=size)
        total = await lb_service.get_record_count()
        
        user_best = None
        user_rank = None
        if current_user:
            user_best_db = (
                db.query(LeaderboardRecord)
                .filter(LeaderboardRecord.user_id == current_user.id)
                .order_by(desc(LeaderboardRecord.life_score))
                .first()
            )
            if user_best_db:
                user_rank = await lb_service.get_user_rank(user_best_db.id)
                user_best = {
                    "score": user_best_db.life_score,
                    "rank": user_rank,
                }
        
        return {
            "page": page,
            "size": size,
            "total": total,
            "pages": max(1, (total + size - 1) // size),
            "records": [
                {
                    "rank": r["rank"],
                    "record_id": r["record_id"],
                    "character_name": r["data"].get("character_name"),
                    "death_age": r["data"].get("death_age"),
                    "life_score": r["data"].get("life_score"),
                    "final_title": r["data"].get("final_title"),
                    "achievements_count": r["data"].get("achievements_count"),
                    "total_money_earned": r["data"].get("total_money_earned"),
                    "created_at": r["data"].get("created_at"),
                }
                for r in redis_records
            ],
            "my_best": user_best,
        }
    except ConnectionError:
        logger.warning("Redis connection failed, falling back to database for leaderboard")
        return _fallback_get_top_scores(db, current_user, page, size)
    except TimeoutError:
        logger.warning("Redis timeout, falling back to database for leaderboard")
        return _fallback_get_top_scores(db, current_user, page, size)
    except Exception:
        logger.exception("Unexpected error in get_top_scores, falling back to database")
        return _fallback_get_top_scores(db, current_user, page, size)


@router.post("/sync")
async def sync_leaderboard_to_redis(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    lb_service: LeaderboardService = Depends(get_leaderboard_service),
):
    """Sync all leaderboard records from DB to Redis ZSET (for initialization).
    
    Requires authentication to prevent unauthorized sync operations.
    """
    try:
        all_records = db.query(LeaderboardRecord).all()
        count = await lb_service.sync_from_db(all_records)
        logger.info(f"Leaderboard synced by user {current_user.id}, records_synced={count}")
        return {"message": "Leaderboard synced", "records_synced": count}
    except ConnectionError as e:
        logger.error(f"Redis connection error during sync: {e}")
        raise HTTPException(status_code=503, detail="Redis服务不可用，请稍后重试")
    except TimeoutError as e:
        logger.error(f"Redis timeout during sync: {e}")
        raise HTTPException(status_code=504, detail="Redis服务超时，请稍后重试")
    except SQLAlchemyError as e:
        logger.error(f"Database error during leaderboard sync: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="数据库错误，请稍后重试")
    except Exception:
        logger.exception("Failed to sync leaderboard to Redis")
        raise HTTPException(status_code=500, detail="同步排行榜失败，请稍后重试")


@router.get("/my")
def get_my_scores(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get current user's best leaderboard records."""
    records = (
        db.query(LeaderboardRecord)
        .filter(LeaderboardRecord.user_id == current_user.id)
        .order_by(desc(LeaderboardRecord.life_score))
        .limit(10)
        .all()
    )

    return {
        "records": [
            {
                "id": r.id,
                "character_name": r.character_name,
                "death_age": r.death_age,
                "life_score": r.life_score,
                "final_title": r.final_title,
                "achievements_count": r.achievements_count,
                "total_money_earned": r.total_money_earned,
            }
            for r in records
        ],
    }


def _calculate_life_score(char: Character) -> float:
    """Calculate life score for a character using the scoring service."""
    return calculate_life_score({
        "age": char.death_age or char.age,
        "mood": (char.flags or {}).get("mood", 50),
        "education": (char.flags or {}).get("education", 0),
        "career": (char.flags or {}).get("career_level", 0),
        "money": char.total_money_earned or 0,
        "achievements": len((char.flags or {}).get("achievements", [])),
    })


def _fallback_get_top_scores(db: Session, current_user, page: int, size: int) -> dict:
    """Fallback to SQL query if Redis is unavailable."""
    total = db.query(LeaderboardRecord).count()
    records = (
        db.query(LeaderboardRecord)
        .order_by(desc(LeaderboardRecord.life_score))
        .offset((page - 1) * size)
        .limit(size)
        .all()
    )

    user_best = None
    user_rank = None
    if current_user:
        user_best_db = (
            db.query(LeaderboardRecord)
            .filter(LeaderboardRecord.user_id == current_user.id)
            .order_by(desc(LeaderboardRecord.life_score))
            .first()
        )
        if user_best_db:
            higher = db.query(LeaderboardRecord).filter(
                LeaderboardRecord.life_score > user_best_db.life_score
            ).count()
            user_rank = higher + 1
            user_best = {
                "score": user_best_db.life_score,
                "rank": user_rank,
            }

    return {
        "page": page,
        "size": size,
        "total": total,
        "pages": max(1, (total + size - 1) // size),
        "records": [
            {
                "rank": idx + 1 + (page - 1) * size,
                "record_id": r.id,
                "character_name": r.character_name,
                "death_age": r.death_age,
                "life_score": r.life_score,
                "final_title": r.final_title,
                "achievements_count": r.achievements_count,
                "total_money_earned": r.total_money_earned,
                "created_at": r.created_at.isoformat() if r.created_at else None,
            }
            for idx, r in enumerate(records)
        ],
        "my_best": user_best,
    }
