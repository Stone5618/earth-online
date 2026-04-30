"""Event template model."""

from sqlalchemy import Column, Integer, String, Float, Boolean, JSON, Text, Index

from ..database import Base


class EventTemplate(Base):
    """Event template stored in DB for event matching."""
    __tablename__ = "event_templates"
    __table_args__ = (
        Index('idx_event_templates_active_category_age', 'is_active', 'category', 'min_age', 'max_age'),
    )

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, default="")
    category = Column(String(50), default="life", index=True)  # life/health/wealth/relationship/education

    # Filter conditions
    min_age = Column(Integer, default=0)
    max_age = Column(Integer, default=120)
    required_culture_tags = Column(JSON, default=list)
    forbidden_culture_tags = Column(JSON, default=list)
    required_attrs = Column(JSON, default=dict)     # {"health__lt": 30, "money__gte": 10000}
    forbidden_attrs = Column(JSON, default=dict)
    required_flags = Column(JSON, default=list)
    forbidden_flags = Column(JSON, default=list)
    cooldown_category = Column(String(50), nullable=True)
    cooldown_years = Column(Integer, default=0)

    # Event chain fields
    is_chain_event = Column(Boolean, default=False)
    chain_id = Column(String(50), nullable=True)
    step_id = Column(String(50), nullable=True)
    immediate = Column(Boolean, default=False)

    # Era trigger
    era_trigger = Column(String(50), nullable=True)  # "normal", "era_boom", "era_recession", etc.

    # Outcome weighting
    outcome_weighted = Column(Boolean, default=False)

    # Weight
    base_weight = Column(Float, default=1.0)
    difficulty_level = Column(Float, default=0.5)  # 0.0~1.0

    # Possible choices
    choices = Column(JSON, default=list)
    # [{ "text": "...", "stat_changes": {...}, "follow_up": "...", "difficulty_mod": 0.5 }, ...]

    # Causal effects
    causality_effects = Column(JSON, default=list)

    # Metadata
    is_active = Column(Boolean, default=True)
    created_at = Column(String(30), default="")

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "category": self.category,
            "min_age": self.min_age,
            "max_age": self.max_age,
            "base_weight": self.base_weight,
            "difficulty_level": self.difficulty_level,
            "is_active": self.is_active,
            "created_at": self.created_at,
            "required_culture_tags": self.required_culture_tags,
            "forbidden_culture_tags": self.forbidden_culture_tags,
            "required_attrs": self.required_attrs,
            "forbidden_attrs": self.forbidden_attrs,
            "required_flags": self.required_flags,
            "forbidden_flags": self.forbidden_flags,
            "cooldown_category": self.cooldown_category,
            "cooldown_years": self.cooldown_years,
            "is_chain_event": self.is_chain_event,
            "chain_id": self.chain_id,
            "step_id": self.step_id,
            "immediate": self.immediate,
            "era_trigger": self.era_trigger,
            "outcome_weighted": self.outcome_weighted,
            "choices": self.choices,
            "causality_effects": self.causality_effects,
        }
