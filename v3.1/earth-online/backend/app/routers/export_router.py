"""Data Export API for admin dashboard."""

import csv
import io
import json
from datetime import datetime, timezone, timedelta
from pathlib import Path

from fastapi import APIRouter, Depends, Query, Request
from fastapi.responses import StreamingResponse
from ..rate_limiter import limiter
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func as sa_func

from ..database import get_db
from ..auth import get_current_admin
from ..models import User, AdminAuditLog, ErrorLog
from ..middleware.audit_middleware import log_audit_event

router = APIRouter(prefix="/api/v1/admin/export", tags=["admin-export"])

EXPORT_DIR = Path("exports")
EXPORT_DIR.mkdir(exist_ok=True)


def _export_players(
    filters: dict,
    fields: list[str],
    db: Session,
) -> str:
    from ..models import User as UserModel

    query = db.query(UserModel)
    if "is_active" in filters:
        query = query.filter(UserModel.is_active == filters["is_active"])
    if "is_superuser" in filters:
        query = query.filter(UserModel.is_superuser == filters["is_superuser"])

    users = query.order_by(UserModel.id).all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(fields)

    for user in users:
        row = []
        for field in fields:
            val = getattr(user, field, None)
            if isinstance(val, datetime):
                val = val.isoformat()
            row.append(val)
        writer.writerow(row)

    output.seek(0)
    return output.getvalue()


def _export_audit_logs(
    format_type: str,
    filters: dict,
    db: Session,
) -> tuple[str, str, str]:
    query = db.query(AdminAuditLog).options(joinedload(AdminAuditLog.user))
    if "user_id" in filters:
        query = query.filter(AdminAuditLog.user_id == filters["user_id"])
    if "action" in filters:
        query = query.filter(AdminAuditLog.action == filters["action"])
    if "table_name" in filters:
        query = query.filter(AdminAuditLog.table_name == filters["table_name"])
    if "start_date" in filters:
        try:
            start_dt = datetime.fromisoformat(filters["start_date"]).replace(tzinfo=timezone.utc)
            query = query.filter(AdminAuditLog.timestamp >= start_dt)
        except ValueError:
            pass
    if "end_date" in filters:
        try:
            end_dt = datetime.fromisoformat(filters["end_date"]).replace(hour=23, minute=59, second=59, tzinfo=timezone.utc)
            query = query.filter(AdminAuditLog.timestamp <= end_dt)
        except ValueError:
            pass

    logs = query.order_by(AdminAuditLog.timestamp.desc()).limit(50000).all()

    if format_type == "json":
        result_logs = []
        for log in logs:
            log_dict = log.to_dict()
            log_dict["username"] = log.user.username if log.user else "unknown"
            result_logs.append(log_dict)

        content = json.dumps(result_logs, indent=2, ensure_ascii=False)
        return "application/json", "audit_logs.json", content
    else:
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(["ID", "Username", "Action", "Table", "Record ID", "IP Address", "Timestamp"])

        for log in logs:
            writer.writerow([
                log.id,
                log.user.username if log.user else "unknown",
                log.action,
                log.table_name or "",
                log.record_id or "",
                log.ip_address or "",
                log.timestamp.isoformat() if log.timestamp else "",
            ])

        output.seek(0)
        return "text/csv; charset=utf-8", "audit_logs.csv", output.getvalue()


def _export_error_logs(
    filters: dict,
    db: Session,
) -> str:
    query = db.query(ErrorLog)
    if "level" in filters:
        query = query.filter(ErrorLog.level == filters["level"])
    if "status" in filters:
        query = query.filter(ErrorLog.status == filters["status"])

    logs = query.order_by(ErrorLog.timestamp.desc()).limit(20000).all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["ID", "Level", "Status", "Message", "Request Path", "IP Address", "Timestamp"])

    for log in logs:
        writer.writerow([
            log.id,
            log.level,
            log.status,
            log.message,
            log.request_path or "",
            log.ip_address or "",
            log.timestamp.isoformat() if log.timestamp else "",
        ])

    output.seek(0)
    return output.getvalue()


@router.post("/players")
@limiter.limit("3/minute")
def export_players(
    request: Request,
    body: dict,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    """Export player data to CSV."""
    filters = body.get("filters", {})
    fields = body.get("fields", ["id", "username", "email", "is_active", "is_superuser", "created_at"])

    content = _export_players(filters, fields, db)
    
    # Log audit event
    client_ip = request.client.host if request.client else None
    forwarded_for = request.headers.get("x-forwarded-for")
    if forwarded_for:
        client_ip = forwarded_for.split(",")[0].strip()
    
    log_audit_event(
        db=db,
        user_id=admin.id,
        action="EXPORT",
        table_name="users",
        new_values={"filters": filters, "fields": fields},
        ip_address=client_ip,
    )

    return StreamingResponse(
        io.StringIO(content),
        media_type="text/csv; charset=utf-8",
        headers={"Content-Disposition": "attachment; filename=players.csv"}
    )


@router.post("/audit-logs")
@limiter.limit("3/minute")
def export_audit_logs(
    request: Request,
    body: dict,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    """Export audit logs to CSV or JSON."""
    format_type = body.get("format", "csv")
    filters = body.get("filters", {})

    media_type, filename, content = _export_audit_logs(format_type, filters, db)
    
    # Log audit event
    client_ip = request.client.host if request.client else None
    forwarded_for = request.headers.get("x-forwarded-for")
    if forwarded_for:
        client_ip = forwarded_for.split(",")[0].strip()
    
    log_audit_event(
        db=db,
        user_id=admin.id,
        action="EXPORT",
        table_name="audit_logs",
        new_values={"filters": filters, "format": format_type},
        ip_address=client_ip,
    )

    return StreamingResponse(
        io.StringIO(content),
        media_type=media_type,
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


@router.post("/error-logs")
@limiter.limit("3/minute")
def export_error_logs(
    request: Request,
    body: dict,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    """Export error logs to CSV."""
    filters = body.get("filters", {})

    content = _export_error_logs(filters, db)
    
    # Log audit event
    client_ip = request.client.host if request.client else None
    forwarded_for = request.headers.get("x-forwarded-for")
    if forwarded_for:
        client_ip = forwarded_for.split(",")[0].strip()
    
    log_audit_event(
        db=db,
        user_id=admin.id,
        action="EXPORT",
        table_name="error_logs",
        new_values={"filters": filters},
        ip_address=client_ip,
    )

    return StreamingResponse(
        io.StringIO(content),
        media_type="text/csv; charset=utf-8",
        headers={"Content-Disposition": "attachment; filename=error_logs.csv"}
    )


@router.get("/tasks")
def list_export_tasks(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    """List export task history."""
    from ..models import ExportTask

    total = db.query(ExportTask).count()
    tasks = db.query(ExportTask).order_by(ExportTask.created_at.desc()).offset(skip).limit(limit).all()

    return {
        "total": total,
        "tasks": [task.to_dict() for task in tasks],
    }


@router.get("/tasks/{task_id}")
def get_export_task(
    task_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    """Get a single export task status."""
    from ..models import ExportTask

    task = db.query(ExportTask).filter(ExportTask.id == task_id).first()
    if not task:
        raise Exception("Export task not found")

    return task.to_dict()
