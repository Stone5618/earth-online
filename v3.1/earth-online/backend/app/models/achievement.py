"""Achievement and PlayerAchievement models for game achievements."""

from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, Index
from sqlalchemy.orm import relationship
from datetime import datetime, timezone

from ..database import Base


class Achievement(Base):
    __tablename__ = "achievements"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    icon = Column(String(200), nullable=True)
    category = Column(String(50), nullable=False, default="general")
    condition_type = Column(String(50), nullable=True)
    condition_value = Column(Integer, nullable=True)
    reward_description = Column(String(200), nullable=True)
    is_hidden = Column(Boolean, default=False)
    sort_order = Column(Integer, default=0)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    __table_args__ = (
        Index('idx_achievement_category', 'category'),
    )

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "icon": self.icon,
            "category": self.category,
            "condition_type": self.condition_type,
            "condition_value": self.condition_value,
            "reward_description": self.reward_description,
            "is_hidden": self.is_hidden,
            "sort_order": self.sort_order,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }


class PlayerAchievement(Base):
    __tablename__ = "player_achievements"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    achievement_id = Column(Integer, ForeignKey("achievements.id"), nullable=False)
    unlocked_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    notified = Column(Boolean, default=False)

    user = relationship("User")
    achievement = relationship("Achievement")

    __table_args__ = (
        Index('idx_player_achievement_user', 'user_id'),
        Index('idx_player_achievement_ach', 'achievement_id'),
        Index('idx_player_achievement_unique', 'user_id', 'achievement_id', unique=True),
    )

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "achievement_id": self.achievement_id,
            "unlocked_at": self.unlocked_at.isoformat() if self.unlocked_at else None,
            "notified": self.notified,
        }
