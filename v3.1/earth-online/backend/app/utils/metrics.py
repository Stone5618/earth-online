"""System metrics collector - stores historical metrics in Redis."""

import asyncio
import logging
import time
from datetime import datetime, timezone, timedelta
from typing import Dict, Any, List, Optional

from ..cache import cache_manager

logger = logging.getLogger(__name__)


class MetricsCollector:
    """Collects and stores system metrics in Redis."""

    METRICS_KEY_PREFIX = "system_metrics:"
    COLLECTION_INTERVAL = 60  # seconds
    RETENTION_HOURS = 24

    _instance: Optional['MetricsCollector'] = None
    _running: bool = False
    _task: Optional[asyncio.Task] = None

    def __new__(cls) -> 'MetricsCollector':
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    async def _collect_metrics(self) -> Dict[str, Any]:
        """Collect current system metrics."""
        try:
            memory_mb = self._get_process_memory_mb()
            db_status = await self._check_database_health()
            cache_status = await self._check_cache_health()

            metrics = {
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "memory_mb": round(memory_mb, 1),
                "database_status": db_status,
                "cache_status": cache_status,
            }

            return metrics
        except Exception as e:
            logger.error(f"Error collecting metrics: {e}")
            return {"timestamp": datetime.now(timezone.utc).isoformat(), "error": str(e)}

    def _get_process_memory_mb(self) -> float:
        """Get current process memory usage in MB."""
        try:
            import psutil
            process = psutil.Process()
            return process.memory_info().rss / (1024 * 1024)
        except ImportError:
            try:
                import sys
                if sys.platform == 'win32':
                    import ctypes
                    kernel32 = ctypes.windll.kernel32
                    psapi = ctypes.windll.psapi
                    PROCESS_QUERY_INFORMATION = 0x1000
                    process_handle = kernel32.GetCurrentProcess()
                    class PROCESS_MEMORY_COUNTERS(ctypes.Structure):
                        _fields_ = [
                            ("cb", ctypes.c_ulong),
                            ("WorkingSetSize", ctypes.c_size_t),
                            ("PeakWorkingSetSize", ctypes.c_size_t),
                            ("QuotaPagedPoolUsage", ctypes.c_size_t),
                            ("QuotaNonPagedPoolUsage", ctypes.c_size_t),
                            ("PagefileUsage", ctypes.c_size_t),
                            ("PeakPagefileUsage", ctypes.c_size_t),
                        ]
                    pmc = PROCESS_MEMORY_COUNTERS()
                    pmc.cb = ctypes.sizeof(PROCESS_MEMORY_COUNTERS)
                    if psapi.GetProcessMemoryInfo(process_handle, ctypes.byref(pmc)):
                        return pmc.WorkingSetSize / (1024 * 1024)
                return 0.0
            except Exception as e:
                logger.warning(f"Memory check failed: {e}")
                return 0.0
        except Exception as e:
            logger.warning(f"Memory check failed: {e}")
            return 0.0

    async def _check_database_health(self) -> int:
        """Check database connection status."""
        try:
            from ..database import engine
            from sqlalchemy import text
            with engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            return 1
        except Exception as e:
            logger.warning(f"Database health check failed: {e}")
            return 0

    async def _check_cache_health(self) -> int:
        """Check Redis cache connection status."""
        try:
            result = await cache_manager.health_check()
            return 1 if result else 0
        except Exception:
            return 0

    async def _store_metrics(self, metrics: Dict[str, Any]) -> None:
        """Store metrics in Redis with timestamp as key."""
        try:
            timestamp = metrics.get("timestamp", datetime.now(timezone.utc).isoformat())
            key = f"{self.METRICS_KEY_PREFIX}{timestamp}"
            await cache_manager.set(key, metrics, ttl=self.RETENTION_HOURS * 3600)

            await self._cleanup_old_metrics()
        except Exception as e:
            logger.error(f"Error storing metrics: {e}")

    async def _cleanup_old_metrics(self) -> None:
        """Remove metrics older than retention period."""
        try:
            cutoff_time = datetime.now(timezone.utc) - timedelta(hours=self.RETENTION_HOURS)
            
            pattern = f"{self.METRICS_KEY_PREFIX}*"
            cursor = 0
            deleted = 0
            while True:
                result = await cache_manager.redis.scan(cursor=cursor, match=pattern, count=100)
                if result is None:
                    break
                cursor, keys = result
                if keys:
                    for key in keys:
                        try:
                            timestamp_str = key.decode() if isinstance(key, bytes) else key
                            timestamp_str = timestamp_str.replace(self.METRICS_KEY_PREFIX, "")
                            try:
                                key_time = datetime.fromisoformat(timestamp_str.replace('+00:00', ''))
                                key_time = key_time.replace(tzinfo=timezone.utc)
                                if key_time < cutoff_time:
                                    await cache_manager.redis.delete(key)
                                    deleted += 1
                            except ValueError:
                                pass
                        except Exception:
                            pass
                if cursor == 0:
                    break
            if deleted > 0:
                logger.info(f"Cleaned up {deleted} old metrics")
        except Exception as e:
            logger.warning(f"Error cleaning up old metrics: {e}")

    async def _collection_loop(self) -> None:
        """Background task to collect metrics periodically."""
        while self._running:
            try:
                metrics = await self._collect_metrics()
                await self._store_metrics(metrics)
                logger.debug(f"Metrics collected: {metrics}")
            except Exception as e:
                logger.error(f"Error in metrics collection loop: {e}")

            await asyncio.sleep(self.COLLECTION_INTERVAL)

    async def start(self) -> None:
        """Start the metrics collection background task."""
        if self._running:
            return

        self._running = True
        
        try:
            initial_metrics = await self._collect_metrics()
            await self._store_metrics(initial_metrics)
            logger.info(f"Initial metrics collected: {initial_metrics}")
        except Exception as e:
            logger.warning(f"Initial metrics collection failed: {e}")
        
        self._task = asyncio.create_task(self._collection_loop())
        logger.info("Metrics collector started")

    async def stop(self) -> None:
        """Stop the metrics collection background task."""
        self._running = False
        if self._task:
            self._task.cancel()
            try:
                await self._task
            except asyncio.CancelledError:
                pass
        logger.info("Metrics collector stopped")

    async def get_metrics_history(self, hours: int = 24) -> List[Dict[str, Any]]:
        """Get historical metrics for the specified number of hours."""
        try:
            pattern = f"{self.METRICS_KEY_PREFIX}*"
            cursor = 0
            all_metrics = []

            while True:
                result = await cache_manager.redis.scan(cursor=cursor, match=pattern, count=500)
                if result is None:
                    break
                cursor, keys = result
                if keys:
                    for key in keys:
                        try:
                            data = await cache_manager.redis.get(key)
                            if data:
                                import json
                                metrics = json.loads(data)
                                all_metrics.append(metrics)
                        except Exception:
                            pass
                if cursor == 0:
                    break

            all_metrics.sort(key=lambda x: x.get("timestamp", ""), reverse=True)

            cutoff_time = datetime.now(timezone.utc).timestamp() - (hours * 3600)
            filtered_metrics = [
                m for m in all_metrics
                if datetime.fromisoformat(m.get("timestamp", "2000")).replace(tzinfo=timezone.utc).timestamp() > cutoff_time
            ]

            return filtered_metrics[:60]
        except Exception as e:
            logger.error(f"Error getting metrics history: {e}")
            return []

    async def get_latest_metrics(self) -> Optional[Dict[str, Any]]:
        """Get the most recent metrics."""
        try:
            pattern = f"{self.METRICS_KEY_PREFIX}*"
            cursor = 0
            latest = None
            latest_time = None

            while True:
                result = await cache_manager.redis.scan(cursor=cursor, match=pattern, count=100)
                if result is None:
                    break
                cursor, keys = result
                if keys:
                    for key in keys:
                        try:
                            data = await cache_manager.redis.get(key)
                            if data:
                                import json
                                metrics = json.loads(data)
                                ts = metrics.get("timestamp", "")
                                if ts:
                                    if latest_time is None or ts > latest_time:
                                        latest = metrics
                                        latest_time = ts
                        except Exception:
                            pass
                if cursor == 0:
                    break

            return latest
        except Exception as e:
            logger.error(f"Error getting latest metrics: {e}")
            return None


metrics_collector = MetricsCollector()
