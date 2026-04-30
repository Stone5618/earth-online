# -*- coding: utf-8 -*-
"""Time allocation system for Earth Online.

Players can allocate time between work, study, leisure, and social activities.
Time allocation affects stat gains, income, and event outcomes.
"""

from ..utils import rng

TIME_CATEGORIES = {
    "work": {
        "label": "工作",
        "icon": "💼",
        "effects": {"money": 1.0, "energy": -0.3, "mood": -0.1},
        "skill_boost": None,
    },
    "study": {
        "label": "学习",
        "icon": "📚",
        "effects": {"intelligence": 0.5, "creativity": 0.3, "energy": -0.2},
        "skill_boost": "academic",
    },
    "leisure": {
        "label": "休闲",
        "icon": "🎮",
        "effects": {"mood": 0.8, "energy": 0.5, "health": 0.2},
        "skill_boost": None,
    },
    "social": {
        "label": "社交",
        "icon": "🤝",
        "effects": {"charm": 0.5, "mood": 0.3, "karma": 0.1},
        "skill_boost": None,
    },
    "exercise": {
        "label": "运动",
        "icon": "🏃",
        "effects": {"health": 0.8, "energy": 0.3, "mood": 0.4},
        "skill_boost": "physical",
    },
    "creative": {
        "label": "创作",
        "icon": "🎨",
        "effects": {"creativity": 0.8, "mood": 0.2, "intelligence": 0.1},
        "skill_boost": "artistic",
    },
}

# Default time allocation (percentage, must sum to 100)
DEFAULT_ALLOCATION = {
    "work": 40,
    "study": 15,
    "leisure": 20,
    "social": 10,
    "exercise": 10,
    "creative": 5,
}


def validate_allocation(allocation: dict) -> tuple[bool, str]:
    """Validate that allocation percentages sum to 100 and are valid."""
    total = sum(allocation.values())
    if abs(total - 100) > 0.1:
        return False, f"时间分配总和必须为100%，当前为{total}%"
    
    invalid_keys = [k for k in allocation if k not in TIME_CATEGORIES]
    if invalid_keys:
        return False, f"无效的时间类别: {', '.join(invalid_keys)}"
    
    return True, ""


def calculate_time_budget(char) -> int:
    """Calculate available time budget based on character age and status.
    
    Adults get 24 hours/day baseline. Students get 16 hours for activities.
    Children under 6 get 8 hours. Returns total hours available for allocation.
    """
    age = getattr(char, 'age', 0)
    if age < 6:
        return 8
    elif age < 18:
        return 16
    else:
        return 24


def apply_time_allocation(char, allocation: dict) -> dict:
    """Apply time allocation effects to character stats.

    Returns a dict of stat changes applied.
    """
    changes = {}
    
    for category, percentage in allocation.items():
        if category not in TIME_CATEGORIES:
            continue
        
        effects = TIME_CATEGORIES[category]["effects"]
        weight = percentage / 100.0
        
        for stat, rate in effects.items():
            delta = round(rate * weight * 100)
            if delta == 0:
                continue
            
            current = getattr(char, stat, 0) or 0
            max_val = 150 if stat in ("intelligence", "charm", "creativity", "luck", "karma") else (100 if stat == "energy" else None)
            min_val = 0
            
            new_val = current + delta
            if max_val is not None:
                new_val = min(new_val, max_val)
            new_val = max(new_val, min_val)
            
            setattr(char, stat, new_val)
            
            if stat not in changes:
                changes[stat] = 0
            changes[stat] += delta
    
    return changes


def get_suggested_allocation(age: int, occupation: str) -> dict:
    """Get a suggested time allocation based on age and occupation."""
    if age < 18:
        # Student: focus on study and leisure
        return {
            "work": 0,
            "study": 40,
            "leisure": 30,
            "social": 15,
            "exercise": 10,
            "creative": 5,
        }
    elif age < 30:
        # Young adult: balanced work and growth
        return {
            "work": 35,
            "study": 20,
            "leisure": 15,
            "social": 15,
            "exercise": 10,
            "creative": 5,
        }
    elif occupation == "entrepreneur":
        # Entrepreneur: heavy work focus
        return {
            "work": 55,
            "study": 10,
            "leisure": 10,
            "social": 15,
            "exercise": 5,
            "creative": 5,
        }
    else:
        # Default adult: balanced
        return {
            "work": 40,
            "study": 15,
            "leisure": 20,
            "social": 10,
            "exercise": 10,
            "creative": 5,
        }
