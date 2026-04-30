"""JWT Token blacklist management using Redis.

Stores revoked token JTIs (JWT IDs) with TTL matching the token expiration time.
Provides fast lookup to check if a token has been revoked.
"""

import logging
from datetime import datetime, timezone
from typing import Optional

from .cache import cache_manager

logger = logging.getLogger("earthonline")


async def revoke_token(jti: str, expires_at: datetime) -> bool:
    """Add a token JTI to the blacklist.

    Args:
        jti: The JWT ID (unique identifier) of the token.
        expires_at: The token's expiration time. Used to set the TTL for auto-cleanup.

    Returns:
        True if the token was successfully revoked, False on error.
    """
    try:
        ttl_seconds = int((expires_at - datetime.now(timezone.utc)).total_seconds())
        if ttl_seconds <= 0:
            return True  # Token already expired, no need to blacklist
        await cache_manager.set(f"token_blacklist:{jti}", "1", ttl=ttl_seconds)
        return True
    except Exception as e:
        logger.error(f"Failed to revoke token {jti}: {e}")
        return False


async def is_token_revoked(jti: str) -> bool:
    """Check if a token JTI is in the blacklist.

    Args:
        jti: The JWT ID to check.

    Returns:
        True if the token is revoked, False otherwise (including Redis errors).
    """
    try:
        return await cache_manager.get(f"token_blacklist:{jti}") is not None
    except Exception as e:
        logger.error(f"Failed to check token blacklist for {jti}: {e}")
        return False  # On error, allow the token through (fail-open)


def revoke_user_tokens(user_id: int, jti_to_exclude: Optional[str] = None) -> bool:
    """Revoke all tokens for a specific user.

    Note: Since we don't store user->jti mapping in Redis by default,
    this is a placeholder for future implementation if needed.
    For now, only explicit revocation via revoke_token() is supported.

    Args:
        user_id: The user ID whose tokens should be revoked.
        jti_to_exclude: A JTI to NOT revoke (e.g., the current session).

    Returns:
        True on success.
    """
    # Future enhancement: maintain a Set of JTIs per user in Redis
    # For now, individual token revocation is the primary mechanism.
    logger.info(f"Token revocation requested for user {user_id} (not implemented in batch)")
    return True
