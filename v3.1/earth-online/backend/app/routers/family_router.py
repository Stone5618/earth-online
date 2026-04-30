"""Family system API routes for Earth Online.

Provides endpoints for marriage, divorce, spouse interaction, childbirth,
and family data retrieval. All routes require authentication.
"""

from datetime import datetime, timezone
from typing import Optional
import logging

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from pydantic import BaseModel

from ..database import get_db
from ..models import Character, User, NPC
from ..auth import get_current_user
from ..engine.family import (
    can_marry,
    find_spouse_candidate,
    perform_marriage,
    handle_divorce,
    check_childbirth,
    record_childbirth,
    get_family_summary,
    FamilyRelationship,
)
from ..utils.rng import random_int, random_float, random_sample

router = APIRouter(prefix="/api/v1/family", tags=["family"])


# ============================================================
# Dependencies
# ============================================================

def get_owned_character(
    char_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Character:
    """获取角色并验证所有权。
    
    这是一个可复用的依赖函数，替代每个端点中的重复验证逻辑。
    """
    char = db.query(Character).filter(Character.id == char_id).first()
    if not char:
        raise HTTPException(status_code=404, detail="角色不存在")
    if char.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="无权操作此角色")
    return char


# ============================================================
# Request/Response Models
# ============================================================

class MarriageAcceptRequest(BaseModel):
    char_id: int
    candidate_id: str


class MarriageDeclineRequest(BaseModel):
    char_id: int
    candidate_id: str


class DivorceRequest(BaseModel):
    char_id: int
    reason: str = "感情破裂"


class SpouseInteractRequest(BaseModel):
    char_id: int
    interaction_type: str  # date, gift, talk, travel
    amount: float = 0  # Amount spent on gift (in game currency)


class ChildbirthRequest(BaseModel):
    char_id: int


class ChildInteractRequest(BaseModel):
    char_id: int
    child_id: str
    interaction_type: str  # teach, play, scold, encourage


# ============================================================
# Family Summary & Info
# ============================================================

@router.get("/summary")
def api_get_family_summary_endpoint(
    char: Character = Depends(get_owned_character),
    db: Session = Depends(get_db),
):
    """Get comprehensive family summary for a character."""
    char_id = char.id

    summary = get_family_summary(char_id, db)

    # Enrich summary with additional info
    relationships = db.query(FamilyRelationship).filter(
        FamilyRelationship.char_id == char_id,
        FamilyRelationship.is_active == True,
    ).all()

    children_details = []
    for rel in relationships:
        if rel.relation_type == "child":
            children_details.append({
                "id": str(rel.target_id),
                "name": rel.target_name,
                "age": int(char.age - rel.started_at_age) if rel.started_at_age else 0,
                "traits": [],
                "relationship": "good" if rel.quality >= 60 else ("neutral" if rel.quality >= 40 else "poor"),
                "gender": _get_child_gender(db, rel.target_id),
                "born_at": int(rel.started_at_age) if rel.started_at_age else 0,
            })

    spouse_info = None
    if char.is_married:
        spouse_rel = db.query(FamilyRelationship).filter(
            FamilyRelationship.char_id == char_id,
            FamilyRelationship.relation_type == "spouse",
            FamilyRelationship.is_active == True,
        ).first()
        if spouse_rel:
            spouse_info = {
                "id": str(spouse_rel.target_id),
                "name": spouse_rel.target_name,
                "relationship_years": int(char.age - spouse_rel.started_at_age) if spouse_rel.started_at_age else 0,
                "intimacy": spouse_rel.quality,
                "mood": "happy" if spouse_rel.quality >= 70 else ("neutral" if spouse_rel.quality >= 40 else "sad"),
            }

    return {
        "is_married": bool(char.is_married),
        "spouse": spouse_info,
        "children": children_details,
        "children_count": len(children_details),
        "spouse_name": getattr(char, 'spouse_name', None),
        "family_events": [],
    }


@router.get("/spouse")
def api_get_spouse(
    char_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get current spouse information."""
    char = db.query(Character).filter(Character.id == char_id).first()
    if not char:
        raise HTTPException(status_code=404, detail="角色不存在")
    if char.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="无权操作此角色")
    if not char.is_married:
        return None

    rel = db.query(FamilyRelationship).filter(
        FamilyRelationship.char_id == char_id,
        FamilyRelationship.relation_type == "spouse",
        FamilyRelationship.is_active == True,
    ).first()

    if not rel:
        return None

    return {
        "id": str(rel.target_id),
        "name": rel.target_name,
        "relationship_years": int(char.age - rel.started_at_age) if rel.started_at_age else 0,
        "intimacy": rel.quality,
        "mood": "happy" if rel.quality >= 70 else ("neutral" if rel.quality >= 40 else "sad"),
    }


@router.get("/children")
def api_get_children(
    char_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get all children information."""
    char = db.query(Character).filter(Character.id == char_id).first()
    if not char:
        raise HTTPException(status_code=404, detail="角色不存在")
    if char.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="无权操作此角色")

    relationships = db.query(FamilyRelationship).filter(
        FamilyRelationship.char_id == char_id,
        FamilyRelationship.relation_type == "child",
        FamilyRelationship.is_active == True,
    ).all()

    children = []
    for rel in relationships:
        children.append({
            "id": str(rel.target_id),
            "name": rel.target_name,
            "age": int(char.age - rel.started_at_age) if rel.started_at_age else 0,
            "traits": [],
            "relationship": "good" if rel.quality >= 60 else ("neutral" if rel.quality >= 40 else "poor"),
            "gender": _get_child_gender(db, rel.target_id),
            "born_at": int(rel.started_at_age) if rel.started_at_age else 0,
        })

    return children


# ============================================================
# Marriage Operations
# ============================================================

@router.post("/find_match")
def api_find_marriage_candidate(
    char_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Find a marriage candidate for the character."""
    char = db.query(Character).filter(Character.id == char_id).first()
    if not char:
        raise HTTPException(status_code=404, detail="角色不存在")
    if char.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="无权操作此角色")

    if not can_marry(char):
        raise HTTPException(status_code=400, detail="不符合结婚条件")

    # Use existing find_spouse_candidate
    server = None  # Could be retrieved if needed
    candidate = find_spouse_candidate(char, server, db)

    if not candidate:
        raise HTTPException(status_code=404, detail="未找到合适的对象")

    return {
        "id": f"candidate_{random_int(1000, 9999)}",
        "name": candidate["name"],
        "age": int(candidate["age"]),
        "traits": _generate_traits(),
        "compatibility": candidate["quality"],
    }


@router.post("/marry")
def api_accept_marriage(
    req: MarriageAcceptRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Accept marriage and perform wedding ceremony."""
    char = db.query(Character).filter(Character.id == req.char_id).first()
    if not char:
        raise HTTPException(status_code=404, detail="角色不存在")
    if char.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="无权操作此角色")

    if char.is_married:
        raise HTTPException(status_code=400, detail="已经结婚")

    # Find the candidate from active proposals (stored in flags)
    flags = dict(char.flags or {})
    active_proposal = flags.get("active_proposal")
    if not active_proposal:
        raise HTTPException(status_code=400, detail="没有待处理的求婚")

    candidate = active_proposal.get("candidate")
    if not candidate:
        raise HTTPException(status_code=400, detail="求婚对象信息缺失")

    # Perform marriage
    perform_marriage(req.char_id, candidate, db)

    # Clear proposal flag
    flags.pop("active_proposal", None)
    char.flags = flags
    db.commit()

    # Determine ceremony type based on stats
    ceremony_type = _determine_ceremony_type(char)
    guest_count = _calculate_guest_count(ceremony_type)

    return {
        "spouse": {
            "id": str(candidate.get("id", 0)),
            "name": candidate["name"],
            "relationship_years": 0,
            "intimacy": candidate.get("quality", 60),
            "mood": "happy",
        },
        "ceremony_type": ceremony_type,
        "guest_count": guest_count,
        "ceremony_text": _generate_ceremony_text(ceremony_type, candidate["name"]),
    }


@router.post("/decline")
def api_decline_marriage(
    req: MarriageDeclineRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Decline a marriage proposal."""
    char = db.query(Character).filter(Character.id == req.char_id).first()
    if not char:
        raise HTTPException(status_code=404, detail="角色不存在")
    if char.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="无权操作此角色")

    # Clear proposal flag
    flags = dict(char.flags or {})
    flags.pop("active_proposal", None)
    char.flags = flags
    db.commit()

    return {"success": True}


# ============================================================
# Divorce
# ============================================================

@router.post("/divorce")
def api_divorce(
    req: DivorceRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Initiate divorce process."""
    char = db.query(Character).filter(Character.id == req.char_id).first()
    if not char:
        raise HTTPException(status_code=404, detail="角色不存在")
    if char.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="无权操作此角色")

    if not char.is_married:
        raise HTTPException(status_code=400, detail="未结婚")

    try:
        handle_divorce(req.char_id, db)
        return {"success": True, "reason": req.reason}
    except SQLAlchemyError as e:
        db.rollback()
        logger.error(f"Database error in divorce for char {req.char_id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="离婚失败，请稍后重试")
    except HTTPException:
        db.rollback()
        raise
    except Exception:
        db.rollback()
        logger.exception(f"Unexpected error in divorce for char {req.char_id}")
        raise HTTPException(status_code=500, detail="离婚失败，请稍后重试")


# ============================================================
# Spouse Interactions
# ============================================================

@router.post("/interact")
def api_interact_with_spouse(
    req: SpouseInteractRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Interact with spouse (date, gift, talk, travel)."""
    char = db.query(Character).filter(Character.id == req.char_id).first()
    if not char:
        raise HTTPException(status_code=404, detail="角色不存在")
    if char.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="无权操作此角色")

    if not char.is_married:
        raise HTTPException(status_code=400, detail="未结婚")

    # Find spouse relationship
    rel = db.query(FamilyRelationship).filter(
        FamilyRelationship.char_id == req.char_id,
        FamilyRelationship.relation_type == "spouse",
        FamilyRelationship.is_active == True,
    ).first()

    if not rel:
        raise HTTPException(status_code=404, detail="配偶关系不存在")

    # Calculate interaction effects
    effects = _calculate_interaction_effects(req.interaction_type, req.amount, char)

    # Apply changes
    new_quality = max(0, min(100, rel.quality + effects["intimacy_change"]))
    rel.quality = new_quality

    # Mood changes
    char.mood = max(0, min(100, (char.mood or 50) + effects["mood_change"]))

    # Money cost for gift/travel
    if req.amount > 0:
        char.money = max(0, (char.money or 0) - req.amount)

    db.commit()

    return {
        "success": True,
        "intimacy_change": effects["intimacy_change"],
        "mood_change": effects["mood_change"],
    }


# ============================================================
# Childbirth & Child Management
# ============================================================

@router.post("/childbirth")
def api_trigger_childbirth(
    req: ChildbirthRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Trigger childbirth event."""
    char = db.query(Character).filter(Character.id == req.char_id).first()
    if not char:
        raise HTTPException(status_code=404, detail="角色不存在")
    if char.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="无权操作此角色")

    if not char.is_married:
        raise HTTPException(status_code=400, detail="未结婚")

    # Check if childbirth can occur
    child = check_childbirth(req.char_id, char.age, db)

    if not child:
        raise HTTPException(status_code=400, detail="未能生育")

    # Record the child
    record_childbirth(req.char_id, child, db)

    return {
        "name": child["name"],
        "gender": child["gender"],
        "born_at": int(child.get("born_at", char.age)),
        "traits": _generate_child_traits(char),
    }


@router.get("/child/{child_id}")
def api_get_child_details(
    char_id: int,
    child_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get detailed information about a specific child."""
    char = db.query(Character).filter(Character.id == char_id).first()
    if not char:
        raise HTTPException(status_code=404, detail="角色不存在")
    if char.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="无权操作此角色")

    rel = db.query(FamilyRelationship).filter(
        FamilyRelationship.char_id == char_id,
        FamilyRelationship.target_id == int(child_id),
        FamilyRelationship.relation_type == "child",
    ).first()

    if not rel:
        raise HTTPException(status_code=404, detail="子女不存在")

    return {
        "id": str(rel.target_id),
        "name": rel.target_name,
        "age": int(char.age - rel.started_at_age) if rel.started_at_age else 0,
        "traits": [],
        "relationship": "good" if rel.quality >= 60 else ("neutral" if rel.quality >= 40 else "poor"),
        "gender": _get_child_gender(db, rel.target_id),
        "born_at": int(rel.started_at_age) if rel.started_at_age else 0,
    }


@router.post("/child/interact")
def api_interact_with_child(
    req: ChildInteractRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Interact with a child (teach, play, scold, encourage)."""
    char = db.query(Character).filter(Character.id == req.char_id).first()
    if not char:
        raise HTTPException(status_code=404, detail="角色不存在")
    if char.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="无权操作此角色")

    rel = db.query(FamilyRelationship).filter(
        FamilyRelationship.char_id == req.char_id,
        FamilyRelationship.target_id == int(req.child_id),
        FamilyRelationship.relation_type == "child",
    ).first()

    if not rel:
        raise HTTPException(status_code=404, detail="子女不存在")

    # Calculate interaction effects
    relationship_changes = {
        "teach": 5,
        "play": 8,
        "scold": -5,
        "encourage": 6,
    }

    change = relationship_changes.get(req.interaction_type, 0)
    new_quality = max(0, min(100, rel.quality + change))
    rel.quality = new_quality
    db.commit()

    return {
        "success": True,
        "relationship_change": change,
    }


# ============================================================
# Helper Functions
# ============================================================

def _get_child_gender(db: Session, child_id: int) -> str:
    """Get child's gender from database, fallback to random if not found."""
    npc = db.query(NPC).filter(NPC.id == child_id).first()
    if npc and npc.gender and npc.gender != "unknown":
        return npc.gender
    # Fallback to random only if no data in DB
    return "male" if random_float() < 0.5 else "female"


def _generate_traits() -> list[str]:
    """Generate random traits for a marriage candidate."""
    all_traits = ["温柔", "开朗", "聪明", "善良", "坚强", "幽默", "细心", "体贴", "独立", "乐观"]
    count = random_int(2, 4)
    return random_sample(all_traits, count)


def _generate_child_traits(char) -> list[str]:
    """Generate traits for a newborn child based on parent stats."""
    all_traits = ["健康", "聪明", "活泼", "安静", "幸运", "坚强"]
    count = random_int(1, 3)
    return random_sample(all_traits, count)


def _determine_ceremony_type(char) -> str:
    """Determine ceremony type based on character stats."""
    money = char.money or 0
    if money >= 500000:
        return "grand"
    elif money >= 100000:
        return "simple"
    else:
        return "private"


def _calculate_guest_count(ceremony_type: str) -> int:
    """Calculate guest count based on ceremony type."""
    if ceremony_type == "grand":
        return random_int(50, 100)
    elif ceremony_type == "simple":
        return random_int(10, 30)
    else:
        return random_int(2, 5)


def _generate_ceremony_text(ceremony_type: str, spouse_name: str) -> str:
    """Generate ceremony description text."""
    texts = {
        "grand": f"盛大的婚礼上，{spouse_name}与你交换了戒指，在众人的祝福中结为夫妻",
        "simple": f"简约而温馨的仪式上，{spouse_name}成为了你的配偶",
        "private": f"在亲密好友的见证下，你与{spouse_name}私定了终身",
    }
    return texts.get(ceremony_type, texts["simple"])


def _calculate_interaction_effects(interaction_type: str, amount: float, char) -> dict:
    """Calculate the effects of spouse interaction."""
    base_effects = {
        "date": {"intimacy_change": 5, "mood_change": 10},
        "gift": {"intimacy_change": 8, "mood_change": 15},
        "talk": {"intimacy_change": 4, "mood_change": 8},
        "travel": {"intimacy_change": 10, "mood_change": 20},
    }

    effects = base_effects.get(interaction_type, {"intimacy_change": 3, "mood_change": 5})

    # Scale based on amount (for gifts)
    if interaction_type == "gift" and amount > 0:
        scale = min(2.0, 1.0 + amount / 10000)
        effects["intimacy_change"] = int(effects["intimacy_change"] * scale)

    # Random variation
    variation = random_int(-2, 2)
    effects["intimacy_change"] += variation

    return effects
