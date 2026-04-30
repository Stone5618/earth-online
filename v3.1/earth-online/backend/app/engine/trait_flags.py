# -*- coding: utf-8 -*-
"""
Trait Flags System (Hidden Attributes) - Inspired by BitLife design.
Early choices have long-term hidden effects that surface years later.
"""
from typing import Dict, List, Set, Optional, Any, Callable
from dataclasses import dataclass, field
from enum import Enum, auto

from ..models import Character


class Trait(Enum):
    """Hidden traits that affect gameplay."""
    # Learning and talent
    EARLY_MUSIC_TRAINING = auto()    #学音乐
    EARLY_ART_TRAINING = auto()      #学美术
    EXTRA_CURRICULAR_STAR = auto()   #社团达人
    BOOKWORM = auto()                 #书虫
    
    # Personality
    DILIGENT = auto()                 #勤奋
    CHARMING = auto()                #魅力
    CREATIVE = auto()               #创造力
    RISK_TAKER = auto()              #冒险精神
    
    # Background
    RICH_KID = auto()                #富二代
    POOR_BUT_HARDWORKING = auto()    #穷但努力
    ACADEMIC_PATH = auto()            #学术路线
    
    # Hidden states
    HAS_CRIMINAL_RECORD = auto()      #有案底
    MARRIAGE_FAILURES = auto()       #婚姻失败
    PROMOTION_HISTORY = auto()       #晋升历史


@dataclass
class TraitEffect:
    """Effect of a hidden trait on events."""
    trait: Trait
    affected_categories: List[str]  # which event categories are affected
    weight_multiplier: float         # how much to multiply event weight
    description: str
    age_requirement: Optional[int] = None  # When does this start applying?


@dataclass
class TraitTrigger:
    """Condition that unlocks a hidden trait."""
    trait: Trait
    condition: Callable[[Character], bool]
    unlock_event: Optional[str] = None  # Optional event text when unlocked
    one_time: bool = True


# =============================================
# Trait definitions and effects
# =============================================
TRAIT_EFFECTS: List[TraitEffect] = [
    # Early music training → 47% higher chance of rock star career
    TraitEffect(
        trait=Trait.EARLY_MUSIC_TRAINING,
        affected_categories=["career", "relationship"],
        weight_multiplier=1.47,
        description="早期音乐训练增加艺术相关职业成功率",
        age_requirement=18,
    ),
    
    # Rich kid → charm and career boost
    TraitEffect(
        trait=Trait.RICH_KID,
        affected_categories=["career", "relationship", "education"],
        weight_multiplier=1.2,
        description="富二代有更多社会资源",
        age_requirement=10,
    ),
    
    # Poor but hardworking → intelligence boost, health risk
    TraitEffect(
        trait=Trait.POOR_BUT_HARDWORKING,
        affected_categories=["education", "career"],
        weight_multiplier=1.3,
        description="寒门贵子，更努力",
        age_requirement=15,
    ),
    
    # Bookworm → education boost, social penalty
    TraitEffect(
        trait=Trait.BOOKWORM,
        affected_categories=["education"],
        weight_multiplier=1.4,
        description="书虫在学习上有优势",
        age_requirement=8,
    ),
    
    # Extra curricular star → scholarship boost
    TraitEffect(
        trait=Trait.EXTRA_CURRICULAR_STAR,
        affected_categories=["education", "career"],
        weight_multiplier=1.3,
        description="社团达人更容易获得奖学金和工作",
        age_requirement=16,
    ),
]


# =============================================
# Trait triggers
# =============================================
def _trigger_music_training(char: Character) -> bool:
    """Check if early music training trait is triggered."""
    flags = char.flags or {}
    # Look for music lesson event in history
    recent_titles = char.recent_event_titles or []
    return any("音乐" in title or "music" in title.lower() for title in recent_titles) and char.age <= 12


def _trigger_rich_kid(char: Character) -> bool:
    """Rich kid trigger - high starting wealth."""
    family_tier = getattr(char, "family_tier", 5) or 5
    return family_tier >= 8 or (char.money or 0) >= 100000


def _trigger_poor_hardworking(char: Character) -> bool:
    """Poor but hardworking - low wealth but studying hard."""
    family_tier = getattr(char, "family_tier", 5) or 5
    intelligence = char.intelligence or 50
    return family_tier <= 3 and intelligence >= 70


def _trigger_bookworm(char: Character) -> bool:
    """Bookworm - lots of education events."""
    recent_cats = char.recent_event_categories or []
    education_count = recent_cats.count("education")
    return education_count >= 3 and char.age <= 15


def _trigger_extra_curricular(char: Character) -> bool:
    """Extra curricular star - 2+ activities."""
    flags = char.flags or {}
    activities = flags.get("activities", [])
    return len(activities) >= 2 and char.age <= 18


TRAIT_TRIGGERS: List[TraitTrigger] = [
    TraitTrigger(
        trait=Trait.EARLY_MUSIC_TRAINING,
        condition=_trigger_music_training,
        unlock_event="童年音乐训练已为你埋下艺术种子",
    ),
    TraitTrigger(
        trait=Trait.RICH_KID,
        condition=_trigger_rich_kid,
        unlock_event="优越的家庭背景是你的隐藏优势",
    ),
    TraitTrigger(
        trait=Trait.POOR_BUT_HARDWORKING,
        condition=_trigger_poor_hardworking,
        unlock_event="穷且益坚，你会更努力",
    ),
    TraitTrigger(
        trait=Trait.BOOKWORM,
        condition=_trigger_bookworm,
        unlock_event="你是个小书虫",
    ),
    TraitTrigger(
        trait=Trait.EXTRA_CURRICULAR_STAR,
        condition=_trigger_extra_curricular,
        unlock_event="社团达人！",
    ),
]


class TraitFlagsSystem:
    """
    Hidden trait flags system - the core innovation from BitLife.
    Early choices have delayed, hidden effects that surface years later.
    """
    
    def __init__(self, char: Character):
        self.char = char
        self._load_current_traits()
    
    def _load_current_traits(self):
        """Load active traits from character flags."""
        flags = self.char.flags or {}
        active_traits_raw = flags.get("active_traits", [])
        
        # Parse back to Trait enum
        self.active_traits: Set[Trait] = set()
        for trait_name in active_traits_raw:
            try:
                self.active_traits.add(Trait[trait_name])
            except (KeyError, ValueError):
                continue
    
    def _save_current_traits(self):
        """Save active traits to character flags."""
        flags = self.char.flags or {}
        flags["active_traits"] = [trait.name for trait in self.active_traits]
        self.char.flags = flags
    
    def check_and_unlock_traits(self) -> List[Trait]:
        """
        Check all trait triggers and unlock any new traits.
        
        Returns:
            List of newly unlocked traits.
        """
        newly_unlocked: List[Trait] = []
        
        for trigger in TRAIT_TRIGGERS:
            if trigger.trait in self.active_traits and trigger.one_time:
                continue  # Already unlocked, skip
            
            if trigger.condition(self.char):
                self.active_traits.add(trigger.trait)
                newly_unlocked.append(trigger.trait)
                
                if trigger.unlock_event:
                    # Can be stored for later notification
                    flags = self.char.flags or {}
                    unlocks = flags.get("unlock_events", [])
                    unlocks.append({
                        "trait": trigger.trait.name,
                        "age": self.char.age,
                        "event": trigger.unlock_event,
                    })
                    flags["unlock_events"] = unlocks
                    self.char.flags = flags
        
        if newly_unlocked:
            self._save_current_traits()
        
        return newly_unlocked
    
    def get_trait_modifiers(self, event_category: str) -> Dict[Trait, float]:
        """
        Get all applicable trait modifiers for an event category.
        
        Returns:
            Dict of trait -> multiplier
        """
        modifiers = {}
        age = int(self.char.age)
        
        for effect in TRAIT_EFFECTS:
            if effect.trait not in self.active_traits:
                continue
            
            if event_category not in effect.affected_categories:
                continue
            
            if effect.age_requirement and age < effect.age_requirement:
                continue
            
            modifiers[effect.trait] = effect.weight_multiplier
        
        return modifiers
    
    def get_combined_weight_multiplier(self, event_category: str) -> float:
        """
        Get combined multiplier for an event category (product of all traits).
        """
        modifiers = self.get_trait_modifiers(event_category)
        total = 1.0
        
        for multiplier in modifiers.values():
            total *= multiplier
        
        return total
    
    def record_activity(self, activity_name: str):
        """Record an activity for trait triggers."""
        flags = self.char.flags or {}
        activities = flags.get("activities", [])
        if activity_name not in activities:
            activities.append(activity_name)
        flags["activities"] = activities
        self.char.flags = flags
    
    def get_trait_summary(self) -> Dict[str, Any]:
        """Get a summary of active traits and effects (for debugging/debug mode)."""
        unlocked_events = (self.char.flags or {}).get("unlock_events", [])
        return {
            "active_traits": [trait.name for trait in self.active_traits],
            "unlock_history": unlocked_events,
        }
