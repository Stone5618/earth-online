"""Redis ZSET-based leaderboard service for high-performance ranking."""

import json
from typing import Optional
import redis.asyncio as aioredis
from ..cache import get_cache_manager
from ..config import settings


class LeaderboardService:
    """Redis ZSET 排行榜服务（异步版本）
    
    使用 ZSET 实现 O(log N) 复杂度的分数更新和排名查询，
    替代原来的 O(N) SQL COUNT 查询。
    """
    
    ZSET_KEY = "leaderboard:global"
    HASH_KEY = "leaderboard:record:"
    ZSET_SIZE_LIMIT = 10000  # 最多保留 10000 条记录
    
    def __init__(self, redis_client: Optional[aioredis.Redis] = None):
        self._redis = redis_client or get_cache_manager().redis
    
    async def add_record(self, record_id: int, score: float, record_data: dict) -> bool:
        """添加或更新排行榜记录
        
        Args:
            record_id: 数据库记录 ID
            score: 生命分数（用于 ZSET 排序）
            record_data: 记录的详细信息（存储在 HASH 中）
        """
        pipe = self._redis.pipeline()
        pipe.zadd(self.ZSET_KEY, {str(record_id): score})
        pipe.hset(self.HASH_KEY + str(record_id), mapping={
            "data": json.dumps(record_data, ensure_ascii=False),
            "score": str(score),
        })
        await pipe.execute()
        
        await self._trim_zset()
        return True
    
    async def get_top_records(self, offset: int = 0, limit: int = 20) -> list[dict]:
        """获取 Top N 记录（按分数降序）
        
        Args:
            offset: 偏移量
            limit: 返回数量
            
        Returns:
            排行榜记录列表，包含 rank, record_id, score, data
        """
        pipe = self._redis.pipeline()
        pipe.zrevrange(self.ZSET_KEY, offset, offset + limit - 1, withscores=True)
        results = (await pipe.execute())[0]
        
        records = []
        for idx, (record_id_bytes, score) in enumerate(results):
            record_id = int(record_id_bytes) if isinstance(record_id_bytes, bytes) else int(record_id_bytes)
            record_data = await self._redis.hget(self.HASH_KEY + str(record_id), "data")
            
            records.append({
                "rank": offset + idx + 1,
                "record_id": record_id,
                "score": score,
                "data": json.loads(record_data) if record_data else {},
            })
        
        return records
    
    async def get_user_rank(self, record_id: int) -> Optional[int]:
        """获取指定记录的排名
        
        Args:
            record_id: 数据库记录 ID
            
        Returns:
            排名（从 1 开始），如果记录不存在则返回 None
        """
        rank = await self._redis.zrevrank(self.ZSET_KEY, str(record_id))
        if rank is None:
            return None
        return rank + 1
    
    async def get_user_score(self, record_id: int) -> Optional[float]:
        """获取指定记录的分数
        
        Args:
            record_id: 数据库记录 ID
            
        Returns:
            分数，如果记录不存在则返回 None
        """
        score = await self._redis.zscore(self.ZSET_KEY, str(record_id))
        return score
    
    async def get_record_count(self) -> int:
        """获取排行榜总记录数"""
        return await self._redis.zcard(self.ZSET_KEY)
    
    async def remove_record(self, record_id: int) -> bool:
        """删除指定记录"""
        pipe = self._redis.pipeline()
        pipe.zrem(self.ZSET_KEY, str(record_id))
        pipe.hdel(self.HASH_KEY + str(record_id), "data", "score")
        await pipe.execute()
        return True
    
    async def _trim_zset(self):
        """移除超出限制的最低分记录"""
        current_size = await self._redis.zcard(self.ZSET_KEY)
        if current_size > self.ZSET_SIZE_LIMIT:
            remove_count = current_size - self.ZSET_SIZE_LIMIT
            await self._redis.zremrangebyrank(self.ZSET_KEY, 0, remove_count - 1)
    
    async def sync_from_db(self, db_records: list) -> int:
        """从数据库批量同步数据到 Redis（用于初始化或重建）
        
        Args:
            db_records: 数据库记录列表，每个记录需包含 id 和 life_score 属性
            
        Returns:
            同步的记录数量
        """
        pipe = self._redis.pipeline()
        pipe.delete(self.ZSET_KEY)
        
        mapping = {}
        for record in db_records:
            mapping[str(record.id)] = record.life_score
            
            record_data = {
                "user_id": record.user_id,
                "character_name": record.character_name,
                "server_id": record.server_id,
                "death_age": record.death_age,
                "life_score": record.life_score,
                "final_title": record.final_title,
                "achievements_count": record.achievements_count,
                "total_money_earned": record.total_money_earned,
                "created_at": record.created_at.isoformat() if record.created_at else None,
            }
            pipe.hset(self.HASH_KEY + str(record.id), mapping={
                "data": json.dumps(record_data, ensure_ascii=False),
                "score": str(record.life_score),
            })
        
        if mapping:
            pipe.zadd(self.ZSET_KEY, mapping)
        await pipe.execute()
        
        await self._trim_zset()
        return len(mapping)


_leaderboard_service_instance: Optional[LeaderboardService] = None


def get_leaderboard_service() -> LeaderboardService:
    """Dependency injection for FastAPI - lazy initialization."""
    global _leaderboard_service_instance
    if _leaderboard_service_instance is None:
        _leaderboard_service_instance = LeaderboardService()
    return _leaderboard_service_instance
