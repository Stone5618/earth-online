"""Audit logging utilities for tracking administrative operations."""

from sqlalchemy.orm import Session
from typing import Optional, Any
import json

from ..models import AdminAuditLog


def log_audit_event(
    db: Session,
    user_id: int,
    action: str,
    table_name: Optional[str] = None,
    record_id: Optional[int] = None,
    old_values: Optional[dict] = None,
    new_values: Optional[dict] = None,
    ip_address: Optional[str] = None,
) -> AdminAuditLog:
    """
    Create and save an audit log entry.
    
    Args:
        db: Database session
        user_id: ID of the user performing the action
        action: Type of action (CREATE, UPDATE, DELETE, etc.)
        table_name: Name of the table affected
        record_id: ID of the record affected
        old_values: Values before the change
        new_values: Values after the change
        ip_address: Client IP address
        
    Returns:
        Created AdminAuditLog instance
    """
    # Convert values to JSON-serializable format
    def make_serializable(obj: Any) -> Any:
        if hasattr(obj, "__dict__"):
            return {k: v for k, v in obj.__dict__.items() if not k.startswith("_")}
        try:
            json.dumps(obj)
            return obj
        except (TypeError, OverflowError):
            return str(obj)
    
    old_serializable = make_serializable(old_values) if old_values else None
    new_serializable = make_serializable(new_values) if new_values else None
    
    audit_log = AdminAuditLog(
        user_id=user_id,
        action=action.upper(),
        table_name=table_name,
        record_id=record_id,
        old_values=old_serializable,
        new_values=new_serializable,
        ip_address=ip_address,
    )
    
    db.add(audit_log)
    # Note: Do NOT commit here. Audit log should be part of the calling transaction.
    # The caller will commit when the business operation succeeds.
    # If the business operation fails and rolls back, the audit log will be rolled back too.
    
    return audit_log