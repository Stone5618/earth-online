"""Health decay, aging, and death determination."""

import math
from ..utils import rng


def calculate_health_loss(char) -> float:
    """Annual natural health loss based on age and fitness.

    Early life: minimal decay (0-30)
    Middle age: gradual decay (30-60)
    Senior years: accelerating decay (60+)
    """
    age = char.age
    fitness = char.physical_fitness or 50
    immune = char.immune_system or 50
    
    # Base vulnerability from low fitness/immune
    base = (100 - fitness) * 0.003 + (100 - immune) * 0.002
    
    if age <= 30:
        # Very low decay for young people
        factor = 0.1 + (age / 30) * 0.2  # 0.1 to 0.3
    elif age <= 60:
        # Gradual increase through middle age
        factor = 0.3 + ((age - 30) / 30) * 0.5  # 0.3 to 0.8
    elif age <= 80:
        # Faster increase
        factor = 0.8 + ((age - 60) / 20) * 2.0  # 0.8 to 2.8
    else:
        # Heavy decay for 80+ (with some randomness)
        factor = 2.8 + ((age - 80) / 10) * 3.0  # 2.8 to 3.8+ per year at this point
    
    loss = factor * base
    
    # Add small random variation
    loss *= (0.8 + rng.random_float() * 0.4)
    
    return loss


_SUDDEN_DEATH_THRESHOLD = {
    0.9: 0.0001,   # Extreme difficulty: 0.01% chance even young
    0.7: 0.00005,  # Hard: half of extreme
    0.5: 0.00002,  # Normal: rare
    0.3: 0.00001,  # Easy: very rare
}


def check_death(char) -> tuple[bool, str]:
    """Determine if character dies this year and the reason.
    
    Returns (is_dead, reason).
    """
    # Hard death: health reaches 0
    if char.health <= 0:
        if abs(char.health) < 0.001:
            return True, "灵魂的能量耗尽了。安息吧。"
        return True, f"健康值耗尽，生命之火熄灭了。最后健康值: {char.health}。"
    
    # Natural lifespan limit
    longevity = char.gene_potentials.get("longevity_potential", 80) if char.gene_potentials else 80
    max_age = longevity + 15  # absolute maximum
    if char.age >= max_age:
        return True, f"寿终正寝，享年{int(char.age)}岁。生命的历程画上了圆满的句号。"
    
    # Age-related natural death probability (starts 10 years before longevity)
    threshold = longevity - 10
    if char.age > threshold:
        # Probability increases quadratically after threshold
        years_past = char.age - threshold
        death_prob = min(0.8, (years_past / longevity) ** 2)
        if rng.random_bool(death_prob):
            return True, f"安详地离开了人世，享年{int(char.age)}岁。经历了完整的一生。"
    
    # Frail health check (health below 20 becomes dangerous)
    if char.health < 20:
        death_risk = 1.0 - (char.health / 20.0)  # 0% at 20, 95% at 1
        if rng.random_bool(death_risk * 0.05):
            return True, f"身体虚弱，未能挺过这一年。享年{int(char.age)}岁。"
    
    return False, ""


def apply_health_decay(char) -> float:
    """Apply annual health decay and return the amount lost."""
    loss = calculate_health_loss(char)
    char.health = max(0.0, char.health - loss)
    return loss
