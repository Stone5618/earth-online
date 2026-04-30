"""Leaderboard record model."""

from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Index
from sqlalchemy.orm import relationship
from datetime import datetime, timezone

from ..database import Base


class LeaderboardRecord(Base):
    __tablename__ = "leaderboard_records"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    character_name = Column(String(100), nullable=False)
    server_id = Column(Integer, ForeignKey("servers.id"), nullable=False)
    type = Column(String(50), nullable=False, default="life_score")
    death_age = Column(Float, nullable=False)
    life_score = Column(Float, nullable=False)
    score = Column(Float, nullable=False, default=0)
    final_title = Column(String(200), nullable=True)
    achievements_count = Column(Integer, default=0)
    total_money_earned = Column(Float, default=0)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User")
    server = relationship("Server")

    __table_args__ = (
        Index('idx_leaderboard_score', 'life_score'),
        Index('idx_leaderboard_user', 'user_id'),
        Index('idx_leaderboard_type', 'type'),
    )

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "character_name": self.character_name,
            "server_id": self.server_id,
            "type": self.type,
            "death_age": self.death_age,
            "life_score": self.life_score,
            "score": self.score,
            "final_title": self.final_title,
            "achievements_count": self.achievements_count,
            "total_money_earned": self.total_money_earned,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
