"""Event template cache backed by database with TTL.

Separated from events.py to avoid circular imports with hierarchical_probability_tree.py.
"""

import time
import threading
from sqlalchemy.orm import Session


class EventTemplateCache:
    """Thread-safe event template cache backed by database with TTL."""
    
    def __init__(self, ttl_seconds: int = 3600):
        self._cache: list[dict] | None = None
        self._last_updated: float = 0
        self._ttl = ttl_seconds
        self._lock = threading.Lock()
    
    def get_templates(self, db: Session) -> list[dict]:
        """Get cached templates from database, refresh if expired."""
        now = time.time()
        
        if self._cache is not None and (now - self._last_updated) < self._ttl:
            return self._cache
        
        with self._lock:
            if self._cache is not None and (now - self._last_updated) < self._ttl:
                return self._cache
            
            self._cache = self._load_from_db(db)
            self._last_updated = now
            return self._cache
    
    def _load_from_db(self, db: Session) -> list[dict]:
        """Load all active event templates from database."""
        from ..models import EventTemplate
        rows = db.query(EventTemplate).filter(EventTemplate.is_active == True).all()
        return [row.to_dict() for row in rows]
    
    def invalidate(self):
        """Force cache invalidation."""
        with self._lock:
            self._cache = None
            self._last_updated = 0


_template_cache = EventTemplateCache(ttl_seconds=3600)


def get_cached_templates(db: Session) -> list[dict]:
    """Get cached event templates from database with auto-refresh."""
    return _template_cache.get_templates(db)


def invalidate_template_cache():
    """Manually invalidate the template cache."""
    _template_cache.invalidate()
