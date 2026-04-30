"""Content Management API for admin dashboard.

Manages achievements, announcements, leaderboards, and other game content.
"""

from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func as sa_func

from ..database import get_db
from ..auth import get_current_admin
from ..models import User, Announcement
from ..middleware.audit_middleware import log_audit_event

router = APIRouter(prefix="/api/v1/admin/content", tags=["admin-content-management"])


# ==================== Achievement Management ====================

@router.get("/achievements")
def list_achievements(
    category: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    """List all achievements, optionally filtered by category."""
    from ..models import Achievement
    
    query = db.query(Achievement)
    if category:
        query = query.filter(Achievement.category == category)
    
    total = query.count()
    achievements = query.order_by(Achievement.sort_order, Achievement.name).offset(skip).limit(limit).all()
    
    # If no achievements exist, seed default ones
    if len(achievements) == 0 and total == 0:
        defaults = [
            ("First Steps", "Complete your first year in life", "journey", "lifetime", 1, "Bronze", "bronze"),
            ("Social Butterfly", "Make your 10 social events", "social", "events", 10, "Silver", "silver"),
            ("Wealthy", "Reach 100000 total money", "wealth", "money", 100000, "Gold", "gold"),
            ("Collector", "Unlock 10 achievements", "achievement", "unlocks", 10, "Platinum", "platinum"),
        ]
        
        for name, desc, category, cond_type, cond_val, reward, icon in defaults:
            ach = Achievement(
                name=name,
                description=desc,
                category=category,
                condition_type=cond_type,
                condition_value=cond_val,
                reward_description=reward,
                icon=icon
            )
            db.add(ach)
        
        db.commit()
        achievements = db.query(Achievement).order_by(Achievement.sort_order, Achievement.name).offset(skip).limit(limit).all()
        total = db.query(Achievement).count()
    
    return {
        "total": total,
        "skip": skip,
        "limit": limit,
        "achievements": [a.to_dict() for a in achievements]
    }

# ==================== Achievement Stats ====================

@router.get("/achievements/stats")
def get_achievement_stats(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    """Get achievement unlock statistics."""
    from ..models import Achievement, PlayerAchievement

    all_achievements = db.query(Achievement).all()

    achievement_ids = [a.id for a in all_achievements]
    if not achievement_ids:
        return {"total_achievements": 0, "total_unlocks": 0, "achievements": []}

    unlock_counts = (
        db.query(
            PlayerAchievement.achievement_id,
            sa_func.count(PlayerAchievement.id).label("unlock_count")
        )
        .filter(PlayerAchievement.achievement_id.in_(achievement_ids))
        .group_by(PlayerAchievement.achievement_id)
        .all()
    )

    unlock_map = {uc.achievement_id: uc.unlock_count for uc in unlock_counts}
    total_unlocks = sum(unlock_map.values())

    achievements = []
    for a in all_achievements:
        a_dict = a.to_dict()
        a_dict["unlock_count"] = unlock_map.get(a.id, 0)
        a_dict["unlock_rate"] = round(unlock_map.get(a.id, 0) / max(total_unlocks, 1) * 100, 2)
        achievements.append(a_dict)

    return {
        "total_achievements": len(all_achievements),
        "total_unlocks": total_unlocks,
        "achievements": achievements,
    }


@router.get("/achievements/{achievement_id}")
def get_achievement(
    achievement_id: str,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    """Get single achievement detail with unlock statistics."""
    from ..models import Achievement, PlayerAchievement

    achievement = db.query(Achievement).filter(Achievement.id == achievement_id).first()
    if not achievement:
        raise HTTPException(status_code=404, detail="Achievement not found")

    unlock_count = db.query(PlayerAchievement).filter(
        PlayerAchievement.achievement_id == achievement_id
    ).count()

    result = achievement.to_dict()
    result["unlock_count"] = unlock_count
    return result


# ==================== Announcement Management ====================

@router.get("/announcements")
def list_announcements(
    status: Optional[str] = Query(None),
    type: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    """List all announcements with filters."""
    query = db.query(Announcement)
    if status:
        query = query.filter(Announcement.status == status)
    if type:
        query = query.filter(Announcement.type == type)

    total = query.count()
    announcements = query.order_by(Announcement.created_at.desc()).offset(skip).limit(limit).all()
    return {"total": total, "announcements": [a.to_dict() for a in announcements]}


@router.post("/announcements")
def create_announcement(
    body: dict,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    """Create a new announcement."""
    title = body.get("title")
    content = body.get("content")
    if not title or not content:
        raise HTTPException(status_code=400, detail="Title and content are required")

    ann = Announcement(
        title=title,
        content=content,
        type=body.get("type", "info"),
        target_audience=body.get("target_audience", "all"),
        status="draft",
        created_by=admin.id,
    )
    scheduled_at = body.get("scheduled_at")
    if scheduled_at:
        try:
            ann.scheduled_at = datetime.fromisoformat(scheduled_at)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid scheduled_at format")

    db.add(ann)
    db.commit()
    db.refresh(ann)

    log_audit_event(
        db=db,
        user_id=admin.id,
        action="CREATE",
        table_name="announcements",
        record_id=ann.id,
        new_values={"title": ann.title},
    )

    return ann.to_dict()


@router.get("/announcements/{announcement_id}")
def get_announcement(
    announcement_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    """Get single announcement detail."""
    ann = db.query(Announcement).filter(Announcement.id == announcement_id).first()
    if not ann:
        raise HTTPException(status_code=404, detail="Announcement not found")
    return ann.to_dict()


@router.patch("/announcements/{announcement_id}")
def update_announcement(
    announcement_id: int,
    body: dict,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    """Update an announcement."""
    ann = db.query(Announcement).filter(Announcement.id == announcement_id).first()
    if not ann:
        raise HTTPException(status_code=404, detail="Announcement not found")

    old_values = {"title": ann.title, "status": ann.status}

    if "title" in body:
        ann.title = body["title"]
    if "content" in body:
        ann.content = body["content"]
    if "type" in body:
        ann.type = body["type"]
    if "target_audience" in body:
        ann.target_audience = body["target_audience"]
    if "status" in body:
        ann.status = body["status"]
    if "scheduled_at" in body and body["scheduled_at"]:
        try:
            ann.scheduled_at = datetime.fromisoformat(body["scheduled_at"])
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid scheduled_at format")

    db.commit()
    db.refresh(ann)

    log_audit_event(
        db=db,
        user_id=admin.id,
        action="UPDATE",
        table_name="announcements",
        record_id=ann.id,
        old_values=old_values,
        new_values={"title": ann.title, "status": ann.status},
    )

    return ann.to_dict()


@router.delete("/announcements/{announcement_id}")
def delete_announcement(
    announcement_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    """Delete an announcement."""
    ann = db.query(Announcement).filter(Announcement.id == announcement_id).first()
    if not ann:
        raise HTTPException(status_code=404, detail="Announcement not found")

    db.delete(ann)
    db.commit()

    log_audit_event(
        db=db,
        user_id=admin.id,
        action="DELETE",
        table_name="announcements",
        record_id=announcement_id,
        old_values={"title": ann.title},
    )

    return {"message": "Announcement deleted"}


@router.post("/announcements/{announcement_id}/publish")
def publish_announcement(
    announcement_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    """Publish an announcement immediately."""
    ann = db.query(Announcement).filter(Announcement.id == announcement_id).first()
    if not ann:
        raise HTTPException(status_code=404, detail="Announcement not found")
    if ann.status not in ("draft", "scheduled"):
        raise HTTPException(status_code=400, detail="Only draft or scheduled announcements can be published")

    old_status = ann.status
    ann.status = "published"
    ann.published_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(ann)

    log_audit_event(
        db=db,
        user_id=admin.id,
        action="PUBLISH",
        table_name="announcements",
        record_id=ann.id,
        old_values={"status": old_status},
        new_values={"status": "published", "published_at": ann.published_at.isoformat()},
    )

    return ann.to_dict()


# ==================== Leaderboard Management ====================

@router.get("/leaderboards")
def list_leaderboards(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    """List all leaderboard types and their top entries."""
    from ..models import LeaderboardRecord

    types = db.query(LeaderboardRecord.type).distinct().all()
    result = []
    for (lb_type,) in types:
        top_entries = (
            db.query(LeaderboardRecord)
            .filter(LeaderboardRecord.type == lb_type)
            .order_by(LeaderboardRecord.score.desc())
            .limit(10)
            .all()
        )
        result.append({
            "type": lb_type,
            "entry_count": len(top_entries),
            "top_entries": [e.to_dict() for e in top_entries],
        })

    return {"leaderboards": result, "total": len(result)}


@router.get("/leaderboards/{lb_type}")
def get_leaderboard(
    lb_type: str,
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    """Get a specific leaderboard with pagination."""
    from ..models import LeaderboardRecord

    total = db.query(LeaderboardRecord).filter(LeaderboardRecord.type == lb_type).count()
    entries = (
        db.query(LeaderboardRecord)
        .filter(LeaderboardRecord.type == lb_type)
        .order_by(LeaderboardRecord.score.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )

    return {
        "type": lb_type,
        "total": total,
        "entries": [e.to_dict() for e in entries],
    }


# ==================== Event Template Management ====================

@router.get("/events")
def list_events(
    category: Optional[str] = None,
    is_active: Optional[bool] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    """List all event templates with filters and pagination."""
    from ..models import EventTemplate
    
    query = db.query(EventTemplate)
    if category:
        query = query.filter(EventTemplate.category == category)
    if is_active is not None:
        query = query.filter(EventTemplate.is_active == is_active)
    
    total = query.count()
    events = query.order_by(EventTemplate.title).offset(skip).limit(limit).all()
    
    return {
        "total": total,
        "skip": skip,
        "limit": limit,
        "events": [
            {
                "id": e.id,
                "title": e.title,
                "description": e.description,
                "category": e.category,
                "min_age": e.min_age,
                "max_age": e.max_age,
                "base_weight": e.base_weight,
                "difficulty_level": e.difficulty_level,
                "is_active": e.is_active,
                "created_at": e.created_at,
            }
            for e in events
        ]
    }


@router.get("/events/{event_id}")
def get_event(
    event_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    """Get a single event template with full details."""
    from ..models import EventTemplate
    
    event = db.query(EventTemplate).filter(EventTemplate.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    return {
        "id": event.id,
        "title": event.title,
        "description": event.description,
        "category": event.category,
        "min_age": event.min_age,
        "max_age": event.max_age,
        "required_culture_tags": event.required_culture_tags,
        "forbidden_culture_tags": event.forbidden_culture_tags,
        "required_attrs": event.required_attrs,
        "forbidden_attrs": event.forbidden_attrs,
        "required_flags": event.required_flags,
        "forbidden_flags": event.forbidden_flags,
        "base_weight": event.base_weight,
        "difficulty_level": event.difficulty_level,
        "choices": event.choices,
        "causality_effects": event.causality_effects,
        "is_active": event.is_active,
        "created_at": event.created_at,
    }
