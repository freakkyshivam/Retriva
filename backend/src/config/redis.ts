import { Redis } from 'ioredis';
import 'dotenv/config';


const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

let redisInstance: Redis | null = null;
let isConnected = false;

export const getRedisClient = (): Redis => {
    if (!redisInstance) {
        redisInstance = new Redis(REDIS_URL, {
            lazyConnect: true,
            maxRetriesPerRequest: 1,
            enableOfflineQueue: false,
            connectTimeout: 3000,
            retryStrategy: (times) => {
                if (times > 3) {
                    // Stop aggressive retrying if Redis is down
                    return null;
                }
                return Math.min(times * 200, 1000);
            },
        });

        redisInstance.on('connect', () => {
            isConnected = true;
            console.log('[Redis] Connected to Redis server.');
        });

        redisInstance.on('ready', () => {
            isConnected = true;
        });

        redisInstance.on('close', () => {
            isConnected = false;
        });

        redisInstance.on('error', (err: Error) => {
            isConnected = false;
            // Warn instead of crashing
            console.warn(`[Redis] Connection warning: ${err.message}`);
        });
    }

    return redisInstance;
};

export const redis = getRedisClient();

export const connectRedis = async (): Promise<void> => {
    const client = getRedisClient();

    await client.connect();
};

export const isRedisReady = (): boolean => isConnected;
