"""Event matching engine with layered priority and dynamic weights.
UPGRADED with ALL mature life restarter features:
- FSM (Finite State Machine)
- Hierarchical Probability Tree
- Non-linear Attribute Evolution
- XorShift128+ High-Quality RNG
- Trait Flags (Hidden Attributes)
- Karma & Luck System
- Weekly Challenge System
- Event Template Cache with TTL
- Database-backed template loading
"""

from sqlalchemy.orm import Session
from ..models import Character, Server
from .event_template_cache import get_cached_templates, invalidate_template_cache
from .event_chain import (
    check_start_event_chains, start_event_chain, 
    get_active_chain_event, advance_event_chain
)
from .hierarchical_probability_tree import HierarchicalProbabilityTree
from .attribute_evolution import AttributeEvolutionSystem
from .game_fsm import GameFSM, LifeStage
from .xorshift_rng import XorShift128PlusRNG, get_rng
from .trait_flags import TraitFlagsSystem
from .karma_luck import KarmaLuckSystem

ATTR_NAMES = {
    "health": "健康",
    "mood": "心情",
    "energy": "精力",
    "money": "金钱",
    "intelligence": "智力",
    "charm": "魅力",
    "creativity": "创造力",
    "luck": "运气",
    "karma": "业力",
    "physical_fitness": "体能",
    "emotional_stability": "情绪稳定",
    "social_capital": "社交",
    "reputation": "声望",
}

def _generate_outcome_text(stat_changes: dict, event_title: str) -> str:
    """Generate a meaningful outcome text based on stat changes when follow_up is empty."""
    if not stat_changes:
        return "你平静地度过了这一年。"
    
    # Find the most significant change
    significant = []
    for attr, value in stat_changes.items():
        if attr in ATTR_NAMES and abs(value) >= 2:
            name = ATTR_NAMES[attr]
            if value > 0:
                significant.append(f"{name}提升了")
            elif value < 0:
                significant.append(f"{name}下降了")
    
    if not significant:
        return "生活悄然向前，一切如常。"
    
    if len(significant) == 1:
        return f"{significant[0]}，你的选择带来了改变。"
    
    return f"{'、'.join(significant[:2])}，你的选择带来了改变。"

def _check_attrs(char: Character, required_attrs: dict) -> bool:
    """Check attribute conditions like {'intelligence__gte': 50, 'money__lt': 10000}."""
    for key, val in (required_attrs or {}).items():
        if "__" in key:
            attr, op = key.split("__", 1)
        else:
            attr, op = key, "eq"
        current = getattr(char, attr, 0)

        if op == "gte" and current < val:
            return False
        if op == "lte" and current > val:
            return False
        if op == "lt" and current >= val:
            return False
        if op == "gt" and current <= val:
            return False
        if op == "eq" and current != val:
            return False
    return True


def _check_flags(char: Character, required_flags: list, forbidden_flags: list) -> bool:
    """Check character flags."""
    char_flags = char.flags or {}

    for flag in (required_flags or []):
        if flag not in char_flags:
            return False

    for flag in (forbidden_flags or []):
        if flag in char_flags:
            return False

    return True


def _calculate_dynamic_weights(candidates: list, char: Character, server: Server, rng=None) -> list[float]:
    """
    Adjust weights with ALL new systems:
    - Original streak/difficulty/health logic
    - Trait flags modifiers
    - Karma probability multipliers
    """
    streak = 0
    for outcome in reversed((char.trait_memory or [])[-10:]):
        if outcome == 1:
            streak = streak + 1 if streak >= 0 else 1
        elif outcome == -1:
            streak = streak - 1 if streak <= 0 else -1
        else:
            break

    # ============== Initialize new systems ==============
    trait_system = TraitFlagsSystem(char)
    karma_system = KarmaLuckSystem(char)

    weights = []
    for ev in candidates:
        w = ev.get("base_weight", 1.0)
        category = ev.get("category", "life")
        is_positive = ev.get("is_positive", category in ["education", "career", "relationship"])

        dl = ev.get("difficulty_level", 0.5)
        # Streak protection: if losing streak >= 3, reduce hard events
        if streak <= -3 and dl >= 0.7:
            w *= 0.2
        # Streak challenge: if winning streak >= 3, reduce easy events
        elif streak >= 3 and dl <= 0.3:
            w *= 0.2

        # Server difficulty modifier
        w *= 1 + (server.difficulty - 0.5) * 0.3

        # Health protection
        if char.health < 30 and dl >= 0.7:
            w *= 0.5

        # Mood boost for sad characters
        if char.mood < 30 and dl <= 0.3:
            w *= 1.3
        
        # ============== Trait flags modifier ==============
        trait_multiplier = trait_system.get_combined_weight_multiplier(category)
        w *= trait_multiplier
        
        # ============== Karma multiplier ==============
        karma_multiplier = karma_system.get_karma_multiplier(category, is_positive)
        w *= karma_multiplier

        weights.append(max(w, 0.05))

    return weights


def _cultural_match(ev: dict, server: Server) -> bool:
    """Check if event's culture tags match the server."""
    required = ev.get("required_culture_tags", [])
    forbidden = ev.get("forbidden_culture_tags", [])
    server_tags = server.culture_tags or []

    if required:
        if not all(tag in server_tags for tag in required):
            return False
    if forbidden:
        if any(tag in server_tags for tag in forbidden):
            return False
    return True


def match_event(char: Character, server: Server, db: Session = None, era: str = "normal") -> tuple[dict, dict] | None:
    """Find the best matching event for this character now.
    Priority: event chain > milestone > hierarchical probability tree > normal.
    era: current global era ("normal", "era_boom", "era_recession", etc.).
    
    Returns:
        A tuple of (event_view, event_data) if an event is matched, None otherwise.
        event_view: Frontend-friendly event representation.
        event_data: Full event template data for processing choices.
    """
    age = int(char.age)
    if db is None:
        from ..database import SessionLocal
        db_session = SessionLocal()
        try:
            return _do_match_event(char, server, db_session, era, age)
        finally:
            db_session.close()
    return _do_match_event(char, server, db, era, age)


def _do_match_event(char: Character, server: Server, db: Session, era: str, age: int) -> tuple[dict, dict] | None:
    """Internal match implementation with guaranteed db session."""
    templates = get_cached_templates(db)

    # ============== Phase 0: Check Event Chain (TOP PRIORITY) ==============
    chain_template, is_immediate = get_active_chain_event(char, templates)
    if chain_template:
        # Build the view - include chain info
        event_view = {
            "event_id": hash(chain_template["title"] + str(age)) % 100000,
            "title": chain_template["title"],
            "description": chain_template["description"],
            "options": [
                {"index": i, "text": c["text"], "hint": c.get("follow_up", "")[:50] + "..." if len(c.get("follow_up", "")) > 50 else c.get("follow_up", "")}
                for i, c in enumerate(chain_template["choices"])
            ],
            "category": chain_template.get("category", "life"),
            "is_chain_event": True,
            "chain_id": chain_template.get("chain_id"),
            "step_id": chain_template.get("step_id"),
            "immediate": is_immediate,
        }
        return event_view, chain_template
    
    # ============== Check if we can start any new chain ==============
    startable_chains = check_start_event_chains(char)
    if startable_chains and db:
        # Start the first one
        start_event_chain(char, startable_chains[0])
    
    # ============== Phase 1: Hierarchical Probability Tree ==============
    # Use Chinese life restarter design for better realism
    hpt = HierarchicalProbabilityTree(char, server, db)
    hpt_result = hpt.trigger_event()
    if hpt_result:
        event_view = {
            "event_id": hash(hpt_result["title"] + str(age)) % 100000,
            "title": hpt_result["title"],
            "description": hpt_result["description"],
            "options": [
                {"index": i, "text": c["text"], "hint": c.get("follow_up", "")[:50] + "..." if len(c.get("follow_up", "")) > 50 else c.get("follow_up", "")}
                for i, c in enumerate(hpt_result["choices"])
            ],
            "category": hpt_result.get("category", "life"),
            "is_hpt_event": True,
        }
        return event_view, hpt_result
    
    # ============== Phase 1: Gather regular candidates ==============
    candidates = []
    fallback_events = []
    age_matched_events = []

    for ev in templates:
        # Skip chain events in regular matching - they are handled in Phase 0
        if ev.get("is_chain_event"):
            continue

        # Age bounds - 必须匹配年龄，这是最基本的要求
        if not (ev.get("min_age", 0) <= age <= ev.get("max_age", 100)):
            continue
        
        # 记录所有年龄匹配的事件作为最终fallback
        age_matched_events.append(ev)

        # Culture tag matching
        if not _cultural_match(ev, server):
            continue

        # Attribute conditions
        if not _check_attrs(char, ev.get("required_attrs", {})):
            continue

        # Flags
        if not _check_flags(char, ev.get("required_flags", []), ev.get("forbidden_flags", [])):
            continue

        # Era trigger: if event has era_trigger, only match current era
        era_trigger = ev.get("era_trigger")
        if era_trigger and era_trigger != era:
            continue

        # Cooldown (skip if same category was seen recently)
        cooldown_cat = ev.get("cooldown_category")
        if cooldown_cat and cooldown_cat in (char.recent_event_categories or []):
            continue

        # Skip if the exact same title was already played (avoid repeats)
        if ev["title"] in (char.recent_event_titles or []):
            continue

        # Mark as milestone (highest priority)
        if ev.get("category") == "milestone":
            candidates.insert(0, ev)
        elif ev.get("category") == "era":
            # Era events are mid-priority
            mid_idx = len(candidates) // 2
            candidates.insert(mid_idx, ev)
        else:
            candidates.append(ev)

        # Save as fallback if no extra conditions (除了年龄外没有其他限制)
        if not ev.get("required_attrs") and not ev.get("required_flags") and not ev.get("era_trigger"):
            fallback_events.append(ev)

    if not candidates:
        # Use fallback events (年龄匹配且无额外条件)
        candidates = fallback_events

    if not candidates:
        # 使用所有年龄匹配的事件作为最终fallback，确保不会无事件
        candidates = age_matched_events

    if not candidates:
        # Last resort: return a universal event that matches any age
        # This should never happen, but ensures the game never gets stuck
        from .universal_events import UNIVERSAL_EVENTS
        import random
        universal = random.choice(UNIVERSAL_EVENTS)
        event_view = {
            "event_id": hash(universal["title"] + str(age)) % 100000,
            "title": universal["title"],
            "description": universal["description"],
            "options": [
                {"index": i, "text": c["text"], "hint": c.get("follow_up", "")[:50] + "..." if len(c.get("follow_up", "")) > 50 else c.get("follow_up", "")}
                for i, c in enumerate(universal["choices"])
            ],
            "category": universal.get("category", "life"),
            "is_universal": True,
        }
        return event_view, universal

    # ============== Initialize RNG and check trait triggers ==============
    rng = get_rng(user_id=char.user_id if hasattr(char, 'user_id') else None)
    trait_system = TraitFlagsSystem(char)
    trait_system.check_and_unlock_traits()
    
    # Weights (with Trait and Karma systems)
    weights = _calculate_dynamic_weights(candidates, char, server, rng=rng)
    selected = rng.choices(candidates, weights=weights, k=1)[0]

    # Build frontend view
    event_view = {
        "event_id": hash(selected["title"] + str(age)) % 100000,
        "title": selected["title"],
        "description": selected["description"],
        "options": [
            {"index": i, "text": c["text"], "hint": c.get("follow_up", "")[:50] + "..." if len(c.get("follow_up", "")) > 50 else c.get("follow_up", "")}
            for i, c in enumerate(selected["choices"])
        ],
        "category": selected.get("category", "life"),
    }
    return event_view, selected


def make_choice(char: Character, event_data: dict, option_index: int) -> dict:
    """Apply the consequences of a choice.

    Returns outcome dict with stat changes.
    """
    choices = event_data["choices"]
    if option_index < 0 or option_index >= len(choices):
        choice = choices[0]
    else:
        choice = choices[option_index]

    stat_changes = choice.get("stat_changes", {})
    follow_up = choice.get("follow_up", "")
    
    # ============== Advance Event Chain ==============
    advance_event_chain(char, event_data)
    
    # ============== Non-linear Attribute Evolution ==============
    # Apply Chinese life restarter design for realistic growth
    evolution_system = AttributeEvolutionSystem(char)
    modified_changes = evolution_system.apply_event_growth(stat_changes)
    
    # Also apply natural aging
    natural_aging = evolution_system.apply_natural_aging()
    
    # Merge modified and natural changes
    final_changes = modified_changes.copy()
    for attr, value in natural_aging.items():
        if attr in final_changes:
            final_changes[attr] += value
        else:
            final_changes[attr] = value
    
    # Use final_changes instead of raw stat_changes
    stat_changes = final_changes

    # Apply changes to character
    for attr, value in stat_changes.items():
        if attr == "is_married":
            char.is_married = bool(value)
            continue
        if attr == "career":
            char.career_title = str(value)
            continue
        if attr == "career_level":
            char.career_level = str(value)
            continue
        if attr == "family_name":
            char.family_name = str(value)
            continue
        if attr == "family_reputation":
            char.family_reputation = max(0, min(100, float(value)))
            continue
        if attr == "house_level":
            char.house_level = max(0, min(4, int(value)))
            continue
        if attr == "car_level":
            char.car_level = max(0, min(3, int(value)))
            continue
        if attr == "debts":
            current_debts = list(char.debts or [])
            if isinstance(value, list):
                current_debts.extend(value)
            char.debts = current_debts
            continue
        if attr == "children":
            current_children = list(char.children_data or [])
            if isinstance(value, list):
                current_children.extend(value)
            elif isinstance(value, dict):
                current_children.append(value)
            char.children_data = current_children
            continue
        current = getattr(char, attr, 0)
        if attr in ("health", "mood", "energy"):
            new_val = max(0, min(100, current + value))
        elif attr in ("money", "total_money_earned", "total_assets"):
            new_val = max(0, current + value)
        elif attr in ("intelligence", "charm", "creativity", "luck", "karma"):
            max_val = 150 if attr in ("intelligence", "creativity") else 100
            new_val = max(0, min(max_val, current + value))
        elif attr in ("trauma",):
            new_val = max(0, min(100, current + value))
        else:
            new_val = current + value
        setattr(char, attr, new_val)

    # Age up
    char.age += 1
    
    # ============== Karma/Luck system update ==============
    karma_system = KarmaLuckSystem(char)
    
    # Apply natural luck decay and chain aging
    karma_system.age_up()
    
    # Track outcome for streak & luck chain
    total_delta = sum(stat_changes.values())
    outcome = 1 if total_delta > 0 else (-1 if total_delta < 0 else 0)
    is_success = outcome > 0
    karma_system.apply_luck_chain(event_data.get("title", "unknown"), is_success)
    memory = char.trait_memory or []
    memory.append(outcome)
    char.trait_memory = memory[-20:]  # keep last 20

    # Track recent category and title
    recent_cat = char.recent_event_categories or []
    recent_cat.append(event_data.get("category", "life"))
    char.recent_event_categories = recent_cat[-5:]

    recent_title = char.recent_event_titles or []
    recent_title.append(event_data["title"])
    char.recent_event_titles = recent_title[-8:]  # keep last 8 titles to avoid repeats

    # Handle moral dilemma consequences
    consequences = choice.get("consequences")
    outcome_flags = {}
    if consequences:
        # Set moral flag
        flag_key = consequences.get("flag")
        if flag_key:
            current_flags = dict(char.flags or {})
            current_flags[flag_key] = consequences.get("karma_shift", "neutral")
            char.flags = current_flags
            outcome_flags["moral_flag"] = flag_key

        # Karma shift may affect future events
        karma_shift = consequences.get("karma_shift")
        if karma_shift:
            karma_system = KarmaLuckSystem(char)
            if karma_shift == "positive":
                karma_system.char.karma = min(150, (karma_system.char.karma or 50) + 10)
            elif karma_shift == "negative":
                karma_system.char.karma = max(0, (karma_system.char.karma or 50) - 10)

    # Generate outcome text
    if follow_up:
        outcome_text = follow_up
    else:
        outcome_text = _generate_outcome_text(stat_changes, event_data.get("title", ""))

    return {
        "outcome_text": outcome_text,
        "stat_changes": {k: round(v, 2) for k, v in stat_changes.items()},
        "attribute_changes": {k: round(v, 2) for k, v in stat_changes.items()},
        "new_age": char.age,
        "is_dead": False,
        "achievements_unlocked": [],
        "global_notification": "",
        "consequences": outcome_flags if outcome_flags else None,
    }
