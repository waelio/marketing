import Redis from 'ioredis';

const url = process.env.REDIS_URL || 'redis://localhost:6379';

export const redis = new Redis(url, {
  maxRetriesPerRequest: 3,
  lazyConnect: true,
});

redis.on('error', (err) => console.error('Redis error:', err.message));

export async function ensureRedis(): Promise<boolean> {
  try {
    if (redis.status !== 'ready') await redis.connect();
    await redis.ping();
    return true;
  } catch {
    return false;
  }
}
