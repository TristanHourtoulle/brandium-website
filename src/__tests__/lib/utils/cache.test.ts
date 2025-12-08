import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { cache, CACHE_TTL, createCacheKey, withCache } from "@/lib/utils/cache";

describe("cache utility", () => {
  beforeEach(() => {
    cache.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("ClientCache", () => {
    describe("set and get", () => {
      it("should store and retrieve a value", () => {
        cache.set("test-key", { data: "test-value" }, { ttl: 5000 });
        const result = cache.get<{ data: string }>("test-key");
        expect(result).toEqual({ data: "test-value" });
      });

      it("should return undefined for non-existent key", () => {
        const result = cache.get("non-existent");
        expect(result).toBeUndefined();
      });

      it("should return undefined for expired entry", () => {
        cache.set("expiring-key", "value", { ttl: 1000 });

        // Advance time past TTL
        vi.advanceTimersByTime(1500);

        const result = cache.get("expiring-key");
        expect(result).toBeUndefined();
      });

      it("should return value before expiry", () => {
        cache.set("valid-key", "value", { ttl: 5000 });

        // Advance time but not past TTL
        vi.advanceTimersByTime(3000);

        const result = cache.get("valid-key");
        expect(result).toBe("value");
      });
    });

    describe("has", () => {
      it("should return true for existing valid key", () => {
        cache.set("existing", "value", { ttl: 5000 });
        expect(cache.has("existing")).toBe(true);
      });

      it("should return false for non-existent key", () => {
        expect(cache.has("non-existent")).toBe(false);
      });

      it("should return false for expired key", () => {
        cache.set("expiring", "value", { ttl: 1000 });
        vi.advanceTimersByTime(1500);
        expect(cache.has("expiring")).toBe(false);
      });
    });

    describe("delete", () => {
      it("should delete a key", () => {
        cache.set("to-delete", "value", { ttl: 5000 });
        expect(cache.has("to-delete")).toBe(true);

        const result = cache.delete("to-delete");
        expect(result).toBe(true);
        expect(cache.has("to-delete")).toBe(false);
      });

      it("should return false when deleting non-existent key", () => {
        const result = cache.delete("non-existent");
        expect(result).toBe(false);
      });
    });

    describe("deleteByPrefix", () => {
      it("should delete all keys with matching prefix", () => {
        cache.set("user:1", "value1", { ttl: 5000 });
        cache.set("user:2", "value2", { ttl: 5000 });
        cache.set("post:1", "value3", { ttl: 5000 });

        cache.deleteByPrefix("user:");

        expect(cache.has("user:1")).toBe(false);
        expect(cache.has("user:2")).toBe(false);
        expect(cache.has("post:1")).toBe(true);
      });
    });

    describe("clear", () => {
      it("should clear all entries", () => {
        cache.set("key1", "value1", { ttl: 5000 });
        cache.set("key2", "value2", { ttl: 5000 });

        cache.clear();

        expect(cache.size()).toBe(0);
      });
    });

    describe("size", () => {
      it("should return the number of entries", () => {
        expect(cache.size()).toBe(0);

        cache.set("key1", "value1", { ttl: 5000 });
        expect(cache.size()).toBe(1);

        cache.set("key2", "value2", { ttl: 5000 });
        expect(cache.size()).toBe(2);
      });
    });

    describe("getOrFetch", () => {
      it("should return cached value if available", async () => {
        cache.set("cached-key", "cached-value", { ttl: 5000 });
        const fetcher = vi.fn().mockResolvedValue("fetched-value");

        const result = await cache.getOrFetch("cached-key", fetcher, { ttl: 5000 });

        expect(result).toBe("cached-value");
        expect(fetcher).not.toHaveBeenCalled();
      });

      it("should fetch and cache if not available", async () => {
        const fetcher = vi.fn().mockResolvedValue("fetched-value");

        const result = await cache.getOrFetch("new-key", fetcher, { ttl: 5000 });

        expect(result).toBe("fetched-value");
        expect(fetcher).toHaveBeenCalledOnce();
        expect(cache.get("new-key")).toBe("fetched-value");
      });

      it("should fetch again after expiry", async () => {
        const fetcher = vi.fn()
          .mockResolvedValueOnce("first-value")
          .mockResolvedValueOnce("second-value");

        // First fetch
        const result1 = await cache.getOrFetch("key", fetcher, { ttl: 1000 });
        expect(result1).toBe("first-value");

        // Expire the cache
        vi.advanceTimersByTime(1500);

        // Second fetch after expiry
        const result2 = await cache.getOrFetch("key", fetcher, { ttl: 1000 });
        expect(result2).toBe("second-value");
        expect(fetcher).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe("CACHE_TTL", () => {
    it("should have correct TTL values", () => {
      expect(CACHE_TTL.TEMPLATES).toBe(5 * 60 * 1000);
      expect(CACHE_TTL.PROFILES).toBe(10 * 60 * 1000);
      expect(CACHE_TTL.PLATFORMS).toBe(10 * 60 * 1000);
      expect(CACHE_TTL.PROJECTS).toBe(10 * 60 * 1000);
      expect(CACHE_TTL.IDEAS).toBe(3 * 60 * 1000);
      expect(CACHE_TTL.POSTS).toBe(2 * 60 * 1000);
      expect(CACHE_TTL.SHORT).toBe(30 * 1000);
    });
  });

  describe("createCacheKey", () => {
    it("should join parts with colon", () => {
      expect(createCacheKey("user", "123", "profile")).toBe("user:123:profile");
    });

    it("should filter out undefined and null values", () => {
      expect(createCacheKey("user", undefined, "123", null, "data")).toBe("user:123:data");
    });

    it("should handle numbers", () => {
      expect(createCacheKey("item", 42)).toBe("item:42");
    });

    it("should return empty string for all falsy values", () => {
      expect(createCacheKey(undefined, null)).toBe("");
    });
  });

  describe("withCache", () => {
    it("should return a function that uses cache", async () => {
      const fetcher = vi.fn().mockResolvedValue("data");
      const cachedFetcher = withCache("test-key", fetcher, 5000);

      // First call should fetch
      const result1 = await cachedFetcher();
      expect(result1).toBe("data");
      expect(fetcher).toHaveBeenCalledOnce();

      // Second call should use cache
      const result2 = await cachedFetcher();
      expect(result2).toBe("data");
      expect(fetcher).toHaveBeenCalledOnce();
    });

    it("should use SHORT TTL by default", async () => {
      const fetcher = vi.fn().mockResolvedValue("data");
      const cachedFetcher = withCache("default-ttl-key", fetcher);

      await cachedFetcher();

      // Advance past SHORT TTL
      vi.advanceTimersByTime(CACHE_TTL.SHORT + 100);

      await cachedFetcher();
      expect(fetcher).toHaveBeenCalledTimes(2);
    });
  });
});
