"""NPC (non-player character) model for relationships."""

from sqlalchemy import Column, Integer, String, Float, Boolean, JSON, Index
from ..database import Base


class NPC(Base):
    __tablename__ = "npcs"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    age = Column(Integer, default=0)
    gender = Column(String(10), default="unknown")
    health = Column(Float, default=80)
    mood = Column(Float, default=50)
    occupation = Column(String(50), default="")
    wealth = Column(Float, default=0)
    traits = Column(JSON, default=list)
    is_alive = Column(Boolean, default=True)

    # Relationships: {char_id: affection}
    affection_map = Column(JSON, default=dict)

    # Family links
    parent_of_ids = Column(JSON, default=list)
    spouse_id = Column(Integer, nullable=True)
    linked_character_id = Column(Integer, nullable=True)

    __table_args__ = (
        Index('idx_npc_linked_character', 'linked_character_id'),
    )

    def affection_with(self, char_id: int) -> float:
        """Get affection towards a specific character."""
        return (self.affection_map or {}).get(str(char_id), 50)

    def set_affection(self, char_id: int, value: float):
        """Set affection towards a character."""
        m = self.affection_map or {}
        m[str(char_id)] = max(0, min(100, value))
        self.affection_map = m

    def adjust_affection(self, char_id: int, delta: float):
        """Adjust affection by delta."""
        current = self.affection_with(char_id)
        self.set_affection(char_id, current + delta)
