"""Announcement model for game admin announcements."""

from sqlalchemy import Column, Integer, String, JSON, DateTime, Text, Index
from sqlalchemy.sql import func

from ..database import Base


class Announcement(Base):
    __tablename__ = "announcements"
    __table_args__ = (
        Index('idx_announcement_status', 'status'),
        Index('idx_announcement_type', 'type'),
        Index('idx_announcement_created', 'created_at'),
    )

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    content = Column(Text, nullable=False)
    type = Column(String(20), nullable=False, default="info")  # info, warning, maintenance, event
    target_audience = Column(String(50), nullable=False, default="all")
    status = Column(String(20), nullable=False, default="draft")  # draft, scheduled, published, archived
    scheduled_at = Column(DateTime(timezone=True), nullable=True)
    published_at = Column(DateTime(timezone=True), nullable=True)
    created_by = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "content": self.content,
            "type": self.type,
            "target_audience": self.target_audience,
            "status": self.status,
            "scheduled_at": self.scheduled_at.isoformat() if self.scheduled_at else None,
            "published_at": self.published_at.isoformat() if self.published_at else None,
            "created_by": self.created_by,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
