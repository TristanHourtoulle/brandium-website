import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getPlatforms,
  getPlatform,
  createPlatform,
  updatePlatform,
  deletePlatform,
} from "@/lib/api/platforms";
import { apiClient } from "@/lib/api/client";
import type { Platform, CreatePlatformDto, UpdatePlatformDto } from "@/types";

// Mock the apiClient
vi.mock("@/lib/api/client", () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockPlatform: Platform = {
  id: "platform-1",
  userId: "user-1",
  name: "LinkedIn",
  styleGuidelines: "Professional tone, use hashtags sparingly, include a call-to-action",
  maxLength: 3000,
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
};

const mockPlatforms: Platform[] = [
  mockPlatform,
  {
    ...mockPlatform,
    id: "platform-2",
    name: "X (Twitter)",
    styleGuidelines: "Casual, witty, use emojis, keep it brief",
    maxLength: 280,
  },
];

describe("platforms API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getPlatforms", () => {
    it("should fetch all platforms", async () => {
      vi.mocked(apiClient.get).mockResolvedValue({
        count: mockPlatforms.length,
        data: mockPlatforms,
      });

      const result = await getPlatforms();

      expect(apiClient.get).toHaveBeenCalledWith("/api/platforms");
      expect(result).toEqual(mockPlatforms);
    });

    it("should return empty array when no platforms exist", async () => {
      vi.mocked(apiClient.get).mockResolvedValue({
        count: 0,
        data: [],
      });

      const result = await getPlatforms();

      expect(result).toEqual([]);
    });

    it("should throw error when API fails", async () => {
      const error = new Error("Network error");
      vi.mocked(apiClient.get).mockRejectedValue(error);

      await expect(getPlatforms()).rejects.toThrow("Network error");
    });

    it("should handle platforms without maxLength", async () => {
      const platformWithoutMaxLength = {
        ...mockPlatform,
        maxLength: undefined,
      };
      vi.mocked(apiClient.get).mockResolvedValue({
        count: 1,
        data: [platformWithoutMaxLength],
      });

      const result = await getPlatforms();

      expect(result[0].maxLength).toBeUndefined();
    });
  });

  describe("getPlatform", () => {
    it("should fetch a single platform by id", async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: mockPlatform });

      const result = await getPlatform("platform-1");

      expect(apiClient.get).toHaveBeenCalledWith("/api/platforms/platform-1");
      expect(result).toEqual(mockPlatform);
    });

    it("should throw error when platform not found", async () => {
      const error = { message: "Platform not found", statusCode: 404 };
      vi.mocked(apiClient.get).mockRejectedValue(error);

      await expect(getPlatform("invalid-id")).rejects.toEqual(error);
    });
  });

  describe("createPlatform", () => {
    it("should create a new platform with maxLength", async () => {
      const createData: CreatePlatformDto = {
        name: "Instagram",
        styleGuidelines: "Visual focus, use hashtags, engaging captions",
        maxLength: 2200,
      };

      const createdPlatform: Platform = {
        ...mockPlatform,
        id: "new-platform-id",
        ...createData,
      };

      vi.mocked(apiClient.post).mockResolvedValue({ data: createdPlatform });

      const result = await createPlatform(createData);

      expect(apiClient.post).toHaveBeenCalledWith("/api/platforms", createData);
      expect(result).toEqual(createdPlatform);
    });

    it("should create a new platform without maxLength", async () => {
      const createData: CreatePlatformDto = {
        name: "Blog",
        styleGuidelines: "Long-form content, in-depth analysis, SEO optimized",
      };

      const createdPlatform: Platform = {
        ...mockPlatform,
        id: "new-platform-id",
        name: createData.name,
        styleGuidelines: createData.styleGuidelines,
        maxLength: undefined,
      };

      vi.mocked(apiClient.post).mockResolvedValue({ data: createdPlatform });

      const result = await createPlatform(createData);

      expect(result.maxLength).toBeUndefined();
    });

    it("should throw error on validation failure", async () => {
      const createData: CreatePlatformDto = {
        name: "",
        styleGuidelines: "Short",
      };

      const error = { message: "Validation failed", statusCode: 400 };
      vi.mocked(apiClient.post).mockRejectedValue(error);

      await expect(createPlatform(createData)).rejects.toEqual(error);
    });
  });

  describe("updatePlatform", () => {
    it("should update an existing platform", async () => {
      const updateData: UpdatePlatformDto = {
        name: "Updated Platform Name",
        styleGuidelines: "Updated guidelines for the platform",
      };

      const updatedPlatform: Platform = {
        ...mockPlatform,
        ...updateData,
      };

      vi.mocked(apiClient.put).mockResolvedValue({ data: updatedPlatform });

      const result = await updatePlatform("platform-1", updateData);

      expect(apiClient.put).toHaveBeenCalledWith("/api/platforms/platform-1", updateData);
      expect(result).toEqual(updatedPlatform);
    });

    it("should allow partial updates", async () => {
      const updateData: UpdatePlatformDto = {
        maxLength: 500,
      };

      const updatedPlatform: Platform = {
        ...mockPlatform,
        maxLength: updateData.maxLength!,
      };

      vi.mocked(apiClient.put).mockResolvedValue({ data: updatedPlatform });

      const result = await updatePlatform("platform-1", updateData);

      expect(result.maxLength).toEqual(updateData.maxLength);
    });

    it("should throw error when platform not found", async () => {
      const error = { message: "Platform not found", statusCode: 404 };
      vi.mocked(apiClient.put).mockRejectedValue(error);

      await expect(
        updatePlatform("invalid-id", { name: "Test" })
      ).rejects.toEqual(error);
    });
  });

  describe("deletePlatform", () => {
    it("should delete a platform", async () => {
      vi.mocked(apiClient.delete).mockResolvedValue(undefined);

      await deletePlatform("platform-1");

      expect(apiClient.delete).toHaveBeenCalledWith("/api/platforms/platform-1");
    });

    it("should throw error when platform not found", async () => {
      const error = { message: "Platform not found", statusCode: 404 };
      vi.mocked(apiClient.delete).mockRejectedValue(error);

      await expect(deletePlatform("invalid-id")).rejects.toEqual(error);
    });

    it("should throw error when platform is in use", async () => {
      const error = {
        message: "Cannot delete platform that is in use",
        statusCode: 409,
      };
      vi.mocked(apiClient.delete).mockRejectedValue(error);

      await expect(deletePlatform("platform-in-use")).rejects.toEqual(error);
    });
  });
});
