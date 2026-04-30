"""RBAC (Role-Based Access Control) models for admin panel."""

from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from ..database import Base


class AdminRole(Base):
    __tablename__ = "admin_roles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False, index=True)
    display_name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    level = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    users = relationship("User", back_populates="role")
    permissions = relationship(
        "AdminPermission",
        secondary="role_permissions",
        back_populates="roles",
    )

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "display_name": self.display_name,
            "description": self.description,
            "level": self.level,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class AdminPermission(Base):
    __tablename__ = "admin_permissions"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(100), unique=True, nullable=False, index=True)
    module = Column(String(50), nullable=False, index=True)
    action = Column(String(50), nullable=False, index=True)
    description = Column(Text, nullable=True)

    roles = relationship(
        "AdminRole",
        secondary="role_permissions",
        back_populates="permissions",
    )

    def to_dict(self):
        return {
            "id": self.id,
            "code": self.code,
            "module": self.module,
            "action": self.action,
            "description": self.description,
        }


class RolePermission(Base):
    __tablename__ = "role_permissions"

    role_id = Column(Integer, ForeignKey("admin_roles.id", ondelete="CASCADE"), primary_key=True)
    permission_id = Column(Integer, ForeignKey("admin_permissions.id", ondelete="CASCADE"), primary_key=True)

    __table_args__ = (
        Index('idx_role_permission', 'role_id', 'permission_id'),
    )
