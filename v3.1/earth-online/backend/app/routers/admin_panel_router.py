"""Admin panel RBAC management and user administration APIs."""

from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query, Request, Body
from sqlalchemy.orm import Session, joinedload, selectinload
from sqlalchemy import func as sa_func
from typing import Optional, List
import logging

from pydantic import BaseModel, Field, model_validator

from ..database import get_db
from ..auth import (
    get_current_user, get_current_admin, get_user_permissions,
    hash_password, verify_password, create_access_token,
)
from ..models import User, AdminRole, AdminPermission, RolePermission, AdminAuditLog
from ..seed_rbac import seed_rbac
from ..rate_limiter import limiter
from ..utils.password_validator import PasswordValidator

router = APIRouter(prefix="/api/v1/admin/panel", tags=["admin-panel"])


def escape_like_pattern(pattern: str) -> str:
    """Escape special characters for SQL LIKE queries."""
    return pattern.replace('\\', '\\\\').replace('%', '\\%').replace('_', '\\_')


# --- Auth endpoints for admin login ---

class LoginRequest(BaseModel):
    username: str
    password: str


class PasswordResetRequest(BaseModel):
    new_password: str = Field(..., min_length=8, max_length=128)
    
    @model_validator(mode='after')
    def validate_password(self):
        is_valid, message = PasswordValidator.validate(self.new_password)
        if not is_valid:
            raise ValueError(message)
        return self


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict


class UserMeResponse(BaseModel):
    id: int
    username: str
    is_superuser: bool
    role_name: Optional[str] = None
    role_display_name: Optional[str] = None
    permissions: list[str]


# --- Schemas for Role/Permission/User management ---

class RoleCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=50)
    display_name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None
    level: int = 0


class RoleUpdate(BaseModel):
    display_name: Optional[str] = None
    description: Optional[str] = None
    level: Optional[int] = None


class PermissionAssign(BaseModel):
    permission_ids: List[int]


class UserCreate(BaseModel):
    username: str = Field(..., min_length=1, max_length=50)
    password: str = Field(..., min_length=8, max_length=128)
    role_id: Optional[int] = None
    is_superuser: bool = False
    
    @model_validator(mode='after')
    def validate_password(self):
        is_valid, message = PasswordValidator.validate(self.password)
        if not is_valid:
            raise ValueError(message)
        return self


class UserUpdate(BaseModel):
    username: Optional[str] = None
    role_id: Optional[int] = None
    is_superuser: Optional[bool] = None
    is_active: Optional[bool] = None


class PlayerEditRequest(BaseModel):
    remark: Optional[str] = None
    tags: Optional[List[str]] = None


class ResetPlayerPasswordRequest(BaseModel):
    new_password: str = Field(..., min_length=8, max_length=128)
    
    @model_validator(mode='after')
    def validate_password(self):
        is_valid, message = PasswordValidator.validate(self.new_password)
        if not is_valid:
            raise ValueError(message)
        return self


class LockUserRequest(BaseModel):
    is_locked: bool = True


class ResetPasswordRequest(BaseModel):
    new_password: str = Field(..., min_length=8, max_length=128)
    
    @model_validator(mode='after')
    def validate_password(self):
        is_valid, message = PasswordValidator.validate(self.new_password)
        if not is_valid:
            raise ValueError(message)
        return self


class BatchUserUpdateRequest(BaseModel):
    user_ids: list[int] = Field(..., min_length=1, max_length=100)
    is_active: Optional[bool] = None
    is_locked: Optional[bool] = None


# ========================
# AUTH ENDPOINTS
# ========================

@router.post("/auth/login", response_model=LoginResponse)
@limiter.limit("5/minute")
def admin_login(
    request: Request,
    req: LoginRequest,
    db: Session = Depends(get_db),
):
    """Admin panel login."""
    user = db.query(User).options(joinedload(User.role)).filter(User.username == req.username).first()
    client_ip = request.client.host if request.client else None
    forwarded_for = request.headers.get("x-forwarded-for")
    if forwarded_for:
        client_ip = forwarded_for.split(",")[0].strip()
    else:
        real_ip = request.headers.get("x-real-ip")
        if real_ip:
            client_ip = real_ip

    if not user or not verify_password(req.password, user.hashed_password):
        raise HTTPException(401, "用户名或密码错误")
    if not user.is_active:
        raise HTTPException(401, "用户名或密码错误")
    if user.is_locked:
        raise HTTPException(401, "用户名或密码错误")

    user.last_login_at = datetime.now(timezone.utc)
    if client_ip:
        user.login_ip = client_ip

    from ..middleware.audit_middleware import log_audit_event
    log_audit_event(db=db, user_id=user.id, action="LOGIN", ip_address=client_ip)
    db.commit()

    token, _ = create_access_token({"sub": str(user.id)})
    perms = get_user_permissions(user, db)
    role_name = user.role.name if user.role else None
    role_display_name = user.role.display_name if user.role else None

    return LoginResponse(
        access_token=token,
        user={
            "id": user.id,
            "username": user.username,
            "is_superuser": user.is_superuser,
            "role_name": role_name,
            "role_display_name": role_display_name,
            "permissions": perms,
        },
    )


@router.get("/auth/me", response_model=UserMeResponse)
def get_me(current_user: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    """Get current user info and permissions."""
    perms = get_user_permissions(current_user, db)
    return UserMeResponse(
        id=current_user.id,
        username=current_user.username,
        is_superuser=current_user.is_superuser,
        role_name=current_user.role.name if current_user.role else None,
        role_display_name=current_user.role.display_name if current_user.role else None,
        permissions=perms,
    )


@router.post("/auth/seed-rbac")
def seed_default_rbac(current_user: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    """Seed default RBAC roles and permissions (superuser only)."""
    if not current_user.is_superuser:
        raise HTTPException(403, "Only superuser can seed RBAC data")
    roles = seed_rbac(db)
    db.commit()
    return {"ok": True, "roles": {name: role.to_dict() for name, role in roles.items()}}


# ========================
# PERMISSION ENDPOINTS
# ========================

@router.get("/permissions")
def list_permissions(current_user: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    """List all permissions, grouped by module."""
    perms = db.query(AdminPermission).order_by(AdminPermission.module, AdminPermission.code).all()
    return [p.to_dict() for p in perms]


# ========================
# ROLE ENDPOINTS
# ========================

@router.get("/roles")
def list_roles(
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
):
    """List roles with user count."""
    # 确保有默认角色数据
    from ..seed_rbac import seed_rbac
    seed_rbac(db)
    db.commit()
    
    total = db.query(sa_func.count(AdminRole.id)).scalar()
    roles = db.query(AdminRole).options(selectinload(AdminRole.permissions)).order_by(AdminRole.level.desc()).offset(skip).limit(limit).all()
    items = []
    for r in roles:
        items.append({
            "id": r.id,
            "name": r.name,
            "display_name": r.display_name,
            "description": r.description,
            "level": r.level,
            "created_at": r.created_at.isoformat() if r.created_at else None,
            "permissions": [p.code for p in r.permissions],
            "permission_count": len(r.permissions),
            "user_count": db.query(sa_func.count(User.id)).filter(User.role_id == r.id).scalar() or 0,
        })
    return {"total": total, "roles": items}


@router.post("/roles")
def create_role(
    data: RoleCreate,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """Create a new role."""
    existing = db.query(AdminRole).filter(AdminRole.name == data.name).first()
    if existing:
        raise HTTPException(400, f"角色名称 '{data.name}' 已存在")
    role = AdminRole(
        name=data.name,
        display_name=data.display_name,
        description=data.description,
        level=data.level,
    )
    db.add(role)
    db.commit()
    db.refresh(role)

    from ..middleware.audit_middleware import log_audit_event
    log_audit_event(db=db, user_id=current_user.id, action="CREATE", table_name="admin_roles", record_id=role.id)
    db.commit()
    return role.to_dict()


@router.put("/roles/{role_id}")
def update_role(
    role_id: int,
    data: RoleUpdate,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """Update a role."""
    role = db.query(AdminRole).filter(AdminRole.id == role_id).first()
    if not role:
        raise HTTPException(404, "角色不存在")
    if data.display_name is not None:
        role.display_name = data.display_name
    if data.description is not None:
        role.description = data.description
    if data.level is not None:
        role.level = data.level
    db.commit()
    db.refresh(role)

    from ..middleware.audit_middleware import log_audit_event
    log_audit_event(db=db, user_id=current_user.id, action="UPDATE", table_name="admin_roles", record_id=role_id)
    db.commit()
    return role.to_dict()


@router.delete("/roles/{role_id}")
def delete_role(
    role_id: int,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """Delete a role (only if no users assigned)."""
    role = db.query(AdminRole).filter(AdminRole.id == role_id).first()
    if not role:
        raise HTTPException(404, "角色不存在")
    user_count = db.query(sa_func.count(User.id)).filter(User.role_id == role_id).scalar() or 0
    if user_count > 0:
        raise HTTPException(400, f"角色 '{role.display_name}' 已被 {user_count} 个用户使用，无法删除")
    db.delete(role)
    db.commit()

    from ..middleware.audit_middleware import log_audit_event
    log_audit_event(db=db, user_id=current_user.id, action="DELETE", table_name="admin_roles", record_id=role_id)
    db.commit()
    return {"ok": True, "message": "角色已删除"}


@router.put("/roles/{role_id}/permissions")
def assign_permissions(
    role_id: int,
    data: list[str],  # 接收权限code数组
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """Assign permissions to a role (accepts permission codes)."""
    role = db.query(AdminRole).options(selectinload(AdminRole.permissions)).filter(AdminRole.id == role_id).first()
    if not role:
        raise HTTPException(404, "角色不存在")
    
    all_perms = db.query(AdminPermission).filter(AdminPermission.code.in_(data)).all()
    found_codes = {p.code for p in all_perms}
    missing = set(data) - found_codes
    if missing:
        raise HTTPException(400, f"权限 code {list(missing)} 不存在")
    
    role.permissions = all_perms
    db.commit()
    db.refresh(role)

    from ..middleware.audit_middleware import log_audit_event
    log_audit_event(db=db, user_id=current_user.id, action="UPDATE", table_name="admin_roles", record_id=role_id,
                     new_values={"permission_codes": data})
    db.commit()
    return {"ok": True, "assigned": len(all_perms)}


# ========================
# USER (ADMIN) ENDPOINTS
# ========================

@router.get("/users")
def list_admin_users(
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
):
    """List admin users with role info."""
    # 确保有默认管理员用户
    from ..seed_rbac import seed_rbac
    from ..auth import hash_password
    seed_rbac(db)
    
    # 创建默认管理员用户
    existing_admin = db.query(User).filter(User.username == "admin").first()
    if not existing_admin:
        super_admin_role = db.query(AdminRole).filter(AdminRole.name == "super_admin").first()
        admin_user = User(
            username="admin",
            hashed_password=hash_password("admin123"),
            email="admin@earthonline.com",
            is_superuser=True,
            is_active=True,
            role_id=super_admin_role.id if super_admin_role else None
        )
        db.add(admin_user)
        db.commit()
    
    query = db.query(User).options(selectinload(User.role))
    # 管理员列表：只显示有角色或是超级管理员的用户
    query = query.filter((User.role_id.isnot(None)) | (User.is_superuser == True))
    if search:
        safe_search = escape_like_pattern(search)
        query = query.filter(User.username.ilike(f"%{safe_search}%"))
    total = query.count()
    users = query.order_by(User.created_at.desc()).offset(skip).limit(limit).all()
    items = []
    for u in users:
        items.append({
            "id": u.id,
            "username": u.username,
            "is_superuser": u.is_superuser,
            "is_active": u.is_active,
            "is_locked": u.is_locked,
            "lock_reason": u.lock_reason,
            "role_id": u.role_id,
            "role_name": u.role.name if u.role else None,
            "role_display_name": u.role.display_name if u.role else None,
            "last_login_at": u.last_login_at.isoformat() if u.last_login_at else None,
            "login_ip": u.login_ip,
            "created_at": u.created_at.isoformat() if u.created_at else None,
        })
    return {"total": total, "users": items}


@router.post("/users")
@limiter.limit("10/minute")
def create_admin_user(
    request: Request,
    data: UserCreate,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """Create a new admin user."""
    existing = db.query(User).filter(User.username == data.username).first()
    if existing:
        raise HTTPException(400, f"用户名 '{data.username}' 已存在")
    if data.role_id:
        role = db.query(AdminRole).filter(AdminRole.id == data.role_id).first()
        if not role:
            raise HTTPException(400, "指定的角色不存在")
    user = User(
        username=data.username,
        hashed_password=hash_password(data.password),
        role_id=data.role_id,
        is_superuser=data.is_superuser,
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    from ..middleware.audit_middleware import log_audit_event
    log_audit_event(db=db, user_id=current_user.id, action="CREATE", table_name="users", record_id=user.id)
    db.commit()
    return {"id": user.id, "username": user.username, "is_superuser": user.is_superuser}


@router.put("/users/{user_id}")
def update_admin_user(
    user_id: int,
    data: UserUpdate,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """Update an admin user."""
    if user_id == current_user.id and data.is_active is False:
        raise HTTPException(400, "不能停用自己")
    if user_id == current_user.id and data.is_superuser is False:
        raise HTTPException(400, "不能取消自己的超级管理员权限")

    user = db.query(User).options(selectinload(User.role)).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(404, "用户不存在")
    if data.username is not None:
        existing = db.query(User).filter(User.username == data.username, User.id != user_id).first()
        if existing:
            raise HTTPException(400, f"用户名 '{data.username}' 已被使用")
        user.username = data.username
    if data.role_id is not None:
        if data.role_id:
            role = db.query(AdminRole).filter(AdminRole.id == data.role_id).first()
            if not role:
                raise HTTPException(400, "指定的角色不存在")
        user.role_id = data.role_id
    if data.is_superuser is not None:
        user.is_superuser = data.is_superuser
    if data.is_active is not None:
        user.is_active = data.is_active
    db.commit()

    from ..middleware.audit_middleware import log_audit_event
    log_audit_event(db=db, user_id=current_user.id, action="UPDATE", table_name="users", record_id=user_id,
                     new_values={"is_active": user.is_active, "is_superuser": user.is_superuser, "role_id": user.role_id})
    db.commit()

    # Reload user with role relationship for response
    user = db.query(User).options(selectinload(User.role)).filter(User.id == user_id).first()
    return {
        "id": user.id, "username": user.username,
        "is_active": user.is_active, "is_superuser": user.is_superuser,
        "is_locked": user.is_locked, "role_id": user.role_id,
        "role_name": user.role.name if user.role else None,
        "role_display_name": user.role.display_name if user.role else None,
    }


@router.put("/users/{user_id}/lock")
def lock_admin_user(
    user_id: int,
    data: LockUserRequest,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """Lock or unlock an admin user."""
    if user_id == current_user.id:
        raise HTTPException(400, "不能锁定/解锁自己")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(404, "用户不存在")
    user.is_locked = data.is_locked
    user.failed_attempts = 0
    if not data.is_locked:
        user.lock_reason = None
    db.commit()
    db.refresh(user)

    from ..middleware.audit_middleware import log_audit_event
    log_audit_event(db=db, user_id=current_user.id, action="LOCK", table_name="users", record_id=user_id,
                     new_values={"is_locked": user.is_locked})

    return {
        "id": user.id, "username": user.username,
        "is_active": user.is_active, "is_superuser": user.is_superuser,
        "is_locked": user.is_locked, "lock_reason": user.lock_reason,
        "role_id": user.role_id, "role_name": user.role.name if user.role else None,
        "role_display_name": user.role.display_name if user.role else None,
        "last_login_at": user.last_login_at.isoformat() if user.last_login_at else None,
        "created_at": user.created_at.isoformat() if user.created_at else None,
    }


@router.put("/users/{user_id}/reset-password")
@limiter.limit("5/minute")
def reset_admin_password(
    request: Request,
    user_id: int,
    data: ResetPasswordRequest,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """Reset an admin user's password."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(404, "用户不存在")
    user.hashed_password = hash_password(data.new_password)
    user.password_changed_at = datetime.now(timezone.utc)
    user.failed_attempts = 0
    user.is_locked = False
    user.lock_reason = None
    db.commit()

    from ..middleware.audit_middleware import log_audit_event
    log_audit_event(db=db, user_id=current_user.id, action="UPDATE", table_name="users", record_id=user_id,
                     new_values={"password_reset": True})
    db.commit()
    return {"ok": True, "message": "密码已重置"}


@router.put("/users/batch")
def batch_update_users(
    data: BatchUserUpdateRequest,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """Batch update user status (activate/deactivate, lock/unlock)."""
    if data.is_active is None and data.is_locked is None:
        raise HTTPException(400, "至少需要指定 is_active 或 is_locked")
    
    users = db.query(User).filter(User.id.in_(data.user_ids)).all()
    if not users:
        raise HTTPException(404, "未找到指定的用户")
    
    updated = 0
    for user in users:
        if data.is_active is not None and user.is_active != data.is_active:
            user.is_active = data.is_active
            updated += 1
        if data.is_locked is not None:
            user.is_locked = data.is_locked
            if data.is_locked:
                user.lock_reason = user.lock_reason or "管理员批量操作"
            else:
                user.lock_reason = None
                user.failed_attempts = 0
            updated += 1
    
    db.commit()
    return {"ok": True, "message": f"已更新 {len(users)} 个用户", "updated_count": updated}


# ========================
# PLAYER ENDPOINTS
# ========================

@router.get("/players")
def list_players(
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    is_banned: Optional[bool] = None,
):
    """List all players (users without admin roles)."""
    query = db.query(User).filter(User.role_id.is_(None), User.is_superuser == False)
    if search:
        safe_search = escape_like_pattern(search)
        query = query.filter(User.username.ilike(f"%{safe_search}%"))
    if is_banned is not None:
        query = query.filter(User.is_active != is_banned)
    total = query.count()
    users = query.order_by(User.created_at.desc()).offset(skip).limit(limit).all()

    items = []
    for u in users:
        # Mask IP for privacy: show last two octets only (e.g., 192.168.*.*)
        masked_ip = None
        if u.login_ip:
            parts = u.login_ip.split('.')
            if len(parts) == 4:
                masked_ip = f"{parts[0]}.{parts[1]}.*.*"
            else:
                masked_ip = "*.*.*.*"

        # Get character stats for this user
        character_count = 0
        alive_characters = 0
        dead_characters = 0
        main_character = None
        try:
            from ..models import Character
            chars = db.query(Character).filter(Character.user_id == u.id).all()
            character_count = len(chars)
            alive_characters = sum(1 for c in chars if c.is_alive)
            dead_characters = sum(1 for c in chars if not c.is_alive)
            if chars:
                main_char = chars[0]
                main_character = {
                    "id": main_char.id,
                    "name": main_char.name,
                    "age": int(main_char.age),
                    "is_alive": main_char.is_alive,
                }
        except Exception:
            pass

        items.append({
            "id": u.id,
            "username": u.username,
            "display_name": u.display_name,
            "is_active": u.is_active,
            "is_banned": not u.is_active,
            "login_ip": masked_ip,
            "last_login_at": u.last_login_at.isoformat() if u.last_login_at else None,
            "created_at": u.created_at.isoformat() if u.created_at else None,
            "remark": u.remark,
            "tags": u.tags or [],
            "character_count": character_count,
            "alive_characters": alive_characters,
            "dead_characters": dead_characters,
            "main_character": main_character,
        })
    return {"items": items, "total": total, "skip": skip, "limit": limit}


@router.get("/players/{player_id}")
def get_player_detail(
    player_id: int,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """Get player detail with all characters."""
    player = db.query(User).filter(User.id == player_id).first()
    if not player:
        raise HTTPException(404, "玩家不存在")

    characters = []
    try:
        from ..models import Character
        chars = db.query(Character).filter(Character.user_id == player_id).all()

        for c in chars:
            characters.append({
                "id": c.id,
                "name": c.name,
                "age": int(c.age),
                "is_alive": c.is_alive,
                "health": c.health,
                "money": c.money,
                "occupation": c.occupation or "无业",
                "education_level": c.education_level or "未上学",
                "family_tier": c.family_tier,
                "death_reason": c.death_reason,
                "death_age": c.death_age,
                "final_title": c.final_title,
                "server_id": c.server_id,
            })
    except SQLAlchemyError as e:
        logger.error(f"Database error loading characters for player {player_id}: {str(e)}", exc_info=True)
    except Exception:
        logger.exception(f"Unexpected error loading characters for player {player_id}")

    return {
        "id": player.id,
        "username": player.username,
        "display_name": player.display_name,
        "bio": player.bio,
        "avatar_color": player.avatar_color,
        "is_active": player.is_active,
        "is_banned": not player.is_active,
        "login_ip": player.login_ip,
        "last_login_at": player.last_login_at.isoformat() if player.last_login_at else None,
        "created_at": player.created_at.isoformat() if player.created_at else None,
        "characters": characters,
    }


@router.put("/players/{player_id}/ban")
def ban_player(
    player_id: int,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """Ban a player (set is_active to False)."""
    player = db.query(User).filter(User.id == player_id).first()
    if not player:
        raise HTTPException(404, "玩家不存在")
    if player.is_superuser or player.role_id:
        raise HTTPException(400, "不能封禁管理员")
    player.is_active = False
    db.commit()

    from ..middleware.audit_middleware import log_audit_event
    log_audit_event(db=db, user_id=current_user.id, action="BAN", table_name="users", record_id=player_id)
    db.commit()
    return {"ok": True, "message": "玩家已封禁"}


@router.put("/players/{player_id}/unban")
def unban_player(
    player_id: int,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """Unban a player (set is_active to True)."""
    player = db.query(User).filter(User.id == player_id).first()
    if not player:
        raise HTTPException(404, "玩家不存在")
    player.is_active = True
    db.commit()

    from ..middleware.audit_middleware import log_audit_event
    log_audit_event(db=db, user_id=current_user.id, action="UNBAN", table_name="users", record_id=player_id)
    db.commit()
    return {"ok": True, "message": "玩家已解封"}


@router.put("/players/batch")
def batch_ban_players(
    ban: bool = Body(..., embed=True),
    player_ids: list[int] = Body(..., embed=True, min_length=1, max_length=100),
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """Batch ban or unban players."""
    players = db.query(User).filter(
        User.id.in_(player_ids),
        User.is_superuser == False,
        User.role_id.is_(None)
    ).all()
    if not players:
        raise HTTPException(404, "未找到指定的玩家")
    
    updated = 0
    for player in players:
        if player.is_active != (not ban):
            player.is_active = not ban
            updated += 1
    
    db.commit()
    
    from ..middleware.audit_middleware import log_audit_event
    action = "BAN" if ban else "UNBAN"
    for p in players:
        log_audit_event(db=db, user_id=current_user.id, action=action, table_name="users", record_id=p.id)
    db.commit()
    
    return {"ok": True, "message": f"已{action.lower()} {len(players)} 个玩家", "updated_count": updated}


@router.put("/players/{player_id}/edit")
def edit_player(
    player_id: int,
    body: PlayerEditRequest,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """Edit player remark and tags."""
    player = db.query(User).filter(User.id == player_id).first()
    if not player:
        raise HTTPException(404, "玩家不存在")
    if player.is_superuser or player.role_id:
        raise HTTPException(400, "不能编辑管理员")

    if body.remark is not None:
        player.remark = body.remark
    if body.tags is not None:
        player.tags = body.tags

    db.commit()

    from ..middleware.audit_middleware import log_audit_event
    log_audit_event(db=db, user_id=current_user.id, action="EDIT", table_name="users", record_id=player_id,
                     new_values={"remark": player.remark, "tags": player.tags})
    db.commit()
    return {"ok": True, "message": "玩家信息已更新", "remark": player.remark, "tags": player.tags or []}


@router.put("/players/{player_id}/reset-password")
@limiter.limit("5/minute")
def reset_player_password(
    request: Request,
    player_id: int,
    body: ResetPlayerPasswordRequest,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """Reset a player's password."""
    player = db.query(User).filter(User.id == player_id).first()
    if not player:
        raise HTTPException(404, "玩家不存在")
    if player.is_superuser or player.role_id:
        raise HTTPException(400, "不能重置管理员密码")

    player.hashed_password = hash_password(body.new_password)
    player.failed_attempts = 0
    player.is_locked = False
    player.lock_reason = None
    player.password_changed_at = datetime.now(timezone.utc)
    db.commit()

    from ..middleware.audit_middleware import log_audit_event
    log_audit_event(db=db, user_id=current_user.id, action="RESET_PASSWORD", table_name="users", record_id=player_id)
    db.commit()
    return {"ok": True, "message": "玩家密码已重置"}


@router.get("/players/{player_id}/saves")
def list_player_saves(
    player_id: int,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """List all game saves for a player."""
    player = db.query(User).filter(User.id == player_id).first()
    if not player:
        raise HTTPException(404, "玩家不存在")

    from ..models import GameSave
    saves = db.query(GameSave).filter(GameSave.user_id == player_id).all()

    return {
        "saves": [
            {
                "id": s.id,
                "slot": s.slot,
                "character_name": s.character_name,
                "age": s.age,
                "created_at": s.created_at.isoformat() if s.created_at else None,
                "updated_at": s.updated_at.isoformat() if s.updated_at else None,
            }
            for s in saves
        ],
        "total": len(saves),
    }


@router.delete("/players/{player_id}/saves/{save_id}")
def delete_player_save(
    player_id: int,
    save_id: int,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """Delete a player's game save."""
    from ..models import GameSave
    save = db.query(GameSave).filter(GameSave.id == save_id, GameSave.user_id == player_id).first()
    if not save:
        raise HTTPException(404, "存档不存在")

    db.delete(save)
    db.commit()

    from ..middleware.audit_middleware import log_audit_event
    log_audit_event(db=db, user_id=current_user.id, action="DELETE_SAVE", table_name="game_saves", record_id=save_id)
    db.commit()
    return {"ok": True, "message": "存档已删除"}


# ========================
# SYSTEM CONFIG
# ========================

class ConfigItemSchema(BaseModel):
    key: str = Field(min_length=1, max_length=100)
    value: str
    category: str = Field(default="general", max_length=50)
    description: str = Field(default="", max_length=500)
    is_active: bool = Field(default=True)

class BatchConfigUpdate(BaseModel):
    configs: list[dict[str, str]] = Field(min_length=1)

@router.get("/configs")
def list_configs(
    category: Optional[str] = None,
    is_active: Optional[bool] = None,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """List all system configurations, optionally filtered by category."""
    from ..models import SystemConfig
    q = db.query(SystemConfig)
    if category:
        q = q.filter(SystemConfig.category == category)
    if is_active is not None:
        q = q.filter(SystemConfig.is_active == is_active)
    
    configs = q.order_by(SystemConfig.category, SystemConfig.key).all()
    
    # If no configs exist, seed default ones
    if len(configs) == 0:
        defaults = [
            ("game.enabled", "true", "game", "Whether the game is globally enabled"),
            ("game.max_players", "10000", "game", "Maximum number of active players"),
            ("game.event_trigger_multiplier", "1.0", "game", "Event trigger rate multiplier"),
            ("cache.enabled", "true", "cache", "Whether caching is enabled"),
            ("cache.default_ttl", "300", "cache", "Default cache TTL in seconds"),
            ("feature.leaderboard", "true", "feature", "Enable leaderboard feature"),
            ("feature.achievements", "true", "feature", "Enable achievements feature"),
            ("feature.social", "true", "feature", "Enable social features"),
        ]
        
        for key, value, category, desc in defaults:
            cfg = SystemConfig(key=key, value=value, category=category, description=desc)
            db.add(cfg)
        
        db.commit()
        configs = db.query(SystemConfig).order_by(SystemConfig.category, SystemConfig.key).all()
    
    return {
        "configs": [c.to_dict() for c in configs],
        "total": len(configs),
    }


@router.get("/configs/{key}")
def get_config(
    key: str,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """Get a single configuration value."""
    from ..models import SystemConfig
    cfg = db.query(SystemConfig).filter(SystemConfig.key == key).first()
    if not cfg:
        raise HTTPException(status_code=404, detail=f"Config '{key}' not found")
    return cfg.to_dict()


@router.post("/configs")
def create_config(
    body: ConfigItemSchema,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """Create a new configuration item."""
    from ..models import SystemConfig
    import json
    
    existing = db.query(SystemConfig).filter(SystemConfig.key == body.key).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Config '{body.key}' already exists")
    
    # Serialize value to JSON string
    if isinstance(body.value, (dict, list, bool)):
        value_str = json.dumps(body.value)
    elif isinstance(body.value, str):
        try:
            json.loads(body.value)
            value_str = body.value
        except (json.JSONDecodeError, ValueError):
            value_str = json.dumps(body.value)
    else:
        value_str = json.dumps(body.value)
    
    cfg = SystemConfig(
        key=body.key,
        value=value_str,
        category=body.category,
        description=body.description,
        is_active=body.is_active,
    )
    db.add(cfg)
    db.commit()
    db.refresh(cfg)
    
    from ..middleware.audit_middleware import log_audit_event
    log_audit_event(
        db=db, user_id=current_user.id, action="CREATE", table_name="system_config", record_id=cfg.id,
        new_values={"key": cfg.key, "value": body.value, "category": cfg.category}
    )
    return cfg.to_dict()


@router.put("/configs/{config_id}")
def update_config(
    config_id: int,
    body: ConfigItemSchema,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """Update a configuration item by ID."""
    from ..models import SystemConfig
    import json
    
    cfg = db.query(SystemConfig).filter(SystemConfig.id == config_id).first()
    if not cfg:
        raise HTTPException(status_code=404, detail="Config not found")
    
    # Serialize value to JSON string
    if isinstance(body.value, (dict, list, bool)):
        value_str = json.dumps(body.value)
    elif isinstance(body.value, str):
        try:
            json.loads(body.value)
            value_str = body.value
        except (json.JSONDecodeError, ValueError):
            value_str = json.dumps(body.value)
    else:
        value_str = json.dumps(body.value)
    
    old_values = {
        "value": cfg.value,
        "category": cfg.category,
        "description": cfg.description,
        "is_active": cfg.is_active,
    }
    
    cfg.value = value_str
    cfg.category = body.category
    cfg.description = body.description
    cfg.is_active = body.is_active
    cfg.updated_at = datetime.now(timezone.utc)
    
    db.commit()
    db.refresh(cfg)
    
    from ..middleware.audit_middleware import log_audit_event
    log_audit_event(
        db=db, user_id=current_user.id, action="UPDATE", table_name="system_config", record_id=cfg.id,
        old_values=old_values, new_values={"key": cfg.key, "value": body.value, "category": cfg.category}
    )
    
    return cfg.to_dict()


@router.delete("/configs/{key}")
def delete_config(
    key: str,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """Delete a configuration item."""
    from ..models import SystemConfig
    cfg = db.query(SystemConfig).filter(SystemConfig.key == key).first()
    if not cfg:
        raise HTTPException(status_code=404, detail=f"Config '{key}' not found")
    
    old_values = cfg.to_dict()
    db.delete(cfg)
    db.commit()
    
    from ..middleware.audit_middleware import log_audit_event
    log_audit_event(
        db=db, user_id=current_user.id, action="DELETE", table_name="system_config", record_id=cfg.id,
        old_values=old_values
    )
    
    return {"ok": True}


@router.post("/configs/batch")
def batch_update_configs(
    body: BatchConfigUpdate,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """Batch update multiple configs."""
    from ..models import SystemConfig
    import json
    
    updated_count = 0
    for config_data in body.configs:
        key = config_data.get("key")
        value = config_data.get("value")
        if not key or value is None:
            continue
        
        cfg = db.query(SystemConfig).filter(SystemConfig.key == key).first()
        if cfg:
            if isinstance(value, (dict, list, bool)):
                value_str = json.dumps(value)
            elif isinstance(value, str):
                try:
                    json.loads(value)
                    value_str = value
                except (json.JSONDecodeError, ValueError):
                    value_str = json.dumps(value)
            else:
                value_str = json.dumps(value)
            
            cfg.value = value_str
            cfg.updated_at = datetime.now(timezone.utc)
            updated_count += 1
    
    db.commit()
    return {"ok": True, "updated": updated_count}


@router.post("/configs/seed")
def seed_default_configs(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    """Seed default system configurations."""
    from ..models import SystemConfig

    defaults = [
        ("game.enabled", "true", "game", "Whether the game is globally enabled"),
        ("game.max_players", "10000", "game", "Maximum number of active players"),
        ("game.event_trigger_multiplier", "1.0", "game", "Event trigger rate multiplier"),
        ("cache.enabled", "true", "cache", "Whether caching is enabled"),
        ("cache.default_ttl", "300", "cache", "Default cache TTL in seconds"),
        ("feature.leaderboard", "true", "feature", "Enable leaderboard feature"),
        ("feature.achievements", "true", "feature", "Enable achievements feature"),
        ("feature.social", "true", "feature", "Enable social features"),
    ]

    created = 0
    for key, value, category, desc in defaults:
        existing = db.query(SystemConfig).filter(SystemConfig.key == key).first()
        if not existing:
            cfg = SystemConfig(key=key, value=value, category=category, description=desc)
            db.add(cfg)
            created += 1

    db.commit()
    return {"ok": True, "created": created}


@router.get("/configs/schemas")
def get_config_schemas(current_user: User = Depends(get_current_admin)):
    """Get all configuration schemas."""
    from ..utils.config_validator import CONFIG_SCHEMAS
    return {
        "schemas": [
            {
                "key": schema.key,
                "type": schema.config_type.value,
                "description": schema.description,
                "default": schema.default,
                "min_value": schema.min_value,
                "max_value": schema.max_value,
                "allowed_values": schema.allowed_values,
                "category": schema.category,
            }
            for schema in CONFIG_SCHEMAS.values()
        ]
    }

