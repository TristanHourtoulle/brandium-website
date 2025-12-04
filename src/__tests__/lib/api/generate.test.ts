import { describe, it, expect, vi, beforeEach } from "vitest";
import { generatePost, getRateLimitStatus } from "@/lib/api/generate";
import { apiClient } from "@/lib/api/client";
import type { GenerateRequest, RateLimitStatus } from "@/types";

// Mock the apiClient
vi.mock("@/lib/api/client", () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

// Mock backend response format
const mockBackendResponse = {
  message: "Post generated successfully",
  data: {
    postId: "post-1",
    generatedText:
      "Just finished an amazing project! Here are my top 3 lessons learned about time management...",
    usage: {
      promptTokens: 500,
      completionTokens: 200,
      totalTokens: 700,
    },
    context: {
      profile: { id: "profile-1", name: "Professional LinkedIn" },
      project: { id: "project-1", name: "My Project" },
      platform: { id: "platform-1", name: "LinkedIn" },
    },
  },
  rateLimit: {
    remaining: 8,
    total: 10,
    resetAt: "2025-01-15T13:00:00.000Z",
  },
};

const mockRateLimitStatus: RateLimitStatus = {
  remaining: 8,
  total: 10,
  resetAt: "2025-01-15T13:00:00.000Z",
};

describe("generate API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("generatePost", () => {
    it("should generate a post with all parameters", async () => {
      const request: GenerateRequest = {
        profileId: "profile-1",
        projectId: "project-1",
        platformId: "platform-1",
        goal: "Share knowledge and build authority",
        rawIdea:
          "I finished a challenging project and learned about time management",
      };

      vi.mocked(apiClient.post).mockResolvedValue(mockBackendResponse);

      const result = await generatePost(request);

      expect(apiClient.post).toHaveBeenCalledWith("/api/generate", request);
      expect(result.post.id).toBe("post-1");
      expect(result.post.content).toBe(mockBackendResponse.data.generatedText);
      expect(result.post.profileId).toBe("profile-1");
      expect(result.rateLimit).toEqual(mockRateLimitStatus);
    });

    it("should generate a post with only required parameters", async () => {
      const request: GenerateRequest = {
        profileId: "profile-1",
        rawIdea: "Quick thought about productivity",
      };

      const backendResponse = {
        ...mockBackendResponse,
        data: {
          ...mockBackendResponse.data,
          context: {
            profile: { id: "profile-1", name: "Professional" },
          },
        },
      };

      vi.mocked(apiClient.post).mockResolvedValue(backendResponse);

      const result = await generatePost(request);

      expect(apiClient.post).toHaveBeenCalledWith("/api/generate", request);
      expect(result.post.profileId).toBe("profile-1");
      expect(result.post.projectId).toBeUndefined();
    });

    it("should use default rate limit when not provided", async () => {
      const request: GenerateRequest = {
        profileId: "profile-1",
        rawIdea: "Test idea for generation",
      };

      const backendResponseWithoutRateLimit = {
        message: "Post generated successfully",
        data: mockBackendResponse.data,
        // No rateLimit field
      };

      vi.mocked(apiClient.post).mockResolvedValue(backendResponseWithoutRateLimit);

      const result = await generatePost(request);

      expect(result.rateLimit.remaining).toBe(10);
      expect(result.rateLimit.total).toBe(10);
    });

    it("should throw error when rate limited", async () => {
      const request: GenerateRequest = {
        profileId: "profile-1",
        rawIdea: "Test idea",
      };

      const error = {
        message: "Rate limit exceeded",
        statusCode: 429,
      };
      vi.mocked(apiClient.post).mockRejectedValue(error);

      await expect(generatePost(request)).rejects.toEqual(error);
    });

    it("should throw error when profile not found", async () => {
      const request: GenerateRequest = {
        profileId: "invalid-profile",
        rawIdea: "Test idea",
      };

      const error = {
        message: "Profile not found",
        statusCode: 404,
      };
      vi.mocked(apiClient.post).mockRejectedValue(error);

      await expect(generatePost(request)).rejects.toEqual(error);
    });

    it("should throw error on validation failure", async () => {
      const request: GenerateRequest = {
        profileId: "profile-1",
        rawIdea: "short", // Too short
      };

      const error = {
        message: "Raw idea must be at least 10 characters",
        statusCode: 400,
      };
      vi.mocked(apiClient.post).mockRejectedValue(error);

      await expect(generatePost(request)).rejects.toEqual(error);
    });

    it("should throw error on API failure", async () => {
      const request: GenerateRequest = {
        profileId: "profile-1",
        rawIdea: "Test idea for generation",
      };

      const error = new Error("Network error");
      vi.mocked(apiClient.post).mockRejectedValue(error);

      await expect(generatePost(request)).rejects.toThrow("Network error");
    });
  });

  describe("getRateLimitStatus", () => {
    it("should fetch rate limit status", async () => {
      vi.mocked(apiClient.get).mockResolvedValue(mockRateLimitStatus);

      const result = await getRateLimitStatus();

      expect(apiClient.get).toHaveBeenCalledWith("/api/generate/status");
      expect(result).toEqual(mockRateLimitStatus);
    });

    it("should return status when rate limited", async () => {
      const limitedStatus: RateLimitStatus = {
        remaining: 0,
        total: 10,
        resetAt: "2025-01-15T13:00:00.000Z",
      };

      vi.mocked(apiClient.get).mockResolvedValue(limitedStatus);

      const result = await getRateLimitStatus();

      expect(result.remaining).toBe(0);
      expect(result.total).toBe(10);
    });

    it("should throw error on API failure", async () => {
      const error = new Error("Network error");
      vi.mocked(apiClient.get).mockRejectedValue(error);

      await expect(getRateLimitStatus()).rejects.toThrow("Network error");
    });

    it("should throw error on auth failure", async () => {
      const error = {
        message: "Unauthorized",
        statusCode: 401,
      };
      vi.mocked(apiClient.get).mockRejectedValue(error);

      await expect(getRateLimitStatus()).rejects.toEqual(error);
    });
  });
});
