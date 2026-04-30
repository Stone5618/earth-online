"""NPC generation and relationship management."""

from sqlalchemy.orm import Session

from ..models import NPC, Character
from ..utils import rng

NPC_FIRST_NAMES_MALE = ["建国", "伟", "强", "磊", "军", "勇", "明", "刚", "平", "辉"]
NPC_FIRST_NAMES_FEMALE = ["芳", "娟", "敏", "静", "丽", "霞", "秀英", "桂英", "玉兰", "淑珍"]


def random_name(gender: str) -> str:
    if gender == "male":
        return "李" + rng.random_choice(NPC_FIRST_NAMES_MALE)
    return "王" + rng.random_choice(NPC_FIRST_NAMES_FEMALE)


def create_parents(char: Character, db: Session) -> tuple[NPC, NPC]:
    """Create father and mother NPC when a character is born."""
    father = NPC(
        name=random_name("male"),
        age=rng.random_int(25, 40),
        gender="male",
        health=rng.random_int(60, 95),
        occupation="",
        wealth=char.money * 0.5,
        traits=[],
        affection_map={str(char.id): rng.random_int(70, 100)},
        linked_character_id=char.id,
    )
    mother = NPC(
        name=random_name("female"),
        age=rng.random_int(23, 38),
        gender="female",
        health=rng.random_int(60, 95),
        occupation="",
        wealth=char.money * 0.3,
        traits=[],
        affection_map={str(char.id): rng.random_int(75, 100)},
        linked_character_id=char.id,
    )
    # Link spouses
    father.spouse_id = 0  # placeholder, will set after commit
    mother.spouse_id = 0

    db.add(father)
    db.add(mother)
    db.flush()  # get IDs

    father.spouse_id = mother.id
    mother.spouse_id = father.id

    return father, mother


def age_npcs_for_character(char: Character, db: Session):
    """Advance all NPCs linked to this character by one year."""
    npcs = db.query(NPC).filter(NPC.linked_character_id == char.id).all()
    for npc in npcs:
        if not npc.is_alive:
            continue
        npc.age += 1

        # Natural health decay
        if npc.age > 50:
            npc.health -= (npc.age - 50) * 0.5
        if npc.age > 70:
            npc.health -= (npc.age - 70) * 1.0
        npc.health = max(0, npc.health)

        # Natural mood decay without interaction
        npc.mood = max(0, npc.mood - 2)

        # Death check
        if npc.health <= 0 or (npc.age > 80 and rng.random_bool(0.05)):
            npc.is_alive = False

        # Natural affection decay
        for cid in list((npc.affection_map or {}).keys()):
            npc.adjust_affection(int(cid), -2)


def create_spouse(char: Character, db: Session) -> NPC:
    """Create a spouse NPC for a marriage event."""
    gender = "female" if "男" not in (char.name or "") else "male"
    spouse = NPC(
        name=random_name("female" if gender == "male" else "male"),
        age=char.age - rng.random_int(0, 5),
        gender="female" if gender == "male" else "male",
        health=rng.random_int(60, 95),
        occupation="",
        wealth=0,
        traits=[],
        affection_map={str(char.id): 80},
        linked_character_id=char.id,
    )
    db.add(spouse)
    db.flush()
    return spouse


def create_child(parent_char: Character, db: Session) -> NPC:
    """Create a child NPC."""
    gender = rng.random_choice(["male", "female"])
    child = NPC(
        name=random_name(gender),
        age=0,
        gender=gender,
        health=rng.random_int(70, 100),
        affection_map={str(parent_char.id): 100},
        linked_character_id=parent_char.id,
        parent_of_ids=[],
    )
    db.add(child)
    db.flush()

    # Update character's children list
    children = parent_char.children_ids or []
    children.append(child.id)
    parent_char.children_ids = children

    return child
