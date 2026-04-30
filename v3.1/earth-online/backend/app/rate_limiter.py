"""Rate limiter configuration — Redis-backed for distributed deployments."""

import os
from slowapi import Limiter
from slowapi.util import get_remote_address

IS_TESTING = os.getenv("TESTING", "").lower() in ("1", "true", "yes")

if IS_TESTING:
    # Disabled in tests - routes still decorated but limit is effectively infinite
    limiter = Limiter(
        key_func=get_remote_address,
        default_limits=["10000/minute"],
        storage_uri="memory://",
    )
else:
    from .config import settings
    limiter = Limiter(
        key_func=get_remote_address,
        storage_uri=settings.REDIS_URL,
        strategy="moving-window",
    )
