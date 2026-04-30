"""Family relationship engine for Earth Online.

Handles marriage matching, childbirth, divorce, and family events.
Designed as an add-on to the existing event engine — events.py calls into
family.py when a relationship-related event triggers.
"""

import math
from datetime import datetime, timezone
from typing import Optional
from ..utils import rng

from sqlalchemy.orm import Session
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float, JSON

from ..database import Base, get_db


# ============================================================
# Models
# ============================================================

class FamilyRelationship(Base):
    """Tracks relationships between player characters and NPCs."""
    __tablename__ = "family_relationships"

    id = Column(Integer, primary_key=True, index=True)
    char_id = Column(Integer, nullable=False, index=True)  # FK: characters.id (app-level)
    relation_type = Column(String(20), nullable=False)  # spouse, child, parent, sibling, friend
    target_id = Column(Integer, nullable=False)  # NPC id or character id
    target_name = Column(String(50), nullable=False)
    quality = Column(Integer, default=50)  # 0-100 relationship quality
    is_npc = Column(Boolean, default=True)  # True = NPC, False = other player
    started_at_age = Column(Float, nullable=True)
    ended_at_age = Column(Float, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class SocialRelation(Base):
    """Broader social connections (friends, colleagues, rivals)."""
    __tablename__ = "social_relations"

    id = Column(Integer, primary_key=True, index=True)
    char_id = Column(Integer, nullable=False, index=True)  # FK: characters.id (app-level)
    relation = Column(String(20), nullable=False)  # friend, colleague, rival, mentor, mentee
    target_name = Column(String(50), nullable=False)
    target_id = Column(Integer, nullable=True)
    strength = Column(Integer, default=30)  # 0-100
    influence_area = Column(String(30), nullable=True)  # career, social, wealth
    created_at_age = Column(Float, nullable=True)
    is_active = Column(Boolean, default=True)


# ============================================================
# Marriage / Relationship Logic
# ============================================================

def can_marry(char) -> bool:
    """Check if character is eligible for marriage."""
    if char.is_married:
        return False
    if char.age < 18:
        return False
    if char.age > 100:
        return False
    if not char.is_alive:
        return False
    return True


def find_spouse_candidate(char, server, db: Session) -> Optional[dict]:
    """Find a spouse candidate based on charm, luck, social circle."""
    if not can_marry(char):
        return None

    base_chance = 0.3  # 30% base chance each eligible year
    charm_bonus = (getattr(char, 'charm', 50) - 50) / 200  # ±25%
    luck_bonus = (getattr(char, 'luck', 50) - 50) / 200    # ±25%
    age_penalty = max(0, (char.age - 40) * 0.02)  # -2%/year after 40
    married_bonus = 0.15 if char.is_married else 0

    total_chance = base_chance + charm_bonus + luck_bonus - age_penalty + married_bonus
    total_chance = max(0.05, min(0.85, total_chance))

    if rng.random_bool(total_chance):
        return {
            "name": _generate_npc_name(server),
            "age": _match_age_range(char.age),
            "charm": int(rng.random_gauss(50, 15)),
            "intelligence": int(rng.random_gauss(50, 15)),
            "quality": int(rng.random_gauss(60, 15)),  # initial relationship quality
        }
    return None


def _generate_npc_name(server) -> str:
    """Generate a culturally appropriate NPC name."""
    # Simple name generation — could expand per server culture
    first_names = ["王", "李", "张", "刘", "陈", "赵", "周", "吴", "徐", "孙",
                   "明", "伟", "芳", "娜", "秀英", "敏", "静", "丽", "强", "磊"]
    last_names = ["小", "大", "志", "文", "思", "玉", "美", "建", "红", "国",
                  "宇", "翔", "雪", "婷", "浩", "杰", "晨", "曦", "薇", "蕾"]
    return rng.choice(first_names) + rng.choice(last_names)


def _match_age_range(player_age: float) -> float:
    """Generate a reasonable partner age."""
    spread = rng.random_gauss(0, 3)  # most partners within 3 years
    return max(18, player_age + spread)


def perform_marriage(char_id: int, spouse: dict, db: Session):
    """Link a character with a spouse."""
    from ..models import Character
    char = db.query(Character).filter(Character.id == char_id).first()
    if not char:
        return

    # Create family relationship
    rel = FamilyRelationship(
        char_id=char_id,
        relation_type="spouse",
        target_id=0,  # NPC
        target_name=spouse["name"],
        quality=spouse.get("quality", 60),
        is_npc=True,
        started_at_age=char.age,
        is_active=True,
    )
    db.add(rel)

    # Update character
    char.is_married = True
    char.spouse_name = spouse["name"]
    char.spouse_quality = spouse["quality"]

    # Add flag - all in one transaction
    flags = dict(char.flags or {})
    flags["married_at"] = int(char.age)
    char.flags = flags

    # Single commit for all changes
    db.commit()


def handle_divorce(char_id: int, db: Session):
    """Handle divorce — deactivate relationship, update character."""
    from ..models import Character
    char = db.query(Character).filter(Character.id == char_id).first()
    if not char:
        return

    rel = db.query(FamilyRelationship).filter(
        FamilyRelationship.char_id == char_id,
        FamilyRelationship.relation_type == "spouse",
        FamilyRelationship.is_active == True,
    ).first()

    if rel:
        rel.is_active = False
        rel.ended_at_age = char.age

    char.is_married = False
    char.spouse_name = None
    char.spouse_quality = 0

    flags = dict(char.flags or {})
    flags["divorced"] = True
    flags["divorced_at"] = int(char.age)
    char.flags = flags
    db.commit()


def check_childbirth(char_id: int, age: float, db: Session) -> Optional[dict]:
    """Check if childbirth occurs naturally (age 20-45 range)."""
    from ..models import Character
    char = db.query(Character).filter(Character.id == char_id).first()
    if not char or not char.is_married:
        return None

    # Age window: 20-45 for women, 20-60 for men
    gender = getattr(char, 'gender', 'male')
    max_child_age = 45 if gender == 'female' else 60
    if age < 20 or age > max_child_age:
        return None

    existing_children = len(char.children_ids or [])
    if existing_children >= 6:
        return None  # Family size cap

    # Probability per year (decreases with age and existing children)
    base_rate = 0.20
    age_penalty = max(0, (age - 25) * 0.01)
    existing_penalty = existing_children * 0.03
    total_rate = base_rate - age_penalty - existing_penalty

    if rng.random_bool(total_rate):
        child = {
            "name": _generate_npc_name(char),
            "born_at": int(age),
            "gender": "male" if rng.random_bool(0.5) else "female",
        }
        return child
    return None


def record_childbirth(char_id: int, child: dict, db: Session):
    """Record a child birth in the database."""
    from ..models import Character
    char = db.query(Character).filter(Character.id == char_id).first()
    if not char:
        return

    children = list(char.children_ids or [])
    child_id = rng.random_int(10000, 99999)
    children.append(child_id)
    char.children_ids = children

    rel = FamilyRelationship(
        char_id=char_id,
        relation_type="child",
        target_id=child_id,
        target_name=child["name"],
        quality=70,  # initial bond
        is_npc=True,
        started_at_age=char.age,
        is_active=True,
    )
    db.add(rel)
    db.commit()


def get_family_bonus(char, db: Session) -> dict:
    """Calculate attribute bonuses from family relationships."""
    bonuses = {"mood": 0, "karma": 0, "money": 0, "health": 0}

    # Spouse bonus
    if char.is_married:
        spouse_quality = getattr(char, 'spouse_quality', 50)
        bonuses["mood"] += int(spouse_quality * 0.3)
        bonuses["karma"] += 5
        bonuses["money"] += 5000  # dual income boost

    # Child bonus
    children_count = len(char.children_ids or [])
    bonuses["mood"] += children_count * 3
    bonuses["karma"] += children_count * 2

    # Child expense
    bonuses["money"] -= children_count * 10000

    return bonuses


def get_family_summary(char_id: int, db: Session) -> dict:
    """Get a readable summary of a character's family status."""
    relationships = db.query(FamilyRelationship).filter(
        FamilyRelationship.char_id == char_id,
        FamilyRelationship.is_active == True,
    ).all()

    spouse = None
    children = []
    for rel in relationships:
        if rel.relation_type == "spouse":
            spouse = {"name": rel.target_name, "quality": rel.quality}
        elif rel.relation_type == "child":
            children.append({"name": rel.target_name})

    from ..models import Character
    char = db.query(Character).filter(Character.id == char_id).first()
    if not char:
        return {"spouse": None, "children_count": 0}

    return {
        "is_married": bool(char.is_married),
        "spouse": spouse,
        "children": children,
        "children_count": len(children),
        "spouse_name": getattr(char, 'spouse_name', None),
    }
