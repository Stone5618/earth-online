"""Redis缓存模块 - 实现三级缓存策略（异步版本）"""

import json
import logging
from typing import Any, Optional
import redis.asyncio as aioredis
from redis.asyncio import ConnectionPool as AsyncConnectionPool
from redis.exceptions import RedisError, ConnectionError as RedisConnectionError

from .config import settings

logger = logging.getLogger(__name__)


class CacheManager:
    """Redis缓存管理器 - 基于 redis.asyncio 的异步实现"""
    
    _instance: Optional['CacheManager'] = None
    _redis_client: Optional[aioredis.Redis] = None
    _pool: Optional[AsyncConnectionPool] = None
    _initialized: bool = False
    
    EVENT_TEMPLATE_TTL = 3600  # 1 hour
    USER_ROLE_TTL = 300  # 5 minutes
    LEADERBOARD_TTL = 60  # 1 minute
    REAL_TIME_STATS_TTL = 30  # 30 seconds
    
    PREFIX_EVENT_TEMPLATE = "event_template:"
    PREFIX_USER_ROLE = "user_role:"
    PREFIX_LEADERBOARD = "leaderboard:"
    PREFIX_REAL_TIME_STATS = "rt_stats:"
    
    def __new__(cls) -> 'CacheManager':
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    def __init__(self):
        if self._initialized:
            return
        if self._pool is None:
            self._init_pool()
        self._initialized = True
    
    def _init_pool(self):
        """初始化Redis异步连接池"""
        try:
            pool_kwargs = {
                "host": settings.REDIS_HOST,
                "port": settings.REDIS_PORT,
                "db": settings.REDIS_DB,
                "max_connections": settings.REDIS_MAX_CONNECTIONS,
                "socket_timeout": settings.REDIS_SOCKET_TIMEOUT,
                "socket_connect_timeout": settings.REDIS_SOCKET_CONNECT_TIMEOUT,
                "decode_responses": False,
            }
            if settings.REDIS_PASSWORD:
                pool_kwargs["password"] = settings.REDIS_PASSWORD
            
            self._pool = AsyncConnectionPool(**pool_kwargs)
            self._redis_client = aioredis.Redis(connection_pool=self._pool)
            logger.info(f"Redis connection pool initialized: {settings.REDIS_HOST}:{settings.REDIS_PORT}")
        except Exception as e:
            logger.error(f"Failed to initialize Redis connection pool: {str(e)}", exc_info=True)
            raise
    
    @property
    def redis(self) -> aioredis.Redis:
        if self._redis_client is None:
            self._init_pool()
        return self._redis_client
    
    async def _execute_with_retry(self, operation: str, func, *args, max_retries: int = 2, **kwargs):
        """执行Redis操作并处理重试逻辑"""
        for attempt in range(max_retries + 1):
            try:
                return await func(*args, **kwargs)
            except (RedisConnectionError, ConnectionResetError) as e:
                if attempt < max_retries:
                    logger.warning(f"Redis connection error on {operation}, attempt {attempt + 1}/{max_retries}: {str(e)}")
                    self._init_pool()
                    continue
                logger.error(f"Redis connection failed after {max_retries + 1} attempts: {str(e)}", exc_info=True)
            except RedisError as e:
                logger.error(f"Redis error during {operation}: {str(e)}", exc_info=True)
            except Exception as e:
                logger.error(f"Unexpected error during {operation}: {str(e)}", exc_info=True)
            return None
    
    async def set(self, key: str, value: Any, ttl: Optional[int] = None) -> bool:
        """设置缓存值"""
        try:
            serialized = json.dumps(value, ensure_ascii=False)
            if ttl is not None:
                result = await self._execute_with_retry("setex", self.redis.setex, key, ttl, serialized)
            else:
                result = await self._execute_with_retry("set", self.redis.set, key, serialized)
            return result is not None
        except Exception as e:
            logger.error(f"Failed to set cache key '{key}': {str(e)}", exc_info=True)
            return False
    
    async def get(self, key: str, default: Any = None) -> Any:
        """获取缓存值"""
        try:
            data = await self._execute_with_retry("get", self.redis.get, key)
            if data is None:
                return default
            return json.loads(data)
        except json.JSONDecodeError as e:
            logger.error(f"Failed to decode cache data for key '{key}': {str(e)}", exc_info=True)
            return default
        except Exception as e:
            logger.error(f"Failed to get cache key '{key}': {str(e)}", exc_info=True)
            return default
    
    async def delete(self, key: str) -> bool:
        """删除单个缓存键"""
        result = await self._execute_with_retry("delete", self.redis.delete, key)
        return result is not None and result > 0
    
    async def delete_by_pattern(self, pattern: str) -> int:
        """按模式删除缓存"""
        deleted_count = 0
        try:
            cursor = 0
            while True:
                result = await self._execute_with_retry("scan", self.redis.scan, cursor=cursor, match=pattern, count=100)
                if result is None:
                    break
                cursor, keys = result
                if keys:
                    delete_result = await self._execute_with_retry("delete", self.redis.delete, *keys)
                    if delete_result:
                        deleted_count += delete_result
                if cursor == 0:
                    break
        except Exception as e:
            logger.error(f"Failed to delete by pattern '{pattern}': {str(e)}", exc_info=True)
        return deleted_count
    
    async def exists(self, key: str) -> bool:
        """检查键是否存在"""
        result = await self._execute_with_retry("exists", self.redis.exists, key)
        return result is not None and result > 0
    
    async def clear_all(self) -> bool:
        """清空所有缓存"""
        result = await self._execute_with_retry("flushdb", self.redis.flushdb)
        return result is not None
    
    async def close(self):
        """Close Redis connection pool. Call on app shutdown."""
        if self._pool:
            try:
                await self._pool.aclose()
                logger.info("Redis connection pool closed")
            except Exception as e:
                logger.error(f"Error closing Redis connection pool: {str(e)}", exc_info=True)
            finally:
                self._pool = None
                self._redis_client = None
                self._initialized = False
    
    async def health_check(self) -> bool:
        """检查Redis连接健康状态"""
        try:
            result = await self._execute_with_retry("ping", self.redis.ping)
            return result in (b'PONG', True)
        except Exception:
            return False


cache_manager = CacheManager()


def cached(
    ttl: Optional[int] = 60,
    key_prefix: str = "cache:",
    key_builder: Optional[Any] = None,
):
    def decorator(func):
        async def wrapper(*args, **kwargs):
            if key_builder:
                key = key_builder(*args, **kwargs)
            else:
                key_parts = [key_prefix, func.__name__]
                if args:
                    key_parts.extend(str(arg) for arg in args)
                if kwargs:
                    key_parts.extend(f"{k}:{v}" for k, v in sorted(kwargs.items()))
                key = ":".join(key_parts)
            
            cached_data = await cache_manager.get(key)
            if cached_data is not None:
                logger.debug(f"Cache hit for key '{key}'")
                return cached_data
            
            result = await func(*args, **kwargs)
            await cache_manager.set(key, result, ttl)
            logger.debug(f"Cache set for key '{key}' with TTL {ttl}")
            return result
        return wrapper
    return decorator


class EventTemplateCache:
    @staticmethod
    def _key(template_id: int) -> str:
        return f"{cache_manager.PREFIX_EVENT_TEMPLATE}{template_id}"
    
    @staticmethod
    async def set(template_id: int, template_data: Any) -> bool:
        return await cache_manager.set(EventTemplateCache._key(template_id), template_data, cache_manager.EVENT_TEMPLATE_TTL)
    
    @staticmethod
    async def get(template_id: int) -> Any:
        return await cache_manager.get(EventTemplateCache._key(template_id))
    
    @staticmethod
    async def delete(template_id: int) -> bool:
        return await cache_manager.delete(EventTemplateCache._key(template_id))
    
    @staticmethod
    async def clear_all() -> int:
        return await cache_manager.delete_by_pattern(f"{cache_manager.PREFIX_EVENT_TEMPLATE}*")


class UserRoleCache:
    @staticmethod
    def _key(user_id: int) -> str:
        return f"{cache_manager.PREFIX_USER_ROLE}{user_id}"
    
    @staticmethod
    async def set(user_id: int, role_data: Any) -> bool:
        return await cache_manager.set(UserRoleCache._key(user_id), role_data, cache_manager.USER_ROLE_TTL)
    
    @staticmethod
    async def get(user_id: int) -> Any:
        return await cache_manager.get(UserRoleCache._key(user_id))
    
    @staticmethod
    async def delete(user_id: int) -> bool:
        return await cache_manager.delete(UserRoleCache._key(user_id))
    
    @staticmethod
    async def clear_all() -> int:
        return await cache_manager.delete_by_pattern(f"{cache_manager.PREFIX_USER_ROLE}*")


class LeaderboardCache:
    @staticmethod
    def _key(leaderboard_type: str, server_id: Optional[int] = None) -> str:
        if server_id:
            return f"{cache_manager.PREFIX_LEADERBOARD}{leaderboard_type}:{server_id}"
        return f"{cache_manager.PREFIX_LEADERBOARD}{leaderboard_type}"
    
    @staticmethod
    async def set(leaderboard_type: str, data: Any, server_id: Optional[int] = None) -> bool:
        return await cache_manager.set(LeaderboardCache._key(leaderboard_type, server_id), data, cache_manager.LEADERBOARD_TTL)
    
    @staticmethod
    async def get(leaderboard_type: str, server_id: Optional[int] = None) -> Any:
        return await cache_manager.get(LeaderboardCache._key(leaderboard_type, server_id))
    
    @staticmethod
    async def delete(leaderboard_type: str, server_id: Optional[int] = None) -> bool:
        return await cache_manager.delete(LeaderboardCache._key(leaderboard_type, server_id))
    
    @staticmethod
    async def clear_all() -> int:
        return await cache_manager.delete_by_pattern(f"{cache_manager.PREFIX_LEADERBOARD}*")


class RealTimeStatsCache:
    @staticmethod
    def _key(stats_key: str) -> str:
        return f"{cache_manager.PREFIX_REAL_TIME_STATS}{stats_key}"
    
    @staticmethod
    async def set(stats_key: str, data: Any) -> bool:
        return await cache_manager.set(RealTimeStatsCache._key(stats_key), data, cache_manager.REAL_TIME_STATS_TTL)
    
    @staticmethod
    async def get(stats_key: str) -> Any:
        return await cache_manager.get(RealTimeStatsCache._key(stats_key))
    
    @staticmethod
    async def delete(stats_key: str) -> bool:
        return await cache_manager.delete(RealTimeStatsCache._key(stats_key))
    
    @staticmethod
    async def clear_all() -> int:
        return await cache_manager.delete_by_pattern(f"{cache_manager.PREFIX_REAL_TIME_STATS}*")


def get_cache_manager() -> CacheManager:
    return cache_manager