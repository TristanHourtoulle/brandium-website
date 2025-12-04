import { describe, it, expect, vi, beforeEach } from "vitest";
import { fetchPosts, fetchPostById, deletePost } from "@/lib/api/posts";
import { apiClient } from "@/lib/api/client";

// Mock the API client
vi.mock("@/lib/api/client", () => ({
  apiClient: {
    get: vi.fn(),
    delete: vi.fn(),
  },
}));

describe("Posts API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("fetchPosts", () => {
    it("should fetch posts without filters and transform response", async () => {
      // Mock API response format (with data and generatedText)
      const mockApiResponse = {
        data: [
          {
            id: "1",
            userId: "user-1",
            generatedText: "Test post content",
            rawIdea: "Test idea",
            createdAt: "2024-01-01T00:00:00Z",
            updatedAt: "2024-01-01T00:00:00Z",
          },
        ],
        pagination: {
          page: 1,
          totalPages: 1,
          total: 1,
          limit: 10,
          hasNext: false,
          hasPrev: false,
        },
      };

      vi.mocked(apiClient.get).mockResolvedValue(mockApiResponse);

      const result = await fetchPosts();

      expect(apiClient.get).toHaveBeenCalledWith("/api/posts");
      // Verify transformed response
      expect(result.posts[0].content).toBe("Test post content");
      expect(result.pagination.currentPage).toBe(1);
      expect(result.pagination.totalItems).toBe(1);
    });

    it("should fetch posts with filters", async () => {
      const mockApiResponse = {
        data: [],
        pagination: {
          page: 2,
          totalPages: 3,
          total: 25,
          limit: 10,
          hasNext: true,
          hasPrev: true,
        },
      };

      vi.mocked(apiClient.get).mockResolvedValue(mockApiResponse);

      const filters = {
        search: "test",
        platformId: "platform-1",
        page: 2,
        limit: 10,
      };

      const result = await fetchPosts(filters);

      expect(apiClient.get).toHaveBeenCalledWith(
        "/api/posts?search=test&platformId=platform-1&page=2&limit=10"
      );
      expect(result.pagination.currentPage).toBe(2);
      expect(result.pagination.totalItems).toBe(25);
    });

    it("should handle empty filters", async () => {
      const mockApiResponse = {
        data: [],
        pagination: {
          page: 1,
          totalPages: 0,
          total: 0,
          limit: 10,
          hasNext: false,
          hasPrev: false,
        },
      };

      vi.mocked(apiClient.get).mockResolvedValue(mockApiResponse);

      const result = await fetchPosts({});

      expect(apiClient.get).toHaveBeenCalledWith("/api/posts");
      expect(result.posts).toEqual([]);
    });
  });

  describe("fetchPostById", () => {
    it("should fetch a single post by ID and transform response", async () => {
      // Mock API response format (wrapped in data, with generatedText)
      const mockApiResponse = {
        data: {
          id: "post-1",
          userId: "user-1",
          generatedText: "Test content",
          rawIdea: "Test idea",
          createdAt: "2024-01-01T00:00:00Z",
          updatedAt: "2024-01-01T00:00:00Z",
          profile: { id: "profile-1", name: "Test Profile" },
          platform: { id: "platform-1", name: "LinkedIn" },
        },
      };

      vi.mocked(apiClient.get).mockResolvedValue(mockApiResponse);

      const result = await fetchPostById("post-1");

      expect(apiClient.get).toHaveBeenCalledWith("/api/posts/post-1");
      // Verify transformation: generatedText -> content
      expect(result.content).toBe("Test content");
      expect(result.profile?.name).toBe("Test Profile");
    });
  });

  describe("deletePost", () => {
    it("should delete a post by ID", async () => {
      vi.mocked(apiClient.delete).mockResolvedValue(undefined);

      await deletePost("post-1");

      expect(apiClient.delete).toHaveBeenCalledWith("/api/posts/post-1");
    });
  });
});
