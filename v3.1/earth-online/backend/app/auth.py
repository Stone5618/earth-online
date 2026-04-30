"""Authentication utilities."""

from datetime import datetime, timedelta, timezone
from typing import Optional
import hashlib
import secrets
import uuid

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from .config import settings
from .database import get_db
from .models import User, AdminRole, AdminPermission, RolePermission
from .token_blacklist import is_token_revoked, revoke_token

security = HTTPBearer(auto_error=False)

# Token expiration settings - read from config
ACCESS_TOKEN_EXPIRE_MINUTES = getattr(settings, 'ACCESS_TOKEN_EXPIRE_MINUTES', 15)
REFRESH_TOKEN_EXPIRE_DAYS = 7


class TokenWithJTI:
    """Holds the current user and their access token JTI."""
    def __init__(self, user: User, jti: str = ""):
        self.user = user
        self.jti = jti


def hash_password(password: str) -> str:
    salt = secrets.token_hex(16)
    dk = hashlib.pbkdf2_hmac('sha256', password.encode(), salt.encode(), 100000)
    return f"pbkdf2:sha256:{salt}:{dk.hex()}"


def verify_password(plain: str, stored: str) -> bool:
    parts = stored.split(':')
    if len(parts) != 4 or parts[0] != 'pbkdf2' or parts[1] != 'sha256':
        return False
    salt = parts[2]
    dk = hashlib.pbkdf2_hmac('sha256', plain.encode(), salt.encode(), 100000)
    return dk.hex() == parts[3]


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> tuple[str, str]:
    """Create an access token with a unique JTI for revocation tracking.
    
    Returns:
        Tuple of (access_token, jti)
    """
    to_encode = data.copy()
    jti = str(uuid.uuid4())
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire, "type": "access", "jti": jti})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM), jti


def create_refresh_token(data: dict) -> tuple[str, str, str]:
    """Create a refresh token and a new access token.
    
    Returns:
        Tuple of (access_token, refresh_token, access_jti)
    """
    to_encode = data.copy()
    jti = str(uuid.uuid4())
    expire = datetime.now(timezone.utc) + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire, "type": "refresh", "jti": jti})
    refresh_token = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    access_token, access_jti = create_access_token(data)
    return access_token, refresh_token, access_jti


def verify_refresh_token(token: str) -> Optional[dict]:
    """Verify a refresh token and return its payload."""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        if payload.get("type") != "refresh":
            return None
        return payload
    except JWTError:
        return None


def _decode_token_payload(credentials: HTTPAuthorizationCredentials) -> dict:
    """Decode and validate a JWT token, returning its payload."""
    token = credentials.credentials
    payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    user_id: int = int(payload.get("sub"))
    if user_id is None:
        raise HTTPException(status_code=401, detail="Invalid token")
    return payload


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
) -> User:
    if not credentials:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = _decode_token_payload(credentials)
        user_id: int = int(payload.get("sub"))

        jti = payload.get("jti")
        if jti and await is_token_revoked(jti):
            raise HTTPException(status_code=401, detail="Token has been revoked")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

    user = db.query(User).filter(User.id == user_id).first()
    if user is None or not user.is_active:
        raise HTTPException(status_code=401, detail="User not found")
    return user


async def get_current_user_with_jti(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
) -> TokenWithJTI:
    """Like get_current_user but also returns the token JTI for revocation."""
    if not credentials:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = _decode_token_payload(credentials)
        user_id: int = int(payload.get("sub"))
        jti = payload.get("jti") or ""

        if jti and await is_token_revoked(jti):
            raise HTTPException(status_code=401, detail="Token has been revoked")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

    user = db.query(User).filter(User.id == user_id).first()
    if user is None or not user.is_active:
        raise HTTPException(status_code=401, detail="User not found")
    return TokenWithJTI(user, jti)


def get_current_admin(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> User:
    """Require admin privileges: superuser or role with level >= 50."""
    if current_user.is_superuser:
        return current_user
    if not current_user.role_id:
        raise HTTPException(status_code=403, detail="Admin access required")
    role = db.query(AdminRole).filter(AdminRole.id == current_user.role_id).first()
    if not role or role.level < 50:
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user


async def get_optional_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
    db: Session = Depends(get_db),
) -> User | None:
    """Like get_current_user but returns None if no token provided."""
    if credentials is None:
        return None
    try:
        payload = _decode_token_payload(credentials)
        user_id: int = int(payload.get("sub"))

        jti = payload.get("jti")
        if jti and await is_token_revoked(jti):
            return None
    except JWTError:
        return None
    user = db.query(User).filter(User.id == user_id).first()
    if user is None or not user.is_active:
        return None
    return user


def get_user_permissions(user: User, db: Session) -> list[str]:
    """Get all permission codes for a user."""
    if user.is_superuser:
        return ["*"]
    if not user.role_id:
        return []
    perms = (
        db.query(AdminPermission.code)
        .join(RolePermission, RolePermission.permission_id == AdminPermission.id)
        .filter(RolePermission.role_id == user.role_id)
        .all()
    )
    return [p[0] for p in perms]


def require_permission(permission_code: str):
    """Dependency factory: check if current user has the specified permission."""
    def checker(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
        if current_user.is_superuser:
            return current_user
        permissions = get_user_permissions(current_user, db)
        if permission_code not in permissions:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Permission denied: requires {permission_code}",
            )
        return current_user
    return checker


def update_user_login_info(user: User, db: Session, ip_address: str | None = None):
    """Update user's last login time and IP."""
    user.last_login_at = datetime.now(timezone.utc)
    if ip_address:
        user.login_ip = ip_address
    db.commit()
    db.refresh(user)
