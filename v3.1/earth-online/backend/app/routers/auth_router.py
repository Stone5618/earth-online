"""Authentication routes."""

from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User
from ..schemas import UserCreate, UserLogin, Token, RefreshTokenRequest
from ..auth import (
    hash_password, verify_password, create_refresh_token, verify_refresh_token,
    create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES,
)
from ..rate_limiter import limiter

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])

MAX_FAILED_ATTEMPTS = 5
LOCKOUT_DURATION_MINUTES = 30


@router.post("/register", response_model=Token)
@limiter.limit("3/minute")
def register(request: Request, body: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.username == body.username).first()
    if existing:
        raise HTTPException(status_code=400, detail="Username already taken")
    user = User(
        username=body.username,
        hashed_password=hash_password(body.password),
        display_name=body.username,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    access_token, refresh_token, _ = create_refresh_token({"sub": str(user.id)})
    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )


@router.post("/login", response_model=Token)
@limiter.limit("5/minute")
def login(request: Request, body: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == body.username).first()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if user.is_locked and user.lock_reason:
        if user.password_changed_at and user.password_changed_at > datetime.now(timezone.utc) - timedelta(hours=24):
            user.is_locked = False
            user.failed_attempts = 0
            db.commit()
        else:
            raise HTTPException(
                status_code=423,
                detail="账号已被锁定，请联系管理员"
            )

    if not verify_password(body.password, user.hashed_password):
        user.failed_attempts = (user.failed_attempts or 0) + 1
        if user.failed_attempts >= MAX_FAILED_ATTEMPTS:
            user.is_locked = True
            user.lock_reason = "连续登录失败次数过多"
            user.failed_attempts = 0
        db.commit()
        raise HTTPException(status_code=401, detail="Invalid credentials")

    user.failed_attempts = 0
    user.is_locked = False
    user.lock_reason = None
    user.last_login_at = datetime.now(timezone.utc)
    user.login_ip = request.client.host if request.client else None
    db.commit()

    access_token, refresh_token, _ = create_refresh_token({"sub": str(user.id)})
    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )


@router.post("/refresh", response_model=Token)
def refresh_token(body: RefreshTokenRequest, db: Session = Depends(get_db)):
    """Refresh an access token using a valid refresh token."""
    payload = verify_refresh_token(body.refresh_token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token")

    user_id = int(payload.get("sub"))
    user = db.query(User).filter(User.id == user_id).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="User not found")

    access_token, new_refresh_token, _ = create_refresh_token({"sub": str(user.id)})
    return Token(
        access_token=access_token,
        refresh_token=new_refresh_token,
        expires_in=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )