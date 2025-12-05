import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  iteratePost,
  fetchVersions,
  fetchVersion,
  selectVersion,
} from "@/lib/api/iterations";
import { apiClient } from "@/lib/api/client";
import type {
  IterateRequest,
  PostVersion,
  IterateResponse,
  VersionsResponse,
} from "@/types";

// Mock the apiClient
vi.mock("@/lib/api/client", () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
  },
}));

// Mock data
const mockVersion1: PostVersion = {
  id: "version-1",
  versionNumber: 1,
  generatedText: "Original post content about productivity tips...",
  iterationPrompt: null,
  isSelected: false,
  usage: {
    promptTokens: 250,
    completionTokens: 100,
    totalTokens: 350,
  },
  createdAt: "2025-12-04T10:00:00.000Z",
};

const mockVersion2: PostVersion = {
  id: "version-2",
  versionNumber: 2,
  generatedText: "Shorter and punchier version of productivity tips!",
  iterationPrompt: "Make it shorter and add emojis",
  isSelected: true,
  usage: {
    promptTokens: 350,
    completionTokens: 80,
    totalTokens: 430,
  },
  createdAt: "2025-12-04T10:05:00.000Z",
};

const mockIterateResponse: IterateResponse = {
  versionId: "version-2",
  versionNumber: 2,
  generatedText: "Shorter and punchier version of productivity tips!",
  iterationPrompt: "Make it shorter and add emojis",
  isSelected: true,
  usage: {
    promptTokens: 350,
    completionTokens: 80,
    totalTokens: 430,
  },
};

const mockVersionsResponse: VersionsResponse = {
  postId: "post-1",
  totalVersions: 2,
  versions: [mockVersion1, mockVersion2],
};

describe("iterations API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("iteratePost", () => {
    it("should create a new iteration with prompt", async () => {
      const postId = "post-1";
      const request: IterateRequest = {
        iterationPrompt: "Make it shorter and add emojis",
      };

      vi.mocked(apiClient.post).mockResolvedValue({
        message: "Iteration created successfully",
        data: mockIterateResponse,
      });

      const result = await iteratePost(postId, request);

      expect(apiClient.post).toHaveBeenCalledWith(
        `/api/posts/${postId}/iterate`,
        request
      );
      expect(result.versionId).toBe("version-2");
      expect(result.versionNumber).toBe(2);
      expect(result.generatedText).toBe(
        "Shorter and punchier version of productivity tips!"
      );
      expect(result.isSelected).toBe(true);
    });

    it("should create iteration with maxTokens option", async () => {
      const postId = "post-1";
      const request: IterateRequest = {
        iterationPrompt: "Make it longer",
        maxTokens: 2000,
      };

      vi.mocked(apiClient.post).mockResolvedValue({
        message: "Iteration created successfully",
        data: mockIterateResponse,
      });

      await iteratePost(postId, request);

      expect(apiClient.post).toHaveBeenCalledWith(
        `/api/posts/${postId}/iterate`,
        request
      );
    });

    it("should throw error when post not found", async () => {
      const postId = "invalid-post";
      const request: IterateRequest = {
        iterationPrompt: "Make it better",
      };

      const error = {
        message: "Post not found",
        statusCode: 404,
      };
      vi.mocked(apiClient.post).mockRejectedValue(error);

      await expect(iteratePost(postId, request)).rejects.toEqual(error);
    });

    it("should throw error when rate limited", async () => {
      const postId = "post-1";
      const request: IterateRequest = {
        iterationPrompt: "Make it better",
      };

      const error = {
        message: "Rate limit exceeded",
        statusCode: 429,
      };
      vi.mocked(apiClient.post).mockRejectedValue(error);

      await expect(iteratePost(postId, request)).rejects.toEqual(error);
    });

    it("should throw error when prompt is empty", async () => {
      const postId = "post-1";
      const request: IterateRequest = {
        iterationPrompt: "",
      };

      const error = {
        message: "iterationPrompt is required and cannot be empty",
        statusCode: 400,
      };
      vi.mocked(apiClient.post).mockRejectedValue(error);

      await expect(iteratePost(postId, request)).rejects.toEqual(error);
    });
  });

  describe("fetchVersions", () => {
    it("should fetch all versions of a post", async () => {
      const postId = "post-1";

      vi.mocked(apiClient.get).mockResolvedValue({
        message: "Versions retrieved successfully",
        data: mockVersionsResponse,
      });

      const result = await fetchVersions(postId);

      expect(apiClient.get).toHaveBeenCalledWith(
        `/api/posts/${postId}/versions`
      );
      expect(result.postId).toBe("post-1");
      expect(result.totalVersions).toBe(2);
      expect(result.versions).toHaveLength(2);
      expect(result.versions[0].versionNumber).toBe(1);
      expect(result.versions[1].versionNumber).toBe(2);
    });

    it("should return empty versions array for new post", async () => {
      const postId = "new-post";

      vi.mocked(apiClient.get).mockResolvedValue({
        message: "Versions retrieved successfully",
        data: {
          postId: "new-post",
          totalVersions: 1,
          versions: [mockVersion1],
        },
      });

      const result = await fetchVersions(postId);

      expect(result.versions).toHaveLength(1);
      expect(result.versions[0].iterationPrompt).toBeNull();
    });

    it("should throw error when post not found", async () => {
      const postId = "invalid-post";

      const error = {
        message: "Post not found",
        statusCode: 404,
      };
      vi.mocked(apiClient.get).mockRejectedValue(error);

      await expect(fetchVersions(postId)).rejects.toEqual(error);
    });

    it("should throw error on unauthorized access", async () => {
      const postId = "post-1";

      const error = {
        message: "Unauthorized",
        statusCode: 401,
      };
      vi.mocked(apiClient.get).mockRejectedValue(error);

      await expect(fetchVersions(postId)).rejects.toEqual(error);
    });
  });

  describe("fetchVersion", () => {
    it("should fetch a specific version", async () => {
      const postId = "post-1";
      const versionId = "version-2";

      vi.mocked(apiClient.get).mockResolvedValue({
        message: "Version retrieved successfully",
        data: mockVersion2,
      });

      const result = await fetchVersion(postId, versionId);

      expect(apiClient.get).toHaveBeenCalledWith(
        `/api/posts/${postId}/versions/${versionId}`
      );
      expect(result.id).toBe("version-2");
      expect(result.versionNumber).toBe(2);
      expect(result.iterationPrompt).toBe("Make it shorter and add emojis");
    });

    it("should throw error when version not found", async () => {
      const postId = "post-1";
      const versionId = "invalid-version";

      const error = {
        message: "Version not found",
        statusCode: 404,
      };
      vi.mocked(apiClient.get).mockRejectedValue(error);

      await expect(fetchVersion(postId, versionId)).rejects.toEqual(error);
    });
  });

  describe("selectVersion", () => {
    it("should select a version as current", async () => {
      const postId = "post-1";
      const versionId = "version-1";

      const selectedVersion = { ...mockVersion1, isSelected: true };
      vi.mocked(apiClient.patch).mockResolvedValue({
        message: "Version selected successfully",
        data: selectedVersion,
      });

      const result = await selectVersion(postId, versionId);

      expect(apiClient.patch).toHaveBeenCalledWith(
        `/api/posts/${postId}/versions/${versionId}/select`
      );
      expect(result.id).toBe("version-1");
      expect(result.isSelected).toBe(true);
    });

    it("should throw error when version not found", async () => {
      const postId = "post-1";
      const versionId = "invalid-version";

      const error = {
        message: "Version not found",
        statusCode: 404,
      };
      vi.mocked(apiClient.patch).mockRejectedValue(error);

      await expect(selectVersion(postId, versionId)).rejects.toEqual(error);
    });

    it("should throw error when post not found", async () => {
      const postId = "invalid-post";
      const versionId = "version-1";

      const error = {
        message: "Post not found",
        statusCode: 404,
      };
      vi.mocked(apiClient.patch).mockRejectedValue(error);

      await expect(selectVersion(postId, versionId)).rejects.toEqual(error);
    });
  });
});
