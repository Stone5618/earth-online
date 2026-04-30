"""User profile and game save routes."""

from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User, GameSave
from ..schemas import UserProfile, UserProfileUpdate, GameSaveOut, GameSaveIn
from ..auth import get_current_user, get_current_user_with_jti, ACCESS_TOKEN_EXPIRE_MINUTES
from ..token_blacklist import revoke_token

router = APIRouter(prefix="/api/v1/users", tags=["users"])


# --- User Profile ---
@router.get("/me", response_model=UserProfile)
def get_my_profile(current_user: User = Depends(get_current_user)):
    """Get current user's profile."""
    return UserProfile(
        id=current_user.id,
        username=current_user.username,
        display_name=current_user.display_name,
        avatar_color=current_user.avatar_color,
        bio=current_user.bio,
        created_at=current_user.created_at,
    )


@router.patch("/me", response_model=UserProfile)
def update_my_profile(
    body: UserProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update current user's profile."""
    update_data = body.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(current_user, field, value)
    db.commit()
    db.refresh(current_user)
    return UserProfile(
        id=current_user.id,
        username=current_user.username,
        display_name=current_user.display_name,
        avatar_color=current_user.avatar_color,
        bio=current_user.bio,
        created_at=current_user.created_at,
    )


@router.post("/logout")
async def logout(current_user_with_jti = Depends(get_current_user_with_jti)):
    """Revoke the current access token and logout."""
    if current_user_with_jti.jti:
        expires_at = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        await revoke_token(current_user_with_jti.jti, expires_at)
    return {"message": "Logged out successfully"}


# --- Game Saves ---
@router.get("/saves", response_model=list[GameSaveOut])
def get_my_saves(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get all game saves for current user."""
    saves = db.query(GameSave).filter(GameSave.user_id == current_user.id).order_by(GameSave.slot).all()
    return saves


@router.get("/saves/{slot}", response_model=GameSaveOut)
def get_save(
    slot: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get a specific game save by slot."""
    save = db.query(GameSave).filter(
        GameSave.user_id == current_user.id,
        GameSave.slot == slot,
    ).first()
    if not save:
        raise HTTPException(status_code=404, detail="Save not found")
    return save


@router.get("/saves/{slot}/data")
def get_save_data(
    slot: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get the actual game save data (the JSON content)."""
    save = db.query(GameSave).filter(
        GameSave.user_id == current_user.id,
        GameSave.slot == slot,
    ).first()
    if not save:
        raise HTTPException(status_code=404, detail="Save not found")
    return save.save_data


@router.post("/saves", response_model=GameSaveOut)
def save_game(
    body: GameSaveIn,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Save a game (create or overwrite)."""
    # Check if save exists for this slot
    existing_save = db.query(GameSave).filter(
        GameSave.user_id == current_user.id,
        GameSave.slot == body.slot,
    ).first()
    
    if existing_save:
        # Update existing save
        existing_save.save_data = body.save_data
        existing_save.character_name = body.character_name
        existing_save.age = body.age
        existing_save.char_id = body.char_id
        db.commit()
        db.refresh(existing_save)
        return existing_save
    else:
        # Create new save
        new_save = GameSave(
            user_id=current_user.id,
            slot=body.slot,
            save_data=body.save_data,
            character_name=body.character_name,
            age=body.age,
            char_id=body.char_id,
        )
        db.add(new_save)
        db.commit()
        db.refresh(new_save)
        return new_save


@router.delete("/saves/{slot}")
def delete_save(
    slot: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a game save."""
    save = db.query(GameSave).filter(
        GameSave.user_id == current_user.id,
        GameSave.slot == slot,
    ).first()
    if not save:
        raise HTTPException(status_code=404, detail="Save not found")
    db.delete(save)
    db.commit()
    return {"message": "Save deleted successfully"}
