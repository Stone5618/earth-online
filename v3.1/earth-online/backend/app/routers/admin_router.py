"""Admin router for event management, server control, player monitoring."""

from fastapi import APIRouter, Depends, HTTPException, Query, Request
from sqlalchemy import func as sa_func, and_, case
from sqlalchemy.orm import Session
from typing import Optional, Dict, List, Any
from datetime import datetime, timedelta, timezone
import json
import asyncio

from fastapi.responses import StreamingResponse
from ..database import get_db
from ..auth import get_current_admin, get_current_user
from ..models import User, EventTemplate, AdminAuditLog, ErrorLog
from ..schemas import EventTemplateSchema
from ..middleware.audit_middleware import log_audit_event
from ..cache import get_cache_manager
from pydantic import BaseModel, Field
import csv
import io

router = APIRouter(prefix="/api/v1/admin", tags=["admin"])


class BulkActionRequest(BaseModel):
    ids: list[int] = Field(min_length=1, max_length=100, description="Event IDs to operate on")


class BulkActionResponse(BaseModel):
    ok: bool
    affected: int
    failed_ids: list[int] = []


def get_client_ip(request: Request) -> Optional[str]:
    """Extract client IP address from request, supporting proxy headers."""
    client_ip = request.client.host if request.client else None
    forwarded_for = request.headers.get("x-forwarded-for")
    if forwarded_for:
        client_ip = forwarded_for.split(",")[0].strip()
    else:
        real_ip = request.headers.get("x-real-ip")
        if real_ip:
            client_ip = real_ip
    return client_ip


@router.get("/events")
def list_events(
    category: Optional[str] = None,
    min_age: Optional[int] = None,
    max_age: Optional[int] = None,
    is_active: Optional[bool] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    """List all event templates with optional filters."""
    # 如果没有事件数据，初始化默认数据
    from datetime import datetime
    existing_count = db.query(EventTemplate).count()
    if existing_count == 0:
        default_events = [
            {
                "title": "初入校园",
                "description": "开始你的学生生涯",
                "category": "education",
                "min_age": 6,
                "max_age": 12,
                "base_weight": 1.0,
                "difficulty_level": 0.2,
                "is_active": True,
                "created_at": datetime.now().isoformat()
            },
            {
                "title": "零花钱",
                "description": "获得第一笔零花钱",
                "category": "wealth",
                "min_age": 8,
                "max_age": 18,
                "base_weight": 1.2,
                "difficulty_level": 0.1,
                "is_active": True,
                "created_at": datetime.now().isoformat()
            },
            {
                "title": "健康检查",
                "description": "定期体检保持健康",
                "category": "health",
                "min_age": 10,
                "max_age": 100,
                "base_weight": 0.8,
                "difficulty_level": 0.3,
                "is_active": True,
                "created_at": datetime.now().isoformat()
            },
            {
                "title": "结交好友",
                "description": "建立珍贵的友谊",
                "category": "relationship",
                "min_age": 5,
                "max_age": 100,
                "base_weight": 1.5,
                "difficulty_level": 0.2,
                "is_active": True,
                "created_at": datetime.now().isoformat()
            }
        ]
        for event_data in default_events:
            event = EventTemplate(**event_data)
            db.add(event)
        db.commit()

    q = db.query(EventTemplate)

    if category:
        q = q.filter(EventTemplate.category == category)
    if min_age is not None:
        q = q.filter(EventTemplate.min_age >= min_age)
    if max_age is not None:
        q = q.filter(EventTemplate.max_age <= max_age)
    if is_active is not None:
        q = q.filter(EventTemplate.is_active == is_active)

    total = q.count()
    events = q.order_by(EventTemplate.category, EventTemplate.min_age).offset(skip).limit(limit).all()

    return {
        "total": total,
        "skip": skip,
        "limit": limit,
        "events": [e.to_dict() for e in events],
    }


@router.get("/events/{event_id}")
def get_event(event_id: int, db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):
    """Get a single event template."""
    ev = db.query(EventTemplate).filter(EventTemplate.id == event_id).first()
    if not ev:
        raise HTTPException(status_code=404, detail="Event not found")
    return ev


@router.post("/events")
def create_event(
    event: EventTemplateSchema,
    request: Request,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    """Create a new event template."""
    ev = EventTemplate(**event.model_dump(exclude_unset=True))
    db.add(ev)
    db.commit()
    db.refresh(ev)
    
    # Log the creation with IP
    log_audit_event(
        db=db,
        user_id=admin.id,
        action="CREATE",
        table_name="event_templates",
        record_id=ev.id,
        new_values=event.model_dump(exclude_unset=True),
        ip_address=get_client_ip(request),
    )
    
    return ev


@router.put("/events/{event_id}")
def update_event(
    event_id: int,
    event: EventTemplateSchema,
    request: Request,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    """Update an existing event template."""
    ev = db.query(EventTemplate).filter(EventTemplate.id == event_id).first()
    if not ev:
        raise HTTPException(status_code=404, detail="Event not found")
    
    # Store old values before updating
    old_values = {
        key: getattr(ev, key)
        for key in event.model_dump(exclude_unset=True).keys()
        if hasattr(ev, key)
    }

    for key, val in event.model_dump(exclude_unset=True).items():
        setattr(ev, key, val)

    db.commit()
    db.refresh(ev)
    
    # Log the update with IP
    log_audit_event(
        db=db,
        user_id=admin.id,
        action="UPDATE",
        table_name="event_templates",
        record_id=ev.id,
        old_values=old_values,
        new_values=event.model_dump(exclude_unset=True),
        ip_address=get_client_ip(request),
    )
    
    return ev


@router.delete("/events/{event_id}")
def delete_event(
    event_id: int,
    request: Request,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    """Delete an event template."""
    ev = db.query(EventTemplate).filter(EventTemplate.id == event_id).first()
    if not ev:
        raise HTTPException(status_code=404, detail="Event not found")
    
    # Store old values before deleting
    old_values = {
        col.name: getattr(ev, col.name)
        for col in EventTemplate.__table__.columns
    }
    
    db.delete(ev)
    db.commit()
    
    # Log the deletion with IP
    log_audit_event(
        db=db,
        user_id=admin.id,
        action="DELETE",
        table_name="event_templates",
        record_id=event_id,
        old_values=old_values,
        ip_address=get_client_ip(request),
    )
    
    return {"ok": True}


@router.post("/events/bulk-delete", response_model=BulkActionResponse)
def bulk_delete_events(
    body: BulkActionRequest,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    """Bulk delete event templates."""
    events = db.query(EventTemplate).filter(EventTemplate.id.in_(body.ids)).all()
    found_ids = {ev.id for ev in events}
    failed_ids = [eid for eid in body.ids if eid not in found_ids]

    # Store old values for audit
    for ev in events:
        old_values = {
            col.name: getattr(ev, col.name)
            for col in EventTemplate.__table__.columns
        }
        log_audit_event(
            db=db,
            user_id=admin.id,
            action="BULK_DELETE",
            table_name="event_templates",
            record_id=ev.id,
            old_values=old_values,
        )
        db.delete(ev)

    db.commit()
    return BulkActionResponse(ok=True, affected=len(events), failed_ids=failed_ids)


@router.post("/events/bulk-update", response_model=BulkActionResponse)
def bulk_update_events(
    body: BulkActionRequest,
    is_active: bool = Query(..., description="New active state for all events"),
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    """Bulk enable/disable event templates."""
    events = db.query(EventTemplate).filter(EventTemplate.id.in_(body.ids)).all()
    found_ids = {ev.id for ev in events}
    failed_ids = [eid for eid in body.ids if eid not in found_ids]

    affected = 0
    for ev in events:
        if ev.is_active != is_active:
            old_values = {"is_active": ev.is_active}
            ev.is_active = is_active
            affected += 1
            log_audit_event(
                db=db,
                user_id=admin.id,
                action="BULK_UPDATE",
                table_name="event_templates",
                record_id=ev.id,
                old_values=old_values,
                new_values={"is_active": is_active},
            )

    db.commit()
    return BulkActionResponse(ok=True, affected=affected, failed_ids=failed_ids)


@router.get("/characters")
def list_characters(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    """List all characters with user info."""
    from ..models import Character
    chars = db.query(Character).order_by(Character.id.desc()).offset(skip).limit(limit).all()
    total = db.query(Character).count()
    return {"total": total, "characters": [c.to_dict() for c in chars]}


@router.get("/stats")
def get_stats(db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):
    """Get server-wide statistics."""
    from ..models import Character
    total_chars = db.query(Character).count()
    alive_chars = db.query(Character).filter(Character.is_alive == True).count()
    avg_age = db.query(sa_func.avg(Character.age)).scalar() or 0
    total_events = db.query(EventTemplate).count()

    return {
        "total_characters": total_chars,
        "alive_characters": alive_chars,
        "average_age": round(float(avg_age), 1),
        "total_event_templates": total_events,
    }


@router.get("/audit-logs")
def list_audit_logs(
    user_id: Optional[int] = None,
    action: Optional[str] = None,
    table_name: Optional[str] = None,
    start_date: Optional[str] = Query(None, description="Start date (ISO format: YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date (ISO format: YYYY-MM-DD)"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=500),
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    """List audit logs with optional filters including date range."""
    query = db.query(AdminAuditLog)
    
    if user_id:
        query = query.filter(AdminAuditLog.user_id == user_id)
    if action:
        query = query.filter(AdminAuditLog.action == action.upper())
    if table_name:
        query = query.filter(AdminAuditLog.table_name == table_name)
    if start_date:
        try:
            start_dt = datetime.fromisoformat(start_date).replace(tzinfo=timezone.utc)
            query = query.filter(AdminAuditLog.timestamp >= start_dt)
        except ValueError:
            pass
    if end_date:
        try:
            end_dt = datetime.fromisoformat(end_date).replace(hour=23, minute=59, second=59, tzinfo=timezone.utc)
            query = query.filter(AdminAuditLog.timestamp <= end_dt)
        except ValueError:
            pass
    
    total = query.count()
    logs = query.order_by(AdminAuditLog.timestamp.desc()).offset(skip).limit(limit).all()
    
    result_logs = []
    for log in logs:
        log_dict = log.to_dict()
        log_dict["username"] = log.user.username if log.user else "unknown"
        result_logs.append(log_dict)
    
    return {
        "total": total,
        "skip": skip,
        "limit": limit,
        "logs": result_logs,
    }


@router.get("/audit-logs/stats")
async def get_audit_log_stats(
    days: int = Query(30, ge=1, le=365, description="Number of days to analyze"),
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    """Get audit log statistics for the specified period."""
    cutoff_date = datetime.now(timezone.utc) - timedelta(days=days)
    
    total_actions = await asyncio.to_thread(
        lambda: db.query(AdminAuditLog).filter(AdminAuditLog.timestamp >= cutoff_date).count()
    )
    
    actions_by_type = await asyncio.to_thread(
        lambda: db.query(AdminAuditLog.action, sa_func.count(AdminAuditLog.id))
            .filter(AdminAuditLog.timestamp >= cutoff_date)
            .group_by(AdminAuditLog.action)
            .all()
    )
    
    actions_by_table = await asyncio.to_thread(
        lambda: db.query(AdminAuditLog.table_name, sa_func.count(AdminAuditLog.id))
            .filter(AdminAuditLog.timestamp >= cutoff_date)
            .filter(AdminAuditLog.table_name.isnot(None))
            .group_by(AdminAuditLog.table_name)
            .all()
    )
    
    actions_by_day = await asyncio.to_thread(
        lambda: db.query(
            sa_func.date(AdminAuditLog.timestamp).label("date"),
            sa_func.count(AdminAuditLog.id)
        )
            .filter(AdminAuditLog.timestamp >= cutoff_date)
            .group_by("date")
            .order_by("date")
            .all()
    )
    
    top_users = await asyncio.to_thread(
        lambda: db.query(
            AdminAuditLog.user_id,
            sa_func.count(AdminAuditLog.id).label("action_count")
        )
            .filter(AdminAuditLog.timestamp >= cutoff_date)
            .group_by(AdminAuditLog.user_id)
            .order_by(sa_func.count(AdminAuditLog.id).desc())
            .limit(10)
            .all()
    )
    
    user_map = {}
    for user_id, _ in top_users:
        user = await asyncio.to_thread(db.query(User).filter(User.id == user_id).first)
        if user:
            user_map[user_id] = user.username
    
    return {
        "total_actions": total_actions,
        "period_days": days,
        "actions_by_type": [{"action": action, "count": count} for action, count in actions_by_type],
        "actions_by_table": [{"table": table, "count": count} for table, count in actions_by_table],
        "actions_by_day": [{"date": str(date), "count": count} for date, count in actions_by_day],
        "top_users": [{"user_id": uid, "username": user_map.get(uid, "unknown"), "count": cnt} for uid, cnt in top_users],
    }


@router.get("/audit-logs/export")
def export_audit_logs(
    user_id: Optional[int] = None,
    action: Optional[str] = None,
    table_name: Optional[str] = None,
    start_date: Optional[str] = Query(None, description="Start date (ISO format: YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date (ISO format: YYYY-MM-DD)"),
    limit: int = Query(10000, ge=1, le=100000),
    format: str = Query("csv", pattern="^(csv|json)$", description="Export format: csv or json"),
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    """Export audit logs to CSV or JSON format."""
    query = db.query(AdminAuditLog)
    
    if user_id:
        query = query.filter(AdminAuditLog.user_id == user_id)
    if action:
        query = query.filter(AdminAuditLog.action == action.upper())
    if table_name:
        query = query.filter(AdminAuditLog.table_name == table_name)
    if start_date:
        try:
            start_dt = datetime.fromisoformat(start_date).replace(tzinfo=timezone.utc)
            query = query.filter(AdminAuditLog.timestamp >= start_dt)
        except ValueError:
            pass
    if end_date:
        try:
            end_dt = datetime.fromisoformat(end_date).replace(hour=23, minute=59, second=59, tzinfo=timezone.utc)
            query = query.filter(AdminAuditLog.timestamp <= end_dt)
        except ValueError:
            pass
    
    logs = query.order_by(AdminAuditLog.timestamp.desc()).limit(limit).all()
    
    if format == "json":
        import json as json_module
        result_logs = []
        for log in logs:
            log_dict = log.to_dict()
            log_dict["username"] = log.user.username if log.user else "unknown"
            result_logs.append(log_dict)
        
        content = json_module.dumps(result_logs, indent=2, ensure_ascii=False)
        return StreamingResponse(
            io.StringIO(content),
            media_type="application/json",
            headers={"Content-Disposition": "attachment; filename=audit_logs.json"}
        )
    else:
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(["ID", "Username", "Action", "Table", "Record ID", "Old Values", "New Values", "IP Address", "Timestamp"])
        
        for log in logs:
            writer.writerow([
                log.id,
                log.user.username if log.user else "unknown",
                log.action,
                log.table_name or "",
                log.record_id or "",
                json.dumps(log.old_values, ensure_ascii=False) if log.old_values else "",
                json.dumps(log.new_values, ensure_ascii=False) if log.new_values else "",
                log.ip_address or "",
                log.timestamp.isoformat() if log.timestamp else "",
            ])
        
        output.seek(0)
        return StreamingResponse(
            output,
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=audit_logs.csv"}
        )


@router.get("/audit-logs/{log_id}")
def get_audit_log(
    log_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    """Get a single audit log entry with full details."""
    log = db.query(AdminAuditLog).filter(AdminAuditLog.id == log_id).first()
    if not log:
        raise HTTPException(status_code=404, detail="Audit log not found")
    
    result = log.to_dict()
    result["username"] = log.user.username if log.user else "unknown"
    return result


@router.get("/stats/realtime")
async def get_realtime_stats(db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):
    """Get real-time dashboard statistics with Redis caching (TTL 30 seconds)."""
    import traceback
    
    cache = get_cache_manager()
    cache_key = "stats:realtime"
    cached = None
    
    try:
        cached = await cache.get(cache_key)
        if cached:
            return cached
    except Exception as e:
        print(f"stats/realtime cache get ERROR: {e}")
        traceback.print_exc()
    
    from ..models import Character
    total_chars = alive_chars = today_new = today_events = 0
    
    try:
        total_chars = await asyncio.to_thread(db.query(Character).count)
        alive_chars = await asyncio.to_thread(db.query(Character).filter(Character.is_alive == True).count)
        
        today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
        today_new = await asyncio.to_thread(db.query(Character).filter(Character.created_at >= today_start).count)
        today_events = await asyncio.to_thread(db.query(Character).filter(Character.updated_at >= today_start).count)
    except Exception as e:
        print(f"stats/realtime query ERROR: {e}")
        traceback.print_exc()

    stats = {
        "total_characters": total_chars,
        "online_players": alive_chars,
        "today_new_characters": today_new,
        "today_events_triggered": today_events,
        "active_sessions": alive_chars,
    }
    
    try:
        await cache.set(cache_key, stats, ttl=30)
    except Exception as e:
        print(f"stats/realtime cache set ERROR: {e}")
        traceback.print_exc()
    
    return stats


@router.get("/stats/trends")
async def get_trends_stats(db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):
    """Get trend data for dashboard charts with Redis caching (TTL 60 seconds)."""
    cache = get_cache_manager()
    cache_key = "stats:trends"
    
    cached = await cache.get(cache_key)
    if cached:
        return cached
    
    try:
        from ..models import Character, EventTemplate
        
        # Generate real 7-day trend data from database
        seven_day_trends = []
        for i in range(7):
            day_date = datetime.now(timezone.utc) - timedelta(days=6-i)
            day_start = day_date.replace(hour=0, minute=0, second=0, microsecond=0)
            day_end = (day_start + timedelta(days=1))

            # Characters created on this day
            day_new = await asyncio.to_thread(
                db.query(Character).filter(
                    Character.created_at >= day_start,
                    Character.created_at < day_end,
                ).count
            )

            # Characters updated on this day (proxy for events triggered)
            day_events = await asyncio.to_thread(
                db.query(Character).filter(
                    Character.updated_at >= day_start,
                    Character.updated_at < day_end,
                ).count
            )

            seven_day_trends.append({
                "date": day_start.strftime("%Y-%m-%d"),
                "new_characters": day_new,
                "events_triggered": day_events,
            })
        
        # Category distribution
        categories = await asyncio.to_thread(
            lambda: db.query(EventTemplate.category, sa_func.count(EventTemplate.id))
                .group_by(EventTemplate.category)
                .all()
        )
        
        category_distribution = [{"category": cat, "count": count} for cat, count in categories]
        
        # Age distribution - single query with CASE WHEN instead of 4 separate COUNTs
        age_groups = await asyncio.to_thread(
            lambda: db.query(
                case(
                    (Character.age <= 18, "0-18"),
                    (Character.age <= 35, "19-35"),
                    (Character.age <= 55, "36-55"),
                    else_="56+"
                ).label("age_group"),
                sa_func.count(Character.id)
            ).group_by("age_group").all()
        )
        
        age_distribution = [{"age_group": ag, "count": cnt} for ag, cnt in age_groups]
    except Exception:
        seven_day_trends = []
        category_distribution = []
        age_distribution = []
    
    trends = {
        "seven_day_trends": seven_day_trends,
        "category_distribution": category_distribution,
        "age_distribution": age_distribution,
    }
    
    await cache.set(cache_key, trends, ttl=60)
    return trends


@router.get("/stats/events")
async def get_event_stats(db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):
    """Get event-related statistics with Redis caching (TTL 60 seconds)."""
    cache = get_cache_manager()
    cache_key = "stats:events"
    
    cached = await cache.get(cache_key)
    if cached:
        return cached
    
    from ..models import EventTemplate
    
    # Get event templates by difficulty
    difficulty_stats = await asyncio.to_thread(
        lambda: db.query(
            EventTemplate.difficulty_level,
            sa_func.count(EventTemplate.id)
        ).group_by(EventTemplate.difficulty_level).all()
    )
    
    # Convert difficulty levels to labels
    difficulty_distribution = []
    for level, count in difficulty_stats:
        if level < 0.3:
            label = "Easy"
        elif level < 0.7:
            label = "Medium"
        else:
            label = "Hard"
        difficulty_distribution.append({"level": label, "count": count})
    
    # Get age range coverage - fetch all templates once and count in Python
    all_templates = await asyncio.to_thread(
        lambda: db.query(EventTemplate.min_age, EventTemplate.max_age).all()
    )
    age_ranges = [
        ("0-5", 0, 5),
        ("6-12", 6, 12),
        ("13-18", 13, 18),
        ("19-35", 19, 35),
        ("36-55", 36, 55),
        ("56+", 56, 200),
    ]
    age_coverage = []
    for label, lo, hi in age_ranges:
        count = sum(1 for t in all_templates if t.min_age <= hi and t.max_age >= lo)
        age_coverage.append({"age_range": label, "count": count})
    
    # Get top events (placeholder - using weight as proxy for trigger count)
    top_events = await asyncio.to_thread(
        lambda: db.query(EventTemplate.id, EventTemplate.title, EventTemplate.base_weight)
            .order_by(EventTemplate.base_weight.desc())
            .limit(5)
            .all()
    )
    
    event_stats = {
        "difficulty_distribution": difficulty_distribution,
        "age_coverage": age_coverage,
        "top_events": [{"id": id, "title": title, "trigger_count": int(weight * 100)} for id, title, weight in top_events],
    }
    
    await cache.set(cache_key, event_stats, ttl=60)
    return event_stats


# --- Error Log Management ---

class ErrorStatusUpdateSchema(BaseModel):
    status: str = Field(pattern="^(open|investigating|resolved|ignored)$")


@router.get("/error-logs")
async def list_error_logs(
    level: Optional[str] = None,
    status: Optional[str] = None,
    start_date: Optional[str] = Query(None, description="Start date (ISO format: YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date (ISO format: YYYY-MM-DD)"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=500),
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    """List error logs with optional filters."""
    query = db.query(ErrorLog)
    
    if level:
        query = query.filter(ErrorLog.level == level.upper())
    if status:
        query = query.filter(ErrorLog.status == status.lower())
    if start_date:
        try:
            start_dt = datetime.fromisoformat(start_date).replace(tzinfo=timezone.utc)
            query = query.filter(ErrorLog.timestamp >= start_dt)
        except ValueError:
            pass
    if end_date:
        try:
            end_dt = datetime.fromisoformat(end_date).replace(hour=23, minute=59, second=59, tzinfo=timezone.utc)
            query = query.filter(ErrorLog.timestamp <= end_dt)
        except ValueError:
            pass
    
    total = query.count()
    logs = query.order_by(ErrorLog.timestamp.desc()).offset(skip).limit(limit).all()
    
    return {
        "total": total,
        "skip": skip,
        "limit": limit,
        "logs": [log.to_dict() for log in logs],
    }


@router.get("/error-logs/stats")
async def get_error_log_stats(
    days: int = Query(30, ge=1, le=365, description="Number of days to analyze"),
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    """Get error log statistics for the specified period."""
    cutoff_date = datetime.now(timezone.utc) - timedelta(days=days)
    
    total_errors = await asyncio.to_thread(
        lambda: db.query(ErrorLog).filter(ErrorLog.timestamp >= cutoff_date).count()
    )
    
    errors_by_level = await asyncio.to_thread(
        lambda: db.query(ErrorLog.level, sa_func.count(ErrorLog.id))
            .filter(ErrorLog.timestamp >= cutoff_date)
            .group_by(ErrorLog.level)
            .all()
    )
    
    errors_by_status = await asyncio.to_thread(
        lambda: db.query(ErrorLog.status, sa_func.count(ErrorLog.id))
            .filter(ErrorLog.timestamp >= cutoff_date)
            .group_by(ErrorLog.status)
            .all()
    )
    
    errors_by_day = await asyncio.to_thread(
        lambda: db.query(
            sa_func.date(ErrorLog.timestamp).label("date"),
            sa_func.count(ErrorLog.id)
        )
            .filter(ErrorLog.timestamp >= cutoff_date)
            .group_by("date")
            .order_by("date")
            .all()
    )
    
    top_paths = await asyncio.to_thread(
        lambda: db.query(
            ErrorLog.request_path,
            sa_func.count(ErrorLog.id).label("error_count")
        )
            .filter(ErrorLog.timestamp >= cutoff_date)
            .filter(ErrorLog.request_path.isnot(None))
            .group_by(ErrorLog.request_path)
            .order_by(sa_func.count(ErrorLog.id).desc())
            .limit(10)
            .all()
    )
    
    recent_errors = await asyncio.to_thread(
        lambda: db.query(ErrorLog)
            .filter(ErrorLog.timestamp >= cutoff_date)
            .order_by(ErrorLog.timestamp.desc())
            .limit(5)
            .all()
    )
    
    return {
        "total_errors": total_errors,
        "period_days": days,
        "errors_by_level": [{"level": level, "count": count} for level, count in errors_by_level],
        "errors_by_status": [{"status": status, "count": count} for status, count in errors_by_status],
        "errors_by_day": [{"date": str(date), "count": count} for date, count in errors_by_day],
        "top_paths": [{"path": path, "count": count} for path, count in top_paths],
        "recent_errors": [log.to_dict() for log in recent_errors],
    }


@router.get("/error-logs/{log_id}")
def get_error_log(
    log_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    """Get a single error log entry with full details."""
    log = db.query(ErrorLog).filter(ErrorLog.id == log_id).first()
    if not log:
        raise HTTPException(status_code=404, detail="Error log not found")
    return log.to_dict()


@router.patch("/error-logs/{log_id}/status")
def update_error_log_status(
    log_id: int,
    body: ErrorStatusUpdateSchema,
    request: Request,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    """Update the status of an error log."""
    log = db.query(ErrorLog).filter(ErrorLog.id == log_id).first()
    if not log:
        raise HTTPException(status_code=404, detail="Error log not found")
    
    old_status = log.status
    log.status = body.status.lower()
    
    if body.status in ("resolved", "ignored"):
        log.resolved_at = datetime.now(timezone.utc)
        log.resolved_by = admin.id
    
    db.commit()
    db.refresh(log)
    
    log_audit_event(
        db = db,
        user_id = admin.id,
        action = "UPDATE",
        table_name = "error_logs",
        record_id = log.id,
        old_values = {"status": old_status},
        new_values = {"status": log.status},
        ip_address = get_client_ip(request),
    )
    
    return log.to_dict()


# ==================== Player Management ====================

@router.get("/players")
def list_players(
    search: Optional[str] = Query(None, description="Search by username or email"),
    is_active: Optional[bool] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    """List all players with filters and pagination."""
    query = db.query(User)
    
    if search:
        query = query.filter(
            (User.username.contains(search)) |
            (User.email.contains(search))
        )
    
    if is_active is not None:
        query = query.filter(User.is_active == is_active)
    
    total = query.count()
    players = query.order_by(User.created_at.desc()).offset(skip).limit(limit).all()
    
    return {
        "total": total,
        "skip": skip,
        "limit": limit,
        "players": [
            {
                "id": p.id,
                "username": p.username,
                "email": p.email,
                "is_active": p.is_active,
                "is_superuser": p.is_superuser,
                "created_at": p.created_at.isoformat() if p.created_at else None,
                "role_id": p.role_id,
            }
            for p in players
        ]
    }


@router.get("/players/{player_id}")
def get_player(
    player_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    """Get a single player's details."""
    player = db.query(User).filter(User.id == player_id).first()
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")
    
    return {
        "id": player.id,
        "username": player.username,
        "email": player.email,
        "is_active": player.is_active,
        "is_superuser": player.is_superuser,
        "created_at": player.created_at.isoformat() if player.created_at else None,
        "role_id": player.role_id,
    }
