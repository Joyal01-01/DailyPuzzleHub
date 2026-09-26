import Redis from "ioredis";

// Safe Redis wrapper that connects to REDIS_URL if available,
// or provides an in-memory fallback for leaderboards and rate limiting
class RedisManager {
  private client: Redis | null = null;
  private memoryMap = new Map<string, { value: string; expiresAt?: number }>();
  private leaderboards = new Map<string, Map<string, number>>();
  public isConnected = false;

  constructor() {
    const url = process.env.REDIS_URL || "redis://localhost:6379";
    try {
      this.client = new Redis(url, {
        maxRetriesPerRequest: 1,
        connectTimeout: 1000,
        retryStrategy: () => null, // don't spam reconnects if offline
        lazyConnect: true,
      });

      this.client
        .connect()
        .then(() => {
          this.isConnected = true;
          console.log("[Redis] Connected successfully to:", url);
        })
        .catch(() => {
          this.isConnected = false;
          console.log("[Redis] Offline. Using in-memory cache/leaderboard fallback.");
        });
    } catch {
      this.isConnected = false;
    }
  }

  async get(key: string): Promise<string | null> {
    if (this.isConnected && this.client) {
      try {
        return await this.client.get(key);
      } catch {}
    }
    const item = this.memoryMap.get(key);
    if (!item) return null;
    if (item.expiresAt && Date.now() > item.expiresAt) {
      this.memoryMap.delete(key);
      return null;
    }
    return item.value;
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (this.isConnected && this.client) {
      try {
        if (ttlSeconds) {
          await this.client.set(key, value, "EX", ttlSeconds);
        } else {
          await this.client.set(key, value);
        }
        return;
      } catch {}
    }
    const expiresAt = ttlSeconds ? Date.now() + ttlSeconds * 1000 : undefined;
    this.memoryMap.set(key, { value, expiresAt });
  }

  // Leaderboard Sorted Set (ZADD)
  async zadd(key: string, score: number, member: string): Promise<void> {
    if (this.isConnected && this.client) {
      try {
        await this.client.zadd(key, score, member);
        return;
      } catch {}
    }
    if (!this.leaderboards.has(key)) {
      this.leaderboards.set(key, new Map());
    }
    this.leaderboards.get(key)!.set(member, score);
  }

  // Leaderboard Top Scores (ZREVRANGE with scores)
  async zrevrangeWithScores(
    key: string,
    start: number,
    stop: number
  ): Promise<Array<{ member: string; score: number }>> {
    if (this.isConnected && this.client) {
      try {
        const raw = await this.client.zrevrange(key, start, stop, "WITHSCORES");
        const results = [];
        for (let i = 0; i < raw.length; i += 2) {
          results.push({ member: raw[i], score: parseFloat(raw[i + 1]) });
        }
        return results;
      } catch {}
    }

    const board = this.leaderboards.get(key);
    if (!board) return [];

    const sorted = Array.from(board.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(start, stop + 1)
      .map(([member, score]) => ({ member, score }));

    return sorted;
  }

  // Rate Limiter
  async rateLimit(identifier: string, limit: number, windowSec: number): Promise<{ allowed: boolean; remaining: number }> {
    const key = `rate:${identifier}`;
    const currentStr = await this.get(key);
    const current = currentStr ? parseInt(currentStr, 10) : 0;

    if (current >= limit) {
      return { allowed: false, remaining: 0 };
    }

    await this.set(key, (current + 1).toString(), windowSec);
    return { allowed: true, remaining: limit - (current + 1) };
  }
}

export const redis = new RedisManager();
