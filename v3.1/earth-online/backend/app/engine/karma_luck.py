# -*- coding: utf-8 -*-
"""
Karma and Luck System - Inspired by inZOI and BitLife design.
Karma (invisible) affects probabilities.
Luck (independent) affects outcomes.
Chain reactions for interesting gameplay.
"""
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass
from enum import Enum, auto
import math

from ..models import Character


class KarmaAction(Enum):
    """Actions that affect karma."""
    POSITIVE = auto()
    NEGATIVE = auto()
    NEUTRAL = auto()


@dataclass
class KarmaEffect:
    """Karma effect from an action."""
    action_name: str
    karma_change: float
    category: str  # career, health, relationship, etc.
    description: str


@dataclass
class LuckChain:
    """Luck chain reaction."""
    trigger_event: str
    luck_change: float
    duration: int  # How many years this lasts
    max_duration: int = 3


# =============================================
# Action definitions
# =============================================
KARMA_ACTIONS = {
    # Positive actions
    "charity": KarmaEffect("慈善捐赠", 15, "life", "助人为乐"),
    "help_stranger": KarmaEffect("帮助陌生人", 8, "relationship", "举手之劳"),
    "study_hard": KarmaEffect("努力学习", 5, "education", "天道酬勤"),
    "work_hard": KarmaEffect("努力工作", 8, "career", "劳有所得"),
    "honest": KarmaEffect("诚实", 10, "life", "问心无愧"),
    
    # Negative actions
    "crime": KarmaEffect("犯罪", -25, "life", "法网恢恢"),
    "steal": KarmaEffect("偷窃", -15, "life", "不义之财"),
    "lie": KarmaEffect("说谎", -8, "relationship", "失信于人"),
    "lazy": KarmaEffect("懒惰", -5, "career", "不劳无获"),
}


class KarmaLuckSystem:
    """
    Combined Karma and Luck system.
    Karma accumulates invisibly and affects probabilities.
    Luck is independent and affects success/failure.
    Chain reactions create interesting emergent gameplay.
    """
    
    # Karma caps
    MIN_KARMA = -100
    MAX_KARMA = 100
    
    # Luck caps
    MIN_LUCK = -20
    MAX_LUCK = 20
    
    def __init__(self, char: Character):
        self.char = char
        self._setup_initial_values()
        self.active_luck_chains: List[LuckChain] = []
    
    def _setup_initial_values(self):
        """Initialize or load karma and luck values."""
        flags = self.char.flags or {}
        
        # Karma is hidden - not shown to user
        self.karma = flags.get("karma", 0.0)
        
        # Luck is visible stat (already exists!)
        self.luck = self.char.luck or 50
        # Normalize to our system
        if self.luck > 100:
            self.luck = 100
        elif self.luck < 0:
            self.luck = 0
    
    def _save_values(self):
        """Save karma and luck changes."""
        flags = self.char.flags or {}
        flags["karma"] = self.karma
        self.char.flags = flags
        
        # Update visible luck stat
        self.char.luck = int(max(0, min(100, self.luck)))
    
    def apply_action(self, action_name: str) -> Dict[str, Any]:
        """
        Apply a karma action and update karma.
        
        Returns:
            Summary of change.
        """
        effect = KARMA_ACTIONS.get(action_name)
        if effect:
            old_karma = self.karma
            self.karma = max(self.MIN_KARMA, min(self.MAX_KARMA, 
                                                self.karma + effect.karma_change))
            self._save_values()
            
            return {
                "action": action_name,
                "karma_change": effect.karma_change,
                "old_karma": old_karma,
                "new_karma": self.karma,
            }
        
        return {}
    
    def get_karma_multiplier(self, event_category: str, is_positive: bool) -> float:
        """
        Get karma probability multiplier.
        
        Good karma makes good events more likely.
        Bad karma makes bad events more likely.
        """
        normalized_karma = max(-1.0, min(1.0, self.karma / 50.0))
        
        if is_positive:
            # Positive event: good karma → boost
            multiplier = 1.0 + normalized_karma * 0.5
        else:
            # Negative event: bad karma → boost
            multiplier = 1.0 - normalized_karma * 0.5
        
        return max(0.2, min(2.0, multiplier))
    
    def roll_luck(self, base_probability: float, difficulty: float = 0.5) -> Tuple[bool, float]:
        """
        Roll luck for an outcome.
        
        Args:
            base_probability: Base success chance (0-1)
            difficulty: How hard is this (0-1, higher = harder)
        
        Returns:
            (success, effective_probability)
        """
        # Luck affects success
        luck_factor = (self.luck - 50) / 50.0  # -1 to +1
        
        # Difficulty counteracts luck
        difficulty_penalty = (difficulty - 0.5) * 0.4
        
        effective_prob = base_probability + luck_factor * 0.3 - difficulty_penalty
        effective_prob = max(0.05, min(0.95, effective_prob))
        
        # Use our RNG later, but for now we can use random
        # For now, deterministic for testing
        import random
        roll = random.random()
        success = roll < effective_prob
        
        return success, effective_prob
    
    def apply_luck_chain(self, trigger_event: str, success: bool):
        """
        Apply luck chain reaction.
        Success → boosts luck for a short time.
        Failure → reduces luck (but potentially creates comeback mechanic).
        """
        if success:
            # Success → luck boost!
            boost = min(5, 2 + math.log(self.char.age))
            self.luck = min(self.MAX_LUCK + 30, self.luck + boost)
            chain = LuckChain(
                trigger_event=trigger_event,
                luck_change=boost,
                duration=3,
                max_duration=3
            )
            self.active_luck_chains.append(chain)
        else:
            # Failure → luck penalty (but with comeback potential)
            penalty = min(3, 1 + (self.char.age / 30))
            self.luck = max(self.MIN_LUCK, self.luck - penalty)
            
            # Comeback mechanic: really low luck triggers a boost
            if self.luck < 10 and len(self.active_luck_chains) == 0:
                chain = LuckChain(
                    trigger_event=trigger_event + "_comeback",
                    luck_change=8,
                    duration=2,
                    max_duration=2
                )
                self.active_luck_chains.append(chain)
                self.luck += 8
        
        self._save_values()
    
    def age_up(self):
        """
        Called each year to update luck chains and natural decay.
        """
        # Decay karma (back towards 0)
        karma_decay = self.karma * 0.05
        self.karma -= karma_decay
        
        # Process luck chains
        chains_to_remove = []
        for chain in self.active_luck_chains:
            chain.duration -= 1
            if chain.duration <= 0:
                # Chain ends
                self.luck -= chain.luck_change
                chains_to_remove.append(chain)
        
        for chain in chains_to_remove:
            self.active_luck_chains.remove(chain)
        
        # Natural luck mean-reversion
        mean_luck = 50
        luck_gap = mean_luck - self.luck
        self.luck += luck_gap * 0.05
        
        # Save
        self._save_values()
    
    def get_karma_level(self) -> str:
        """Get karma level name (for debug or NPC interactions)."""
        if self.karma >= 70:
            return "圣人"
        elif self.karma >= 40:
            return "善人"
        elif self.karma >= 10:
            return "好人"
        elif self.karma >= -10:
            return "普通人"
        elif self.karma >= -40:
            return "坏人"
        else:
            return "恶人"
    
    def get_summary(self) -> Dict[str, Any]:
        """Get system summary (for debug)."""
        return {
            "karma": round(self.karma, 1),
            "karma_level": self.get_karma_level(),
            "luck": self.luck,
            "active_chains": len(self.active_luck_chains),
        }
