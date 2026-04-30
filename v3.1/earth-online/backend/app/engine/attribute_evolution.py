# -*- coding: utf-8 -*-
"""
Attribute Evolution System - Inspired by Chinese life restarter design.
Non-linear feedback mechanisms where attributes interact and evolve together.
"""
from typing import Dict, Any, Optional
from dataclasses import dataclass

from ..models import Character
from .game_fsm import LifeStage


@dataclass
class TraitBonus:
    """Bonus from traits or special states."""
    name: str
    attribute: str
    multiplier: float
    condition: Optional[str] = None


@dataclass
class StageGrowth:
    """Growth multipliers per life stage."""
    stage: LifeStage
    intelligence: float = 1.0
    health: float = 1.0
    charm: float = 1.0
    creativity: float = 1.0


# Stage-based growth patterns
STAGE_GROWTH = {
    LifeStage.INFANT: StageGrowth(
        stage=LifeStage.INFANT,
        intelligence=2.0,  # Brain development peak
        health=1.5,
        charm=1.0,
        creativity=1.2,
    ),
    LifeStage.CHILD: StageGrowth(
        stage=LifeStage.CHILD,
        intelligence=1.5,  # Learning phase
        health=1.2,
        charm=1.1,
        creativity=1.3,
    ),
    LifeStage.TEEN: StageGrowth(
        stage=LifeStage.TEEN,
        intelligence=1.3,  # Academic growth
        health=1.0,
        charm=1.5,  # Social development
        creativity=1.4,
    ),
    LifeStage.YOUNG_ADULT: StageGrowth(
        stage=LifeStage.YOUNG_ADULT,
        intelligence=1.1,
        health=1.0,
        charm=1.3,  # Peak attractiveness
        creativity=1.2,
    ),
    LifeStage.ADULT: StageGrowth(
        stage=LifeStage.ADULT,
        intelligence=0.9,  # Gradual decline
        health=0.9,
        charm=1.0,
        creativity=0.9,
    ),
    LifeStage.SENIOR: StageGrowth(
        stage=LifeStage.SENIOR,
        intelligence=0.7,
        health=0.7,
        charm=0.8,
        creativity=0.8,
    ),
    LifeStage.ELDER: StageGrowth(
        stage=LifeStage.ELDER,
        intelligence=0.5,
        health=0.3,  # Rapid health decline
        charm=0.6,
        creativity=0.6,
    ),
}


# Trait bonuses based on combinations
TRAIT_BONUSES = [
    # Diligent poor - trade health for intelligence
    TraitBonus(
        name="diligent_poor",
        attribute="intelligence",
        multiplier=1.3,
        condition="home < 30 and has_trait('diligent')"
    ),
    # Rich kid - charm and creativity boost
    TraitBonus(
        name="rich_kid",
        attribute="charm",
        multiplier=1.2,
        condition="home > 70"
    ),
    # Academic path - intelligence boost at cost of social
    TraitBonus(
        name="academic_path",
        attribute="intelligence",
        multiplier=1.5,
        condition="choice_was('postgraduate_exam')"
    ),
]


class AttributeEvolutionSystem:
    """
    Non-linear attribute evolution with coupled feedback.
    Changes aren't just additive - attributes interact and evolve together.
    """
    
    def __init__(self, char: Character):
        self.char = char
        self.stage = LifeStage.get_stage(int(char.age))
        self._setup_base_growth()
    
    def _setup_base_growth(self):
        """Set up base growth rate per stage."""
        self.growth = STAGE_GROWTH.get(self.stage, STAGE_GROWTH[LifeStage.ADULT])
    
    def apply_event_growth(self, base_changes: Dict[str, float]) -> Dict[str, float]:
        """
        Apply event-based growth with non-linear modifiers.
        This is the core - simple additive changes become non-linear.
        
        Args:
            base_changes: Raw stat changes from event choice.
        
        Returns:
            Modified stat changes with non-linear effects applied.
        """
        modified_changes = {}
        
        for attr, base_value in base_changes.items():
            # Skip special flags
            if attr in ["is_married", "occupation", "education_level"]:
                modified_changes[attr] = base_value
                continue
            
            modified_value = self._apply_non_linear_modification(attr, base_value)
            modified_changes[attr] = modified_value
        
        # Apply cross-attribute feedback
        self._apply_cross_attribute_feedback(modified_changes)
        
        return modified_changes
    
    def _apply_non_linear_modification(self, attr: str, base_value: float) -> float:
        """
        Apply non-linear modification to a single attribute.
        
        This implements:
        - Stage-based growth multipliers
        - Diminishing returns
        - Threshold-based adjustments
        """
        if base_value == 0:
            return 0
        
        modified_value = base_value
        
        # 1. Apply stage multiplier
        stage_multiplier = self._get_stage_multiplier(attr)
        modified_value *= stage_multiplier
        
        # 2. Apply diminishing returns (don't let high stats grow too fast)
        current_value = getattr(self.char, attr, 0) or 0
        if current_value > 80:
            modified_value *= 0.7
        elif current_value > 60:
            modified_value *= 0.85
        elif current_value < 20:
            modified_value *= 1.3  # Boost for low stats
        
        # 3. Apply floor/ceil for caps
        if attr in ["health", "mood", "energy", "karma"]:
            modified_value = max(-20, min(20, modified_value))  # Keep reasonable
        elif attr in ["intelligence", "charm", "creativity"]:
            modified_value = max(-10, min(15, modified_value))
        elif attr in ["money"]:
            # Money is handled separately
            modified_value = base_value
        
        return round(modified_value, 2)
    
    def _get_stage_multiplier(self, attr: str) -> float:
        """Get multiplier based on life stage."""
        attr_map = {
            "intelligence": lambda g: g.intelligence,
            "health": lambda g: g.health,
            "charm": lambda g: g.charm,
            "creativity": lambda g: g.creativity,
            "mood": lambda g: 1.0,
            "energy": lambda g: g.health,
            "karma": lambda g: 1.0,
            "money": lambda g: 1.0,
        }
        
        return attr_map.get(attr, lambda g: 1.0)(self.growth)
    
    def _apply_cross_attribute_feedback(self, changes: Dict[str, float]):
        """
        Apply cross-attribute feedback.
        e.g., Studying more (intelligence+) might make you tired (energy-)
        This is a simplified version - expand as needed.
        """
        # Example: Intelligence boost may slightly reduce energy
        if changes.get("intelligence", 0) > 3:
            current_energy = getattr(self.char, "energy", 50) or 50
            # Don't let energy drop too much
            energy_penalty = min(2, changes["intelligence"] * 0.2)
            if "energy" not in changes:
                changes["energy"] = -energy_penalty
            else:
                changes["energy"] -= energy_penalty
        
        # Example: Health boost may improve mood
        if changes.get("health", 0) > 2:
            mood_boost = changes["health"] * 0.3
            if "mood" not in changes:
                changes["mood"] = mood_boost
            else:
                changes["mood"] += mood_boost
    
    def apply_natural_aging(self) -> Dict[str, float]:
        """
        Apply natural aging effects.
        This runs every year regardless of event.
        """
        aging_effects = {}
        
        # Natural health decay based on stage
        if self.stage == LifeStage.ELDER:
            aging_effects["health"] = -1.5
        elif self.stage == LifeStage.SENIOR:
            aging_effects["health"] = -0.5
        elif self.stage == LifeStage.INFANT:
            aging_effects["health"] = 1.0  # Growth!
            aging_effects["intelligence"] = 2.0
        
        # Mood generally stabilizes with age
        if self.stage in [LifeStage.ADULT, LifeStage.SENIOR, LifeStage.ELDER]:
            aging_effects["mood"] = 0.3
        
        return aging_effects
