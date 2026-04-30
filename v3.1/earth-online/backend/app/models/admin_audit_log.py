"""Admin Audit Log model for tracking administrative operations."""

from sqlalchemy import Column, Integer, String, JSON, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from ..database import Base


class AdminAuditLog(Base):
    __tablename__ = "admin_audit_logs"
    __table_args__ = (
        Index('idx_audit_user_action', 'user_id', 'action'),
        Index('idx_audit_table_record', 'table_name', 'record_id'),
        Index('idx_audit_timestamp', 'timestamp'),
    )

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    action = Column(String(50), nullable=False)  # CREATE, UPDATE, DELETE, LOGIN, LOGOUT, etc.
    table_name = Column(String(100), nullable=True)  # Which table was modified
    record_id = Column(Integer, nullable=True)  # Which record in the table
    old_values = Column(JSON, nullable=True)  # Values before change
    new_values = Column(JSON, nullable=True)  # Values after change
    ip_address = Column(String(50), nullable=True)  # Client IP address
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)

    user = relationship("User")

    def to_dict(self):
        """Convert model to dictionary for API responses."""
        return {
            "id": self.id,
            "user_id": self.user_id,
            "action": self.action,
            "table_name": self.table_name,
            "record_id": self.record_id,
            "old_values": self.old_values,
            "new_values": self.new_values,
            "ip_address": self.ip_address,
            "timestamp": self.timestamp.isoformat() if self.timestamp else None,
        }
