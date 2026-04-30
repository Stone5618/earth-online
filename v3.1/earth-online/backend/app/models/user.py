"""User model for authentication."""

from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime, timezone

from ..database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    hashed_password = Column(String(200), nullable=False)
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    role_id = Column(Integer, ForeignKey("admin_roles.id"), nullable=True)
    last_login_at = Column(DateTime(timezone=True), nullable=True)
    login_ip = Column(String(50), nullable=True)
    password_changed_at = Column(DateTime(timezone=True), nullable=True)
    is_locked = Column(Boolean, default=False)
    lock_reason = Column(String(200), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    # User profile fields
    avatar_color = Column(String(20), default="#3b82f6")
    display_name = Column(String(100), nullable=True)
    bio = Column(Text, nullable=True)
    failed_attempts = Column(Integer, default=0)
    remark = Column(String(500), nullable=True, comment="管理员备注")
    tags = Column(JSON, nullable=True, default=list, comment="玩家标签列表")
    deleted_at = Column(DateTime(timezone=True), nullable=True)

    role = relationship("AdminRole", back_populates="users")
    game_saves = relationship("GameSave", back_populates="user", cascade="all, delete-orphan")


class GameSave(Base):
    """Game save data model for persistent saves."""
    __tablename__ = "game_saves"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    slot = Column(Integer, nullable=False)  # 1, 2, 3
    save_data = Column(JSON, nullable=False)
    character_name = Column(String(100), nullable=True)
    age = Column(Integer, nullable=True)
    char_id = Column(Integer, nullable=True)  # 关联的角色ID，用于恢复游戏后获取事件
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="game_saves")
