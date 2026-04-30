"""Export Task model for tracking async data export jobs."""

from sqlalchemy import Column, Integer, String, JSON, DateTime, Text, Index
from sqlalchemy.sql import func

from ..database import Base


class ExportTask(Base):
    __tablename__ = "export_tasks"
    __table_args__ = (
        Index('idx_export_type', 'export_type'),
        Index('idx_export_status', 'status'),
        Index('idx_export_created', 'created_at'),
    )

    id = Column(Integer, primary_key=True, index=True)
    export_type = Column(String(50), nullable=False)  # players, stats, logs
    filters = Column(JSON, nullable=True)  # export filter criteria
    fields = Column(JSON, nullable=True)  # fields to export
    status = Column(String(20), nullable=False, default="pending")  # pending, processing, completed, failed
    file_path = Column(String(500), nullable=True)
    file_size = Column(Integer, nullable=True)
    record_count = Column(Integer, nullable=True)
    error_message = Column(Text, nullable=True)
    created_by = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    completed_at = Column(DateTime(timezone=True), nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "export_type": self.export_type,
            "filters": self.filters,
            "fields": self.fields,
            "status": self.status,
            "file_path": self.file_path,
            "file_size": self.file_size,
            "record_count": self.record_count,
            "error_message": self.error_message,
            "created_by": self.created_by,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "completed_at": self.completed_at.isoformat() if self.completed_at else None,
        }
