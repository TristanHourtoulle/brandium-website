/**
 * Simple client-side cache with TTL support
 * Used for caching API responses to reduce redundant requests
 */

interface CacheEntry<T> {
  data: T;
  expiry: number;
}

interface CacheOptions {
  /** Time-to-live in milliseconds */
  ttl: number;
}

// Default TTL values for different data types
export const CACHE_TTL = {
  TEMPLATES: 5 * 60 * 1000, // 5 minutes
  PROFILES: 10 * 60 * 1000, // 10 minutes
  PLATFORMS: 10 * 60 * 1000, // 10 minutes
  PROJECTS: 10 * 60 * 1000, // 10 minutes
  IDEAS: 3 * 60 * 1000, // 3 minutes
  POSTS: 2 * 60 * 1000, // 2 minutes
  SHORT: 30 * 1000, // 30 seconds
} as const;

class ClientCache {
  private cache: Map<string, CacheEntry<unknown>> = new Map();
  private cleanupInterval: ReturnType<typeof setInterval> | null = null;

  constructor() {
    // Start cleanup interval if in browser
    if (typeof window !== "undefined") {
      this.startCleanup();
    }
  }

  /**
   * Start periodic cleanup of expired entries
   */
  private startCleanup(): void {
    if (this.cleanupInterval) return;

    // Run cleanup every minute
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60 * 1000);
  }

  /**
   * Remove expired entries from cache
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiry) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Get a cached value
   * @returns The cached value or undefined if not found or expired
   */
  get<T>(key: string): T | undefined {
    const entry = this.cache.get(key);

    if (!entry) {
      return undefined;
    }

    // Check if expired
    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return undefined;
    }

    return entry.data as T;
  }

  /**
   * Set a cached value with TTL
   */
  set<T>(key: string, data: T, options: CacheOptions): void {
    const entry: CacheEntry<T> = {
      data,
      expiry: Date.now() + options.ttl,
    };
    this.cache.set(key, entry);
  }

  /**
   * Check if a key exists and is not expired
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Delete a specific key
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Delete all keys matching a prefix
   * Useful for invalidating related cache entries
   */
  deleteByPrefix(prefix: string): void {
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Clear all cached entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get the number of cached entries
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Get or fetch: return cached value or fetch and cache new value
   */
  async getOrFetch<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: CacheOptions
  ): Promise<T> {
    // Check cache first
    const cached = this.get<T>(key);
    if (cached !== undefined) {
      return cached;
    }

    // Fetch and cache
    const data = await fetcher();
    this.set(key, data, options);
    return data;
  }
}

// Singleton instance
export const cache = new ClientCache();

/**
 * Create a cache key from parts
 * Ensures consistent key generation
 */
export function createCacheKey(...parts: (string | number | undefined | null)[]): string {
  return parts.filter(Boolean).join(":");
}

/**
 * Hook-friendly wrapper for getOrFetch
 * Can be used with SWR-like patterns
 */
export function withCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = CACHE_TTL.SHORT
): () => Promise<T> {
  return () => cache.getOrFetch(key, fetcher, { ttl });
}
