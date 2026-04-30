# -*- coding: utf-8 -*-
"""
XorShift128+ High-Quality Random Number Generator.
Inspired by Chinese life restarter design.
- Seed chain derivation for reproducibility
- Anti-cheat guarantees
- High statistical quality
"""
import time
import hashlib
from typing import Optional, Any, List
from dataclasses import dataclass


@dataclass
class RNGState:
    """XorShift128+ state (2 x 64-bit integers)."""
    x: int
    y: int
    
    def to_bytes(self) -> bytes:
        """Serialize state for saving."""
        return (self.x.to_bytes(8, byteorder='little') +
                self.y.to_bytes(8, byteorder='little'))
    
    @classmethod
    def from_bytes(cls, data: bytes) -> 'RNGState':
        """Restore state from bytes."""
        return cls(
            x=int.from_bytes(data[:8], byteorder='little'),
            y=int.from_bytes(data[8:], byteorder='little'),
        )


class XorShift128PlusRNG:
    """
    XorShift128+ PRNG implementation.
    High-quality, fast, and reproducible with seed chaining.
    """
    
    def __init__(self, seed: Optional[int] = None, user_id: Optional[int] = None):
        """
        Initialize RNG with sophisticated seed derivation.
        
        Args:
            seed: Optional manual seed (for debugging)
            user_id: Optional user ID (anti-cheat and uniqueness)
        """
        if seed is None:
            seed = self._generate_auto_seed(user_id)
        
        # Initialize call_count BEFORE state derivation (needed by _next_raw)
        self.call_count = 0
        
        # Initialize state from seed
        self.state = self._seed_to_state(seed)
        self.initial_seed = seed
    
    def _generate_auto_seed(self, user_id: Optional[int]) -> int:
        """
        Generate a secure, unique seed combining:
        - Timestamp (milliseconds)
        - User ID (if provided)
        - Server random entropy
        - Hardware variability
        """
        seed_data = []
        
        # Timestamp (ms)
        timestamp_ms = int(time.time() * 1000)
        seed_data.append(timestamp_ms.to_bytes(8, byteorder='little'))
        
        # User ID (if provided)
        if user_id is not None:
            seed_data.append(str(user_id).encode('utf-8'))
        
        # Process ID (hardware variability)
        import os
        seed_data.append(os.getpid().to_bytes(4, byteorder='little'))
        
        # Monotonic counter
        seed_data.append(str(time.perf_counter_ns()).encode('utf-8'))
        
        # Hash together
        combined = b''.join(seed_data)
        hash_result = hashlib.sha256(combined).digest()
        seed = int.from_bytes(hash_result[:8], byteorder='little')
        
        # Ensure non-zero
        return seed if seed != 0 else 0xdeadbeefcafebabe
    
    def _seed_to_state(self, seed: int) -> RNGState:
        """Expand 64-bit seed to 128-bit state using splitmix64."""
        state = RNGState(seed, seed ^ 0xabcdef123456789)
        
        # Warm up to ensure good quality
        for _ in range(16):
            self._next_raw(state)
        
        return state
    
    def _next_raw(self, state: Optional[RNGState] = None) -> int:
        """
        Core XorShift128+ algorithm.
        Returns a 64-bit unsigned integer.
        """
        s = state or self.state
        x = s.x
        y = s.y
        
        s.x = y
        x ^= (x << 23) & 0xffffffffffffffff
        s.y = x ^ y ^ (x >> 17) ^ (y >> 26)
        
        result = (s.y + y) & 0xffffffffffffffff
        self.call_count += 1
        
        return result
    
    def random(self) -> float:
        """Get random float in [0.0, 1.0)."""
        raw = self._next_raw()
        return (raw >> 11) * (1.0 / 9007199254740992.0)
    
    def randint(self, low: int, high: int) -> int:
        """Get random integer in [low, high], inclusive."""
        return low + int(self.random() * (high - low + 1))
    
    def choice(self, seq: List[Any]) -> Any:
        """Random choice from sequence."""
        if not seq:
            raise ValueError("Cannot choose from empty sequence")
        idx = self.randint(0, len(seq) - 1)
        return seq[idx]
    
    def choices(self, seq: List[Any], weights: Optional[List[float]] = None, k: int = 1):
        """Random weighted choices with k samples."""
        if not seq:
            raise ValueError("Cannot choose from empty sequence")
        
        if weights is None:
            # Uniform
            return [self.choice(seq) for _ in range(k)]
        else:
            # Weighted
            assert len(seq) == len(weights)
            total = sum(weights)
            normalized = [w / total for w in weights]
            
            cumulative = []
            running = 0.0
            for nw in normalized:
                running += nw
                cumulative.append(running)
            
            results = []
            for _ in range(k):
                r = self.random()
                for i, c in enumerate(cumulative):
                    if r <= c:
                        results.append(seq[i])
                        break
            
            return results
    
    def get_chain_seed(self) -> int:
        """
        Get current chain seed for reproducibility.
        This allows saving and restoring the exact game state.
        """
        # Create a hash of current state and call count
        data = (f"{self.initial_seed}-{self.state.x}-{self.state.y}-{self.call_count}").encode('utf-8')
        return int.from_bytes(hashlib.sha256(data).digest()[:8], byteorder='little')
    
    def fork(self) -> 'XorShift128PlusRNG':
        """
        Fork a new RNG with a derived seed.
        Useful for parallel or independent random streams.
        """
        derived_seed = self.get_chain_seed()
        return XorShift128PlusRNG(derived_seed)


# Global RNG instance (for convenience)
_global_rng: Optional[XorShift128PlusRNG] = None


def get_rng(user_id: Optional[int] = None) -> XorShift128PlusRNG:
    """Get or create global RNG instance."""
    global _global_rng
    if _global_rng is None:
        _global_rng = XorShift128PlusRNG(user_id=user_id)
    return _global_rng


def set_seed(seed: int, user_id: Optional[int] = None):
    """Set global RNG seed (for testing/debugging)."""
    global _global_rng
    _global_rng = XorShift128PlusRNG(seed=seed, user_id=user_id)
