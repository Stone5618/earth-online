"""Character routes - creation, query, time allocation, NPC relationships."""

import logging

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError

from ..database import get_db
from ..models import Character, Server, User, NPC
from ..schemas import CharacterCreate, CharacterPublic, CharacterFull, TimeAllocation, CareerRequest
from ..auth import get_current_user
from ..engine.genes import generate_gene_potentials
from ..engine.time_allocation import apply_time_allocation, calculate_time_budget
from ..engine.npc import create_parents, age_npcs_for_character
from ..engine.education import get_education_level, can_enroll_next_level, enroll_education, EDUCATION_STAGES
from ..engine.career import find_available_careers, apply_career, get_career
from ..utils import rng

logger = logging.getLogger("earthonline")

router = APIRouter(prefix="/api/v1/characters", tags=["characters"])


def generate_family_tier() -> str:
    roll = rng.random_float() * 100
    if roll < 0.1:
        return "SSR"
    if roll < 5.1:
        return "SR"
    if roll < 65.1:
        return "R"
    return "IRON"


def generate_initial_stats(tier: str):
    def ri(a, b):
        return rng.random_int(a, b)

    base = {
        "age": 0, "health": 100, "max_health": 100, "money": 0,
        "energy": 100, "max_energy": 100, "mood": 50,
        "intelligence": ri(40, 70), "charm": ri(40, 70),
        "creativity": ri(40, 70), "luck": ri(40, 60), "karma": ri(30, 70),
        "total_money_earned": 0, "is_married": False,
        "appearance": ri(30, 70), "physical_fitness": ri(30, 70),
        "immune_system": ri(30, 70), "emotional_stability": ri(30, 70),
        "self_esteem": ri(30, 70), "social_capital": ri(5, 20),
        "class_position": ri(10, 30),
    }

    bonuses = {
        "SSR": {"money": 1000000, "max_health": 120, "intelligence": ri(80, 100),
                "charm": ri(80, 100), "creativity": ri(75, 95), "luck": ri(70, 90),
                "mood": 80, "karma": ri(70, 100), "total_money_earned": 1000000,
                "social_capital": ri(40, 60), "class_position": ri(60, 80)},
        "SR": {"money": 100000, "intelligence": ri(65, 85), "charm": ri(65, 85),
               "creativity": ri(60, 80), "luck": ri(55, 75), "mood": 70,
               "karma": ri(55, 80), "total_money_earned": 100000,
               "social_capital": ri(20, 40), "class_position": ri(40, 60)},
        "R": {"money": 10000, "total_money_earned": 10000,
              "social_capital": ri(10, 20), "class_position": ri(20, 40)},
    }

    stats = {**base, **(bonuses.get(tier, {}))}
    return stats


@router.post("", response_model=CharacterPublic)
def create_character(body: CharacterCreate, db: Session = Depends(get_db),
                     current_user: User = Depends(get_current_user)):
    server = db.query(Server).filter(Server.id == body.server_id, Server.is_active == True).first()
    if not server:
        raise HTTPException(status_code=404, detail="Server not found")

    tier = generate_family_tier()
    stats = generate_initial_stats(tier)
    genes = generate_gene_potentials()

    char = Character(
        user_id=current_user.id,
        server_id=body.server_id,
        name=body.name,
        family_tier=tier,
        birth_server=server.name,
        birth_talent="",
        gene_potentials=genes,
        **stats,
    )
    db.add(char)
    db.flush()

    # Create parents NPCs
    create_parents(char, db)

    db.commit()
    db.refresh(char)
    return CharacterPublic(**char.to_public_dict())


@router.get("", response_model=list[CharacterPublic])
def list_characters(current_user: User = Depends(get_current_user),
                    db: Session = Depends(get_db)):
    chars = db.query(Character).filter(
        Character.user_id == current_user.id,
        Character.is_active == True,
    ).all()
    return [CharacterPublic(**c.to_public_dict()) for c in chars]


@router.get("/{char_id}", response_model=CharacterPublic)
def get_character(char_id: int, db: Session = Depends(get_db),
                  current_user: User = Depends(get_current_user)):
    char = db.query(Character).filter(
        Character.id == char_id,
        Character.user_id == current_user.id,
    ).first()
    if not char:
        raise HTTPException(status_code=404, detail="Character not found")
    return CharacterPublic(**char.to_public_dict())


@router.get("/{char_id}/full", response_model=CharacterFull)
def get_character_full(char_id: int, db: Session = Depends(get_db),
                       current_user: User = Depends(get_current_user)):
    char = db.query(Character).filter(
        Character.id == char_id,
        Character.user_id == current_user.id,
    ).first()
    if not char:
        raise HTTPException(status_code=404, detail="Character not found")
    return CharacterFull(**char.to_full_dict())


@router.post("/{char_id}/time_allocation")
def allocate_time(
    char_id: int,
    body: TimeAllocation,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Allocate time for the year and apply effects."""
    char = db.query(Character).filter(
        Character.id == char_id,
        Character.user_id == current_user.id,
        Character.is_alive == True,
    ).first()
    if not char:
        raise HTTPException(status_code=404, detail="Character not found or deceased")

    try:
        allocation = body.model_dump()
        budget = calculate_time_budget(char)
        changes = apply_time_allocation(char, allocation, db)
        db.commit()

        return {
            "message": f"时间分配已应用，可用时间预算 {budget} 小时",
            "time_budget": budget,
            "changes": {k: round(v, 2) for k, v in changes.items()},
        }
    except SQLAlchemyError as e:
        db.rollback()
        logger.error(f"Database error in allocate_time for char {char_id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="时间分配失败，请稍后重试")
    except Exception:
        db.rollback()
        logger.exception(f"Unexpected error in allocate_time for char {char_id}")
        raise HTTPException(status_code=500, detail="时间分配失败，请稍后重试")


@router.get("/{char_id}/relationships")
def get_relationships(
    char_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get all NPCs related to this character."""
    char = db.query(Character).filter(
        Character.id == char_id,
        Character.user_id == current_user.id,
    ).first()
    if not char:
        raise HTTPException(status_code=404, detail="Character not found")

    npcs = db.query(NPC).filter(NPC.linked_character_id == char_id).all()
    result = []
    for npc in npcs:
        result.append({
            "id": npc.id,
            "name": npc.name,
            "age": npc.age,
            "gender": npc.gender,
            "relationship": "配偶" if char.spouse_id == npc.id else
                            "父亲" if npc.gender == "male" else
                            "母亲" if npc.gender == "female" else
                            ("子女" if npc.id in (char.children_ids or []) else "其他"),
            "affection": npc.affection_with(char.id),
            "health": npc.health,
            "is_alive": npc.is_alive,
            "occupation": npc.occupation,
        })

    return result


@router.post("/{char_id}/age_npcs")
def age_npcs(
    char_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Advance all NPCs by one year (called each game year)."""
    char = db.query(Character).filter(
        Character.id == char_id,
        Character.user_id == current_user.id,
    ).first()
    if not char:
        raise HTTPException(status_code=404, detail="Character not found")

    age_npcs_for_character(char, db)
    db.commit()
    return {"message": "NPCs aged one year"}


@router.get("/{char_id}/education")
def get_education_status(
    char_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get character's education status and available education options."""
    char = db.query(Character).filter(
        Character.id == char_id,
        Character.user_id == current_user.id,
    ).first()
    if not char:
        raise HTTPException(status_code=404, detail="Character not found")

    current_level = get_education_level(char)
    can_enroll, reason = can_enroll_next_level(char, db)
    available_edu = []
    
    if can_enroll:
        for stage in EDUCATION_STAGES:
            name, min_age, max_age, tuition, min_intel, requires_prev, desc = stage
            if int(char.age) >= min_age and int(char.age) <= max_age:
                if min_intel <= (char.intelligence or 50):
                    available_edu.append({
                        "name": name,
                        "min_age": min_age,
                        "max_age": max_age,
                        "tuition": tuition,
                        "min_intelligence": min_intel,
                        "description": desc,
                    })

    return {
        "current_level": current_level,
        "education_year": char.education_year or 0,
        "can_enroll_next": can_enroll,
        "next_level_reason": reason,
        "available_education": available_edu,
    }


@router.get("/{char_id}/careers")
def get_available_careers(
    char_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get available career options based on character stats."""
    char = db.query(Character).filter(
        Character.id == char_id,
        Character.user_id == current_user.id,
    ).first()
    if not char:
        raise HTTPException(status_code=404, detail="Character not found")

    current_career = get_career(char)
    available = find_available_careers(char)
    
    return {
        "current_career": current_career,
        "available_careers": available,
        "career_years": char.career_years or 0,
    }


@router.post("/{char_id}/career")
def set_career(
    char_id: int,
    body: CareerRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Set character's career."""
    char = db.query(Character).filter(
        Character.id == char_id,
        Character.user_id == current_user.id,
        Character.is_alive == True,
    ).first()
    if not char:
        raise HTTPException(status_code=404, detail="Character not found or deceased")

    success, msg = apply_career(char, body.career_id)
    if not success:
        raise HTTPException(status_code=400, detail=msg)

    db.commit()
    return {"message": msg, "career": body.career_id}
