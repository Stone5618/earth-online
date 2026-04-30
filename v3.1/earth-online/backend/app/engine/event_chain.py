# -*- coding: utf-8 -*-
"""
Event Chain System - Handles sequential event chains.

Key features:
- Uses step_id and chain_id fields in event templates (no hardcoding)
- Immediate flag: allows same-year chain progression
- Stored in character.event_chains as JSON
"""

from ..models import Character


# =============================================
# Event Chain Step Configuration
# =============================================
CHAIN_CONFIGS = {
    "unemployment_recovery": {
        "name": "失业复职",
        "start_condition": lambda char: char.career_level == "" and 20 <= char.age <= 50,
        "steps": [
            {"step_id": "unemployment_1", "immediate": False},
            {"step_id": "unemployment_2", "immediate": True},
            {"step_id": "unemployment_3", "immediate": True},
            {"step_id": "unemployment_4", "immediate": True},
        ],
    },
    "romance_marriage": {
        "name": "恋爱结婚",
        "start_condition": lambda char: not char.is_married and 18 <= char.age <= 40,
        "steps": [
            {"step_id": "romance_1", "immediate": False},
            {"step_id": "romance_2", "immediate": True},
            {"step_id": "romance_3", "immediate": True},
        ],
    },
    "illness_recovery": {
        "name": "疾病治疗",
        "start_condition": lambda char: char.age >= 6 and char.health < 50,
        "steps": [
            {"step_id": "illness_1", "immediate": False},
            {"step_id": "illness_2", "immediate": True},
            {"step_id": "illness_3", "immediate": True},
        ],
    },
}


# =============================================
# Event Chain Operations
# =============================================
def check_start_event_chains(char: Character) -> list:
    """Check which chains can be started for this character."""
    startable_chains = []
    chains_data = char.event_chains or {}
    
    for chain_id, config in CHAIN_CONFIGS.items():
        chain_state = chains_data.get(chain_id)
        
        # Skip if chain is currently active (not completed)
        if chain_state and not chain_state.get("completed", False):
            continue
        
        # Allow restart if chain is completed or doesn't exist
        if config["start_condition"](char):
            startable_chains.append(chain_id)
    
    return startable_chains


def start_event_chain(char: Character, chain_id: str) -> bool:
    """Start a new event chain for character."""
    chains_data = char.event_chains or {}
    
    if chain_id not in CHAIN_CONFIGS:
        return False
    
    chains_data[chain_id] = {
        "current_step_index": 0,
        "completed": False,
    }
    
    char.event_chains = chains_data
    return True


def get_active_chain_event(char: Character, templates: list) -> tuple:
    """
    Get current event from active chains.
    
    Returns (event_template, is_immediate) or (None, False).
    Checks if we can trigger in same year using last_chain_year.
    """
    chains_data = char.event_chains or {}
    char_age = int(char.age)
    last_chain_year = (char.flags or {}).get("last_chain_year", -1)
    
    for chain_id, chain_state in chains_data.items():
        if chain_state.get("completed", False):
            continue
        
        current_step_index = chain_state.get("current_step_index", 0)
        config = CHAIN_CONFIGS.get(chain_id)
        
        if not config or current_step_index >= len(config["steps"]):
            continue
        
        # Re-check start condition: skip chain if conditions no longer met
        # e.g., romance_marriage chain should not trigger if character is already married
        if "start_condition" in config and not config["start_condition"](char):
            # Mark as completed so it won't be checked again
            chain_state["completed"] = True
            chains_data[chain_id] = chain_state
            char.event_chains = chains_data
            continue
        
        step_config = config["steps"][current_step_index]
        target_step_id = step_config["step_id"]
        is_immediate = step_config.get("immediate", False)
        
        # Same year check: only allow if not immediate or different year
        if is_immediate and last_chain_year == char_age:
            continue
        
        # Find the template
        for template in templates:
            if template.get("step_id") == target_step_id and template.get("chain_id") == chain_id:
                return template, is_immediate
    
    return None, False


def advance_event_chain(char: Character, event_data: dict) -> bool:
    """Advance chain after an event was completed."""
    chains_data = char.event_chains or {}
    char_age = int(char.age)
    
    # Find which chain this event belongs to
    chain_id = event_data.get("chain_id")
    if not chain_id or chain_id not in CHAIN_CONFIGS:
        return False
    
    step_id = event_data.get("step_id")
    if not step_id:
        return False
    
    chain_state = chains_data.get(chain_id)
    if not chain_state or chain_state.get("completed", False):
        return False
    
    # Check if this is the current step
    config = CHAIN_CONFIGS[chain_id]
    current_index = chain_state.get("current_step_index", 0)
    
    if current_index >= len(config["steps"]):
        return False
    
    current_step_config = config["steps"][current_index]
    if current_step_config.get("step_id") != step_id:
        return False
    
    # Advance
    next_index = current_index + 1
    
    if next_index >= len(config["steps"]):
        # Chain complete
        chain_state["completed"] = True
    else:
        chain_state["current_step_index"] = next_index
    
    # Record year to prevent duplicate same-year immediate triggers
    flags = char.flags or {}
    flags["last_chain_year"] = char_age
    char.flags = flags
    
    chains_data[chain_id] = chain_state
    char.event_chains = chains_data
    
    return True


def get_chain_progress(char: Character, chain_id: str) -> int:
    """Get progress percentage of a chain."""
    chains_data = char.event_chains or {}
    if chain_id not in CHAIN_CONFIGS or chain_id not in chains_data:
        return 0
    
    config = CHAIN_CONFIGS[chain_id]
    chain_state = chains_data[chain_id]
    
    if chain_state.get("completed", False):
        return 100
    
    current_step = chain_state.get("current_step_index", 0)
    total_steps = len(config["steps"])
    
    return int((current_step / total_steps) * 100)
