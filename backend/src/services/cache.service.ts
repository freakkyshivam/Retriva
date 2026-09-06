import crypto from 'crypto';
import { redis, isRedisReady } from '../config/redis.js';
import type { AskResult } from './rag.service.js';

/**
 * Cache TTL in seconds (configurable via CACHE_TTL_SECONDS or REDIS_CACHE_TTL)
 * Defaults to 86,400 seconds (24 hours)
 */
export const CACHE_TTL_SECONDS = Number(
    process.env.CACHE_TTL_SECONDS || process.env.REDIS_CACHE_TTL || 86400
);

// In-memory fallback cache for development or when Redis connection is unavailable
interface FallbackCacheEntry {
    data: AskResult;
    expiresAt: number;
}
const fallbackCache = new Map<string, FallbackCacheEntry>();

/**
 * Normalizes user queries into a deterministic string representation.
 * Handles variations in casing, extra spaces, and trailing punctuation.
 * Example: "  What is Binary Search??  " -> "what is binary search"
 */
export function normalizeQuery(query: string): string {
    return query
        .normalize('NFKC')
        .toLowerCase()
        .trim()
        .replace(/[?!.,]+$/, '') // Remove trailing question marks/punctuation
        .trim()
        .replace(/\s+/g, ' ');   // Collapse multiple spaces into single space
}

/**
 * Generates a deterministic SHA-256 cache key for the query.
 * Format: rag:query:<hash>
 */
export function getRagCacheKey(query: string): string {
    const normalized = normalizeQuery(query);
    const hash = crypto.createHash('sha256').update(normalized).digest('hex');
    return `rag:query:${hash}`;
}

/**
 * Retrieves cached RAG response.
 * Returns AskResult on CACHE HIT, or null on CACHE MISS.
 */
export async function getCachedRAGResponse(query: string): Promise<AskResult | null> {
    const key = getRagCacheKey(query);

    // 1. Try Redis cache if available
    try {
        if (!isRedisReady()) {
            // Attempt to connect if disconnected
            await redis.connect().catch(() => {});
        }

        if (isRedisReady()) {
            const cachedJson = await redis.get(key);
            if (cachedJson) {
                console.log('CACHE HIT');
                return JSON.parse(cachedJson) as AskResult;
            }
        }
    } catch {
        // Fall through to in-memory fallback on Redis error
    }

    // 2. Fallback in-memory cache check
    const localEntry = fallbackCache.get(key);
    if (localEntry) {
        if (Date.now() < localEntry.expiresAt) {
            console.log('CACHE HIT');
            return localEntry.data;
        }
        fallbackCache.delete(key);
    }

    console.log('CACHE MISS');
    return null;
}

/**
 * Stores a successful RAG response into cache with TTL.
 * Errors, nulls, or empty answers are strictly NOT cached.
 */
export async function setCachedRAGResponse(
    query: string,
    result: AskResult,
    ttlSeconds: number = CACHE_TTL_SECONDS
): Promise<void> {
    // Never cache errors, undefined, or empty answers
    if (!result || !result.answer || result.answer.trim().length === 0) {
        return;
    }

    const key = getRagCacheKey(query);
    const jsonStr = JSON.stringify(result);

    // 1. Store in Redis
    try {
        if (!isRedisReady()) {
            await redis.connect().catch(() => {});
        }
        if (isRedisReady()) {
            await redis.set(key, jsonStr, 'EX', ttlSeconds);
        }
    } catch {
        // Suppress Redis write failure
    }

    // 2. Also keep in fallback cache
    fallbackCache.set(key, {
        data: result,
        expiresAt: Date.now() + ttlSeconds * 1000,
    });
}

/**
 * Helper to clear cache (useful for testing or invalidation)
 */
export async function clearRAGCache(): Promise<void> {
    fallbackCache.clear();
    try {
        if (isRedisReady()) {
            const keys = await redis.keys('rag:query:*');
            if (keys.length > 0) {
                await redis.del(...keys);
            }
        }
    } catch {
        // Suppress
    }
}
