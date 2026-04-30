"""Unified random number generator module.

Provides a single point of RNG for the entire application,
making it easy to switch algorithms, seed for testing, or add logging.
"""

import random
from typing import Optional, Sequence, Any

# Module-level RNG instance (can be seeded for deterministic testing)
_rng: random.Random = random.Random()


def get_rng() -> random.Random:
    """Get the module-level RNG instance."""
    return _rng


def seed_rng(seed: int) -> None:
    """Seed the RNG for deterministic behavior (useful for testing)."""
    _rng.seed(seed)


def random_int(a: int, b: int) -> int:
    """Return random integer N such that a <= N <= b."""
    return _rng.randint(a, b)


def random_float(a: float = 0.0, b: float = 1.0) -> float:
    """Return random float N such that a <= N <= b."""
    return _rng.uniform(a, b)


def random_choice(seq: Sequence[Any]) -> Any:
    """Return a random element from the non-empty sequence."""
    return _rng.choice(seq)


def random_shuffle(seq: list) -> None:
    """Shuffle the sequence in place."""
    _rng.shuffle(seq)


def random_sample(population: Sequence[Any], k: int) -> list:
    """Return a k length list of unique elements chosen from the population."""
    return _rng.sample(population, k)


def random_bool(probability: float = 0.5) -> bool:
    """Return True with the given probability."""
    return _rng.random() < probability


def random_gauss(mu: float = 0.0, sigma: float = 1.0) -> float:
    """Return a random float from a Gaussian (normal) distribution."""
    return _rng.gauss(mu, sigma)


# Convenience aliases matching common random module API
randint = random_int
uniform = random_float
choice = random_choice
shuffle = random_shuffle
sample = random_sample
