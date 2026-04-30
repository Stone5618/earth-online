# -*- coding: utf-8 -*-
"""
Hierarchical Probability Tree - Inspired by Chinese life restarter design.
This is the core innovation - layered probability system with conditional weights.
"""
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass
from sqlalchemy.orm import Session

from ..models import Character, Server
from .game_fsm import LifeStage
from .event_template_cache import get_cached_templates
from .xorshift_rng import XorShift128PlusRNG, get_rng


@dataclass
class ConditionWeight:
    """Conditional weight modifier."""
    condition: str  # Attribute condition
    multiplier: float  # Weight multiplier
    operator: str = "gte"  # "gte", "lte", "eq", "lt", "gt"


@dataclass
class CategoryConfig:
    """Event category configuration for each stage."""
    name: str
    base_weight: float
    stage_modifiers: Dict[LifeStage, float]
    conditions: List[ConditionWeight]


# Category definitions with stage-based weights
CATEGORY_CONFIGS = [
    CategoryConfig(
        name="education",
        base_weight=1.0,
        stage_modifiers={
            LifeStage.INFANT: 0.1,
            LifeStage.CHILD: 2.5,
            LifeStage.TEEN: 3.0,
            LifeStage.YOUNG_ADULT: 2.0,
            LifeStage.ADULT: 0.5,
            LifeStage.SENIOR: 0.2,
            LifeStage.ELDER: 0.1,
        },
        conditions=[
            ConditionWeight("intelligence", 1.3, "gte"),
            ConditionWeight("karma", 0.8, "lt"),
        ]
    ),
    CategoryConfig(
        name="career",
        base_weight=1.0,
        stage_modifiers={
            LifeStage.INFANT: 0.0,
            LifeStage.CHILD: 0.1,
            LifeStage.TEEN: 0.5,
            LifeStage.YOUNG_ADULT: 2.5,
            LifeStage.ADULT: 2.0,
            LifeStage.SENIOR: 1.0,
            LifeStage.ELDER: 0.3,
        },
        conditions=[
            ConditionWeight("intelligence", 1.2, "gte"),
            ConditionWeight("health", 1.1, "gte"),
        ]
    ),
    CategoryConfig(
        name="relationship",
        base_weight=1.0,
        stage_modifiers={
            LifeStage.INFANT: 0.5,
            LifeStage.CHILD: 1.0,
            LifeStage.TEEN: 2.0,
            LifeStage.YOUNG_ADULT: 2.5,
            LifeStage.ADULT: 1.5,
            LifeStage.SENIOR: 1.0,
            LifeStage.ELDER: 0.8,
        },
        conditions=[
            ConditionWeight("charm", 1.3, "gte"),
            ConditionWeight("mood", 1.2, "gte"),
        ]
    ),
    CategoryConfig(
        name="health",
        base_weight=1.0,
        stage_modifiers={
            LifeStage.INFANT: 1.5,
            LifeStage.CHILD: 0.8,
            LifeStage.TEEN: 0.5,
            LifeStage.YOUNG_ADULT: 0.3,
            LifeStage.ADULT: 0.8,
            LifeStage.SENIOR: 1.5,
            LifeStage.ELDER: 2.5,
        },
        conditions=[
            ConditionWeight("health", 0.6, "gte"),
            ConditionWeight("health", 1.4, "lt"),
        ]
    ),
    CategoryConfig(
        name="life",
        base_weight=1.0,
        stage_modifiers={
            LifeStage.INFANT: 1.0,
            LifeStage.CHILD: 1.0,
            LifeStage.TEEN: 1.0,
            LifeStage.YOUNG_ADULT: 1.0,
            LifeStage.ADULT: 1.0,
            LifeStage.SENIOR: 1.0,
            LifeStage.ELDER: 1.0,
        },
        conditions=[]
    ),
]


class HierarchicalProbabilityTree:
    """
    3-layer probability tree:
    Level 1: Life stage
    Level 2: Event category (education/career/relationship/health/life)
    Level 3: Specific events
    """
    
    def __init__(self, char: Character, server: Server, db: Session):
        self.char = char
        self.server = server
        self.db = db
        self.templates = get_cached_templates(db)
        self.stage = LifeStage.get_stage(int(char.age))
        self.rng = get_rng(user_id=char.user_id if hasattr(char, 'user_id') else None)
    
    def trigger_event(self) -> Optional[Dict[str, Any]]:
        """Main method - trigger event through all 3 layers."""
        # Layer 1: Already determined - self.stage
        
        # Layer 2: Select event category
        selected_category = self._select_category()
        
        # Layer 3: Select specific event
        selected_event = self._select_specific_event(selected_category)
        
        return selected_event
    
    def _calculate_category_weights(self) -> Dict[str, float]:
        """Calculate weights for each category based on stage and conditions."""
        weights = {}
        
        for config in CATEGORY_CONFIGS:
            # Start with base weight
            weight = config.base_weight
            
            # Apply stage modifier
            stage_mod = config.stage_modifiers.get(self.stage, 1.0)
            weight *= stage_mod
            
            # Apply conditional modifiers
            for cond in config.conditions:
                weight *= self._apply_condition_modifier(cond)
            
            weights[config.name] = weight
        
        return weights
    
    def _select_category(self) -> str:
        """Layer 2 selection: pick an event category."""
        weights = self._calculate_category_weights()
        
        # Normalize weights (ensure sum is non-zero)
        total_weight = sum(weights.values())
        if total_weight <= 0:
            return "life"  # Fallback
        
        # Weighted random selection
        categories = list(weights.keys())
        category_weights = [weights[cat] for cat in categories]
        
        return self.rng.choices(categories, weights=category_weights, k=1)[0]
    
    def _filter_events_by_category(self, category: str) -> List[Dict]:
        """Filter events that match the category and stage."""
        filtered = []
        
        for ev in self.templates:
            # Skip chain events - they are handled separately in match_event Phase 0
            if ev.get("is_chain_event"):
                continue
            
            # Check category match or milestone (always high priority)
            event_cat = ev.get("category", "life")
            if event_cat == category or event_cat == "milestone":
                # Check age range
                min_age = ev.get("min_age", 0)
                max_age = ev.get("max_age", 120)
                if min_age <= self.char.age <= max_age:
                    filtered.append(ev)
        
        return filtered
    
    def _select_specific_event(self, category: str) -> Optional[Dict]:
        """Layer 3 selection: pick a specific event within category."""
        candidates = self._filter_events_by_category(category)
        
        if not candidates:
            return None
        
        # Calculate dynamic weights for candidates
        event_weights = []
        for ev in candidates:
            weight = ev.get("base_weight", 1.0)
            
            # Apply difficulty modifier
            difficulty = ev.get("difficulty_level", 0.5)
            weight *= 1 + (self.server.difficulty - 0.5) * 0.3
            
            event_weights.append(weight)
        
        # Select
        selected = self.rng.choices(candidates, weights=event_weights, k=1)[0]
        return selected
    
    def _apply_condition_modifier(self, cond: ConditionWeight) -> float:
        """Apply a conditional weight modifier."""
        attr_value = getattr(self.char, cond.condition, 0) or 0
        threshold = 50  # Default threshold (can adjust)
        
        if cond.operator == "gte":
            return cond.multiplier if attr_value >= threshold else 1.0
        elif cond.operator == "lte":
            return cond.multiplier if attr_value <= threshold else 1.0
        elif cond.operator == "gt":
            return cond.multiplier if attr_value > threshold else 1.0
        elif cond.operator == "lt":
            return cond.multiplier if attr_value < threshold else 1.0
        elif cond.operator == "eq":
            return cond.multiplier if attr_value == threshold else 1.0
        
        return 1.0
