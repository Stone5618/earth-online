"""Distributed lock utility for Earth Online.

Uses Redis SET NX EX to implement a reentrant-safe distributed lock.
Prevents concurrent modifications to the same character from multiple requests.
"""

import uuid
import asyncio
from contextlib import asynccontextmanager
from typing import Optional


class DistributedLockError(Exception):
    """Raised when lock acquisition fails or times out."""
    pass


class DistributedLock:
    """Redis-based distributed lock (async version).

    Usage:
        lock = DistributedLock(redis_client, timeout=10)
        async with lock.acquire("character:123"):
            # critical section
            ...
    """

    def __init__(self, redis_client, timeout: int = 10):
        """
        Args:
            redis_client: A redis.asyncio.Redis instance.
            timeout: Lock TTL in seconds. Auto-released after timeout to prevent deadlocks.
        """
        self.redis = redis_client
        self.timeout = timeout

    @asynccontextmanager
    async def acquire(self, key: str, retry_times: int = 3, retry_delay: float = 0.1):
        """Acquire a distributed lock for the given key.

        Args:
            key: Unique lock identifier (e.g. "character:123").
            retry_times: Number of retry attempts before raising DistributedLockError.
            retry_delay: Seconds to wait between retries.

        Yields:
            None

        Raises:
            DistributedLockError: If the lock cannot be acquired after retries.
        """
        lock_key = f"lock:{key}"
        lock_value = str(uuid.uuid4())

        for attempt in range(retry_times):
            # Try to acquire lock (NX = only set if not exists, EX = expire in seconds)
            acquired = await self.redis.set(lock_key, lock_value, nx=True, ex=self.timeout)
            if acquired:
                break
            if attempt < retry_times - 1:
                await asyncio.sleep(retry_delay)
        else:
            raise DistributedLockError(
                f"Could not acquire lock for '{key}' after {retry_times} attempts. "
                f"Another request may be processing this character."
            )

        try:
            yield
        finally:
            # Only release if we still own the lock
            try:
                current_value = await self.redis.get(lock_key)
                if current_value and current_value.decode() == lock_value:
                    await self.redis.delete(lock_key)
            except Exception:
                # Best-effort release — lock will auto-expire via TTL
                pass
