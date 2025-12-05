"""
Phase 9.1: Performance Optimization
Reusable Redis caching utilities for API responses.

This module provides a centralized caching solution extracted from
venue_service.py for use across all services.
"""
import json
import hashlib
import logging
from typing import Optional, Any, Callable, TypeVar
from functools import wraps

import redis.asyncio as redis

from app.core.config import get_settings

logger = logging.getLogger(__name__)

T = TypeVar("T")


class CacheTTL:
    """Cache Time-To-Live constants in seconds."""

    SHORT = 300  # 5 minutes - frequently changing data
    MEDIUM = 1800  # 30 minutes - moderately stable data
    LONG = 3600  # 1 hour - stable data
    VERY_LONG = 86400  # 24 hours - rarely changing data
    WEEK = 604800  # 7 days - static/reference data


class CacheManager:
    """
    Centralized Redis cache manager with connection pooling.

    Provides async caching operations with automatic serialization,
    error handling, and graceful fallbacks when Redis is unavailable.

    Usage:
        cache = CacheManager()
        await cache.set("key", {"data": "value"}, ttl=CacheTTL.SHORT)
        data = await cache.get("key")
    """

    _instance: Optional["CacheManager"] = None
    _redis_clients: dict[int, Optional[redis.Redis]] = {}

    def __new__(cls) -> "CacheManager":
        """Singleton pattern to ensure one cache manager instance."""
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    def __init__(self) -> None:
        """Initialize cache manager with settings."""
        if not hasattr(self, "_initialized"):
            self.settings = get_settings()
            self._initialized = True

    async def get_redis(self, db: int = 1) -> Optional[redis.Redis]:
        """
        Get Redis client for caching (lazy initialization).

        Args:
            db: Redis database number. Default is 1 for general cache.
                - db=0: Celery tasks
                - db=1: General API cache
                - db=2: Venue cache (existing)

        Returns:
            Redis client or None if unavailable.
        """
        if db not in self._redis_clients or self._redis_clients[db] is None:
            try:
                redis_url = self.settings.REDIS_URL.rsplit("/", 1)[0] + f"/{db}"
                client = redis.from_url(redis_url, decode_responses=True)
                await client.ping()
                self._redis_clients[db] = client
                logger.debug(f"Redis connection established for caching (db={db})")
            except Exception as e:
                logger.warning(f"Redis not available for caching (db={db}): {e}")
                self._redis_clients[db] = None
        return self._redis_clients[db]

    @staticmethod
    def generate_key(prefix: str, *args: Any, **kwargs: Any) -> str:
        """
        Generate a cache key from prefix and arguments.

        Args:
            prefix: Key prefix (e.g., "events:list")
            *args: Positional arguments to include in key
            **kwargs: Keyword arguments to include in key

        Returns:
            Generated cache key string.

        Example:
            >>> CacheManager.generate_key("events", user_id, skip=0, limit=10)
            "events:abc123:skip:0:limit:10"
        """
        key_parts = [prefix]
        key_parts.extend(str(arg) for arg in args if arg is not None)
        for k, v in sorted(kwargs.items()):
            if v is not None:
                key_parts.append(f"{k}:{v}")
        return ":".join(key_parts)

    @staticmethod
    def hash_params(params: dict[str, Any]) -> str:
        """
        Generate MD5 hash from parameters for complex cache keys.

        Args:
            params: Dictionary of parameters to hash.

        Returns:
            MD5 hash string.
        """
        param_str = json.dumps(params, sort_keys=True, default=str)
        return hashlib.md5(param_str.encode()).hexdigest()

    async def get(self, key: str, db: int = 1) -> Optional[Any]:
        """
        Retrieve cached data.

        Args:
            key: Cache key to retrieve.
            db: Redis database number.

        Returns:
            Deserialized cached data or None if not found/error.
        """
        client = await self.get_redis(db)
        if client:
            try:
                data = await client.get(key)
                if data:
                    return json.loads(data)
            except json.JSONDecodeError as e:
                logger.warning(f"Cache JSON decode error for {key}: {e}")
            except Exception as e:
                logger.warning(f"Cache read error for {key}: {e}")
        return None

    async def set(
        self, key: str, data: Any, ttl: int = CacheTTL.MEDIUM, db: int = 1
    ) -> bool:
        """
        Store data in cache with TTL.

        Args:
            key: Cache key.
            data: Data to cache (will be JSON serialized).
            ttl: Time-to-live in seconds.
            db: Redis database number.

        Returns:
            True if cached successfully, False otherwise.
        """
        client = await self.get_redis(db)
        if client:
            try:
                await client.setex(key, ttl, json.dumps(data, default=str))
                return True
            except Exception as e:
                logger.warning(f"Cache write error for {key}: {e}")
        return False

    async def delete(self, key: str, db: int = 1) -> bool:
        """
        Delete cached data.

        Args:
            key: Cache key to delete.
            db: Redis database number.

        Returns:
            True if deleted successfully, False otherwise.
        """
        client = await self.get_redis(db)
        if client:
            try:
                await client.delete(key)
                return True
            except Exception as e:
                logger.warning(f"Cache delete error for {key}: {e}")
        return False

    async def invalidate_pattern(self, pattern: str, db: int = 1) -> int:
        """
        Invalidate all keys matching pattern.

        Args:
            pattern: Redis key pattern (e.g., "events:*:user123").
            db: Redis database number.

        Returns:
            Number of keys deleted.
        """
        client = await self.get_redis(db)
        deleted = 0
        if client:
            try:
                keys: list[str] = []
                async for key in client.scan_iter(match=pattern):
                    keys.append(key)
                if keys:
                    deleted = await client.delete(*keys)
                    logger.debug(f"Cache invalidated {deleted} keys matching {pattern}")
            except Exception as e:
                logger.warning(f"Cache pattern invalidation error for {pattern}: {e}")
        return deleted

    async def exists(self, key: str, db: int = 1) -> bool:
        """
        Check if a key exists in cache.

        Args:
            key: Cache key to check.
            db: Redis database number.

        Returns:
            True if key exists, False otherwise.
        """
        client = await self.get_redis(db)
        if client:
            try:
                return await client.exists(key) > 0
            except Exception as e:
                logger.warning(f"Cache exists check error for {key}: {e}")
        return False

    async def get_ttl(self, key: str, db: int = 1) -> Optional[int]:
        """
        Get remaining TTL for a key.

        Args:
            key: Cache key.
            db: Redis database number.

        Returns:
            TTL in seconds, -1 if no expiry, -2 if key doesn't exist, None on error.
        """
        client = await self.get_redis(db)
        if client:
            try:
                return await client.ttl(key)
            except Exception as e:
                logger.warning(f"Cache TTL check error for {key}: {e}")
        return None


# Global cache manager instance
cache_manager = CacheManager()


def cached(
    prefix: str,
    ttl: int = CacheTTL.MEDIUM,
    db: int = 1,
    key_builder: Optional[Callable[..., str]] = None,
) -> Callable[[Callable[..., T]], Callable[..., T]]:
    """
    Decorator for caching async function results.

    Args:
        prefix: Cache key prefix.
        ttl: Time-to-live in seconds.
        db: Redis database number.
        key_builder: Optional custom function to build cache key.

    Returns:
        Decorated function with caching.

    Example:
        @cached("events:list", ttl=CacheTTL.SHORT)
        async def get_events(user_id: str, skip: int, limit: int):
            # expensive database query
            return events

        # First call - hits database, caches result
        events = await get_events("user123", 0, 10)

        # Second call within TTL - returns cached result
        events = await get_events("user123", 0, 10)
    """

    def decorator(func: Callable[..., T]) -> Callable[..., T]:
        @wraps(func)
        async def wrapper(*args: Any, **kwargs: Any) -> T:
            # Build cache key
            if key_builder:
                cache_key = key_builder(*args, **kwargs)
            else:
                cache_key = cache_manager.generate_key(prefix, *args, **kwargs)

            # Try cache first
            cached_data = await cache_manager.get(cache_key, db)
            if cached_data is not None:
                logger.debug(f"Cache hit: {cache_key}")
                return cached_data

            # Execute function and cache result
            result = await func(*args, **kwargs)
            await cache_manager.set(cache_key, result, ttl, db)
            logger.debug(f"Cache miss, stored: {cache_key}")
            return result

        return wrapper

    return decorator


async def invalidate_user_cache(user_id: str, patterns: Optional[list[str]] = None) -> int:
    """
    Invalidate all cache entries for a user.

    Args:
        user_id: User ID to invalidate cache for.
        patterns: Optional list of specific patterns. If None, invalidates common patterns.

    Returns:
        Total number of keys invalidated.
    """
    if patterns is None:
        patterns = [
            f"events:*:{user_id}:*",
            f"guests:*:{user_id}:*",
            f"budget:*:{user_id}:*",
        ]

    total_deleted = 0
    for pattern in patterns:
        deleted = await cache_manager.invalidate_pattern(pattern)
        total_deleted += deleted

    return total_deleted
