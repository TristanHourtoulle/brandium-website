import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { usePostIterations } from "@/lib/hooks/use-post-iterations";
import * as iterationsApi from "@/lib/api/iterations";
import type { PostVersion, IterateResponse, VersionsResponse } from "@/types";

// Mock the iterations API
vi.mock("@/lib/api/iterations", () => ({
  iteratePost: vi.fn(),
  fetchVersions: vi.fn(),
  selectVersion: vi.fn(),
}));

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock data
const mockVersion1: PostVersion = {
  id: "version-1",
  versionNumber: 1,
  generatedText: "Original content",
  iterationPrompt: null,
  isSelected: false,
  usage: { promptTokens: 250, completionTokens: 100, totalTokens: 350 },
  createdAt: "2025-12-04T10:00:00.000Z",
};

const mockVersion2: PostVersion = {
  id: "version-2",
  versionNumber: 2,
  generatedText: "Refined content",
  iterationPrompt: "Make it better",
  isSelected: true,
  usage: { promptTokens: 350, completionTokens: 80, totalTokens: 430 },
  createdAt: "2025-12-04T10:05:00.000Z",
};

const mockVersionsResponse: VersionsResponse = {
  postId: "post-1",
  totalVersions: 2,
  versions: [mockVersion1, mockVersion2],
};

const mockIterateResponse: IterateResponse = {
  versionId: "version-2",
  versionNumber: 2,
  generatedText: "Refined content",
  iterationPrompt: "Make it better",
  isSelected: true,
  usage: { promptTokens: 350, completionTokens: 80, totalTokens: 430 },
};

describe("usePostIterations hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("initial state", () => {
    it("should have empty initial state", () => {
      const { result } = renderHook(() => usePostIterations());

      expect(result.current.versions).toEqual([]);
      expect(result.current.currentVersion).toBeNull();
      expect(result.current.totalVersions).toBe(0);
      expect(result.current.isIterating).toBe(false);
      expect(result.current.isFetchingVersions).toBe(false);
      expect(result.current.isSelectingVersion).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  describe("fetchVersions", () => {
    it("should fetch versions successfully", async () => {
      vi.mocked(iterationsApi.fetchVersions).mockResolvedValue(
        mockVersionsResponse
      );

      const { result } = renderHook(() => usePostIterations());

      await act(async () => {
        await result.current.fetchVersions("post-1");
      });

      expect(iterationsApi.fetchVersions).toHaveBeenCalledWith("post-1");
      expect(result.current.versions).toHaveLength(2);
      expect(result.current.totalVersions).toBe(2);
      expect(result.current.currentVersion?.id).toBe("version-2");
    });

    it("should set loading state while fetching", async () => {
      vi.mocked(iterationsApi.fetchVersions).mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve(mockVersionsResponse), 100)
          )
      );

      const { result } = renderHook(() => usePostIterations());

      act(() => {
        result.current.fetchVersions("post-1");
      });

      expect(result.current.isFetchingVersions).toBe(true);

      await waitFor(() => {
        expect(result.current.isFetchingVersions).toBe(false);
      });
    });

    it("should handle fetch error", async () => {
      const error = new Error("Failed to fetch");
      vi.mocked(iterationsApi.fetchVersions).mockRejectedValue(error);

      const { result } = renderHook(() => usePostIterations());

      await act(async () => {
        await result.current.fetchVersions("post-1");
      });

      expect(result.current.error).toBe("Failed to fetch");
      expect(result.current.versions).toEqual([]);
    });
  });

  describe("iterate", () => {
    it("should create iteration successfully", async () => {
      vi.mocked(iterationsApi.iteratePost).mockResolvedValue(
        mockIterateResponse
      );
      vi.mocked(iterationsApi.fetchVersions).mockResolvedValue({
        postId: "post-1",
        totalVersions: 2,
        versions: [mockVersion1, mockVersion2],
      });

      const { result } = renderHook(() => usePostIterations());

      let response: IterateResponse | null = null;
      await act(async () => {
        response = await result.current.iterate("post-1", {
          iterationPrompt: "Make it better",
        });
      });

      expect(iterationsApi.iteratePost).toHaveBeenCalledWith("post-1", {
        iterationPrompt: "Make it better",
      });
      expect(response).toEqual(mockIterateResponse);
      // Should have refreshed versions
      expect(iterationsApi.fetchVersions).toHaveBeenCalled();
    });

    it("should set loading state while iterating", async () => {
      vi.mocked(iterationsApi.iteratePost).mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve(mockIterateResponse), 100)
          )
      );
      vi.mocked(iterationsApi.fetchVersions).mockResolvedValue(
        mockVersionsResponse
      );

      const { result } = renderHook(() => usePostIterations());

      act(() => {
        result.current.iterate("post-1", { iterationPrompt: "Test" });
      });

      expect(result.current.isIterating).toBe(true);

      await waitFor(() => {
        expect(result.current.isIterating).toBe(false);
      });
    });

    it("should handle iteration error", async () => {
      const error = new Error("Rate limit exceeded");
      vi.mocked(iterationsApi.iteratePost).mockRejectedValue(error);

      const { result } = renderHook(() => usePostIterations());

      let response: IterateResponse | null = null;
      await act(async () => {
        response = await result.current.iterate("post-1", {
          iterationPrompt: "Test",
        });
      });

      expect(response).toBeNull();
      expect(result.current.error).toBe("Rate limit exceeded");
    });
  });

  describe("selectVersion", () => {
    it("should select version successfully", async () => {
      vi.mocked(iterationsApi.fetchVersions).mockResolvedValue(
        mockVersionsResponse
      );
      vi.mocked(iterationsApi.selectVersion).mockResolvedValue({
        ...mockVersion1,
        isSelected: true,
      });

      const { result } = renderHook(() => usePostIterations());

      // First fetch versions
      await act(async () => {
        await result.current.fetchVersions("post-1");
      });

      // Then select version 1
      await act(async () => {
        await result.current.selectVersion("post-1", "version-1");
      });

      expect(iterationsApi.selectVersion).toHaveBeenCalledWith(
        "post-1",
        "version-1"
      );

      // Should update local state optimistically
      const selectedVersion = result.current.versions.find(
        (v) => v.id === "version-1"
      );
      expect(selectedVersion?.isSelected).toBe(true);
    });

    it("should not select already selected version", async () => {
      vi.mocked(iterationsApi.fetchVersions).mockResolvedValue(
        mockVersionsResponse
      );

      const { result } = renderHook(() => usePostIterations());

      // First fetch versions (version-2 is selected)
      await act(async () => {
        await result.current.fetchVersions("post-1");
      });

      // Try to select already selected version
      await act(async () => {
        await result.current.selectVersion("post-1", "version-2");
      });

      // Should not call API
      expect(iterationsApi.selectVersion).not.toHaveBeenCalled();
    });

    it("should handle select error and refetch versions", async () => {
      vi.mocked(iterationsApi.fetchVersions).mockResolvedValue(
        mockVersionsResponse
      );
      const error = new Error("Failed to select");
      vi.mocked(iterationsApi.selectVersion).mockRejectedValue(error);

      const { result } = renderHook(() => usePostIterations());

      await act(async () => {
        await result.current.fetchVersions("post-1");
      });

      await act(async () => {
        await result.current.selectVersion("post-1", "version-1");
      });

      // Should have tried to refetch versions (twice: initial + after error)
      expect(iterationsApi.fetchVersions).toHaveBeenCalledTimes(2);
      // The select API should have been called
      expect(iterationsApi.selectVersion).toHaveBeenCalledWith(
        "post-1",
        "version-1"
      );
    });
  });

  describe("clearVersions", () => {
    it("should clear all version data", async () => {
      vi.mocked(iterationsApi.fetchVersions).mockResolvedValue(
        mockVersionsResponse
      );

      const { result } = renderHook(() => usePostIterations());

      await act(async () => {
        await result.current.fetchVersions("post-1");
      });

      expect(result.current.versions).toHaveLength(2);

      act(() => {
        result.current.clearVersions();
      });

      expect(result.current.versions).toEqual([]);
      expect(result.current.currentVersion).toBeNull();
      expect(result.current.error).toBeNull();
    });
  });

  describe("updateCurrentVersionContent", () => {
    it("should update content of selected version", async () => {
      vi.mocked(iterationsApi.fetchVersions).mockResolvedValue(
        mockVersionsResponse
      );

      const { result } = renderHook(() => usePostIterations());

      await act(async () => {
        await result.current.fetchVersions("post-1");
      });

      act(() => {
        result.current.updateCurrentVersionContent("Updated content");
      });

      expect(result.current.currentVersion?.generatedText).toBe(
        "Updated content"
      );
    });
  });
});
