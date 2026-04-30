"""System Monitoring API for admin dashboard."""

import time
import os
import platform
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import text

from ..database import get_db
from ..auth import get_current_admin
from ..models import User

router = APIRouter(prefix="/api/v1/admin/system", tags=["admin-system"])

# Track server start time for uptime calculation
SERVER_START_TIME = time.time()


def _get_process_memory_mb() -> float:
    """Get current process memory usage in MB."""
    try:
        import psutil
        process = psutil.Process(os.getpid())
        return process.memory_info().rss / 1024 / 1024
    except ImportError:
        try:
            # Fallback for Unix systems
            with open(f"/proc/{os.getpid()}/status", "r") as f:
                for line in f:
                    if line.startswith("VmRSS:"):
                        return int(line.split()[1]) / 1024
        except Exception:
            return 0.0


def _get_disk_usage_percent() -> float:
    """Get disk usage percentage."""
    try:
        import shutil
        total, used, free = shutil.disk_usage("/")
        return round(used / total * 100, 1)
    except Exception:
        return 0.0


def _check_database(db: Session) -> str:
    """Check database connectivity."""
    try:
        db.execute(text("SELECT 1"))
        return "connected"
    except Exception:
        return "disconnected"


def _check_cache() -> str:
    """Check cache service status."""
    try:
        from ..config import settings
        redis_url = getattr(settings, "REDIS_URL", None) or getattr(settings, "redis_url", None)
        if redis_url:
            import redis
            r = redis.from_url(redis_url, socket_timeout=2)
            r.ping()
            return "connected"
    except Exception:
        pass
    return "unavailable"


@router.get("/status")
def get_system_status(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    """Get system monitoring status."""
    uptime_seconds = time.time() - SERVER_START_TIME
    hours = int(uptime_seconds // 3600)
    minutes = int((uptime_seconds % 3600) // 60)
    uptime_str = f"{hours}h {minutes}m"

    memory_mb = _get_process_memory_mb()
    disk_percent = _get_disk_usage_percent()
    db_status = _check_database(db)
    cache_status = _check_cache()

    return {
        "status": "healthy" if db_status == "connected" else "degraded",
        "uptime": uptime_str,
        "cpu_usage": 0,  # Placeholder - requires psutil or external metrics
        "memory_usage": round(memory_mb / 1024 * 100, 1) if memory_mb > 0 else 0,  # Approximate percentage
        "disk_usage": disk_percent,
        "active_connections": 0,  # Placeholder - requires external metrics
        "response_time_ms": 0,  # Placeholder - requires middleware
        "database_status": db_status,
        "cache_status": cache_status,
        "api_version": "v3.1",
        "python_version": platform.python_version(),
        "platform": platform.system(),
        "process_memory_mb": round(memory_mb, 1),
    }


@router.get("/stats")
def get_system_stats(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    """Get comprehensive system statistics and alerts."""
    from ..utils.monitoring import SystemMonitor
    stats = SystemMonitor.get_system_stats(db)
    return stats


@router.get("/stats/activity")
def get_activity_stats(
    days: int = 30,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    """Get user activity statistics."""
    from ..utils.monitoring import SystemMonitor
    stats = SystemMonitor.get_user_activity_stats(db, days=days)
    return stats


@router.get("/metrics/history")
async def get_metrics_history(
    hours: int = Query(24, ge=1, le=168),
    admin: User = Depends(get_current_admin),
):
    """Get historical metrics for the specified number of hours."""
    from ..utils.metrics import metrics_collector
    history = await metrics_collector.get_metrics_history(hours=hours)
    return {
        "hours": hours,
        "data_points": len(history),
        "metrics": history
    }


@router.get("/metrics/latest")
async def get_latest_metrics(
    admin: User = Depends(get_current_admin),
):
    """Get the latest metrics."""
    from ..utils.metrics import metrics_collector
    latest = await metrics_collector.get_latest_metrics()
    return latest or {"status": "no_data"}
