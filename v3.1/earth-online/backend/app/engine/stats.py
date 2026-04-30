"""Attribute coupling formulas for annual stat updates."""


def calculate_stress(char) -> float:
    """Calculate current stress level from trauma and mood."""
    return char.trauma + (100 - char.mood) / 2


def energy_regen_per_hour(char) -> float:
    """How much energy is recovered per hour of rest."""
    stress = calculate_stress(char)
    return 2.0 * (char.physical_fitness / 100) * (char.immune_system / 100) * max(0, 1 - stress / 200)


def annual_energy_regen(char) -> float:
    """Total daily energy regen from sleep (8h) + natural recovery."""
    regen = energy_regen_per_hour(char)
    return regen * 8 * 365  # 8h sleep per day * 365 days


def mood_decay_per_month(char) -> float:
    """Natural mood decay without positive interactions."""
    return 0.5 + (1 - char.emotional_stability / 100) * 2 + char.trauma / 50


def annual_mood_decay(char) -> float:
    return mood_decay_per_month(char) * 12


def intelligence_decline(char) -> float:
    """Fluid intelligence decline: starts at age 20, 0.5% per year."""
    if char.age < 20:
        return 0
    years_over = char.age - 20
    return char.intelligence * (1 - (0.995 ** years_over)) - char.intelligence * (1 - 0.995)


def apply_age_effects(char):
    """Apply annual age-based stat changes (called once per year tick)."""
    changed = {}

    # Intelligence decline after 20
    if char.age >= 20:
        decline = char.intelligence * 0.005
        char.intelligence = max(0, char.intelligence - decline)
        changed["intelligence"] = -decline

    # Mood decay
    mood_loss = annual_mood_decay(char)
    char.mood = max(0, min(100, char.mood - mood_loss))
    changed["mood"] = -mood_loss

    return changed
