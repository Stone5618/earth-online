"""Error Log model for tracking application errors and exceptions."""

from sqlalchemy import Column, Integer, String, JSON, DateTime, Text, Index
from sqlalchemy.sql import func

from ..database import Base
from ..utils.sanitizer import LogSanitizer


class ErrorLog(Base):
    __tablename__ = "error_logs"
    __table_args__ = (
        Index('idx_error_level', 'level'),
        Index('idx_error_timestamp', 'timestamp'),
        Index('idx_error_status', 'status'),
    )

    id = Column(Integer, primary_key=True, index=True)
    level = Column(String(20), nullable=False, default="ERROR")  # ERROR, WARNING, CRITICAL
    message = Column(String(500), nullable=False)
    stack_trace = Column(Text, nullable=True)
    request_path = Column(String(200), nullable=True)
    request_method = Column(String(10), nullable=True)
    user_id = Column(Integer, nullable=True)
    ip_address = Column(String(50), nullable=True)
    context = Column(JSON, nullable=True)
    status = Column(String(20), nullable=False, default="open")  # open, investigating, resolved, ignored
    resolved_at = Column(DateTime(timezone=True), nullable=True)
    resolved_by = Column(Integer, nullable=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)

    def to_dict(self):
        """Convert model to dictionary for API responses with sensitive data sanitized."""
        return {
            "id": self.id,
            "level": self.level,
            "message": self.message,
            "stack_trace": LogSanitizer.sanitize_stack_trace(self.stack_trace),
            "request_path": self.request_path,
            "request_method": self.request_method,
            "user_id": self.user_id,
            "ip_address": self.ip_address,
            "context": LogSanitizer.sanitize_context(self.context),
            "status": self.status,
            "resolved_at": self.resolved_at.isoformat() if self.resolved_at else None,
            "resolved_by": self.resolved_by,
            "timestamp": self.timestamp.isoformat() if self.timestamp else None,
        }
