"""Gene potential generation for characters."""

from ..utils import rng


def generate_gene_potentials() -> dict:
    """Generate genetic potential caps for a newborn character.

    These caps define the maximum achievable values for each attribute
    through natural development (no amount of training can exceed them).
    """
    return {
        "health_potential": 70 + rng.random_int(-20, 40),
        "intelligence_potential": 70 + rng.random_int(-20, 40),
        "charm_potential": 70 + rng.random_int(-20, 40),
        "creativity_potential": 70 + rng.random_int(-20, 40),
        "physical_potential": 70 + rng.random_int(-20, 40),
        "longevity_potential": rng.random_int(70, 100),
    }
