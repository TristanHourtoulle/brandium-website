import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getProfiles,
  getProfile,
  createProfile,
  updateProfile,
  deleteProfile,
} from "@/lib/api/profiles";
import { apiClient } from "@/lib/api/client";
import type { Profile, CreateProfileDto, UpdateProfileDto } from "@/types";

// Mock the apiClient
vi.mock("@/lib/api/client", () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockProfile: Profile = {
  id: "profile-1",
  userId: "user-1",
  name: "Professional LinkedIn",
  bio: "A professional tone for LinkedIn posts",
  tone: ["professional", "friendly"],
  doRules: ["Use emojis sparingly", "Be concise"],
  dontRules: ["Avoid jargon", "Don't be too casual"],
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
};

const mockProfiles: Profile[] = [
  mockProfile,
  {
    ...mockProfile,
    id: "profile-2",
    name: "Casual Twitter",
    tone: ["casual", "humorous"],
  },
];

describe("profiles API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getProfiles", () => {
    it("should fetch all profiles", async () => {
      vi.mocked(apiClient.get).mockResolvedValue({
        count: mockProfiles.length,
        data: mockProfiles,
      });

      const result = await getProfiles();

      expect(apiClient.get).toHaveBeenCalledWith("/api/profiles");
      expect(result).toEqual(mockProfiles);
    });

    it("should normalize toneTags to tone", async () => {
      const backendProfiles = [
        {
          ...mockProfile,
          tone: undefined,
          toneTags: ["professional", "friendly"],
        },
      ];
      vi.mocked(apiClient.get).mockResolvedValue({
        count: 1,
        data: backendProfiles,
      });

      const result = await getProfiles();

      expect(result[0].tone).toEqual(["professional", "friendly"]);
    });

    it("should return empty array when no profiles exist", async () => {
      vi.mocked(apiClient.get).mockResolvedValue({
        count: 0,
        data: [],
      });

      const result = await getProfiles();

      expect(result).toEqual([]);
    });

    it("should throw error when API fails", async () => {
      const error = new Error("Network error");
      vi.mocked(apiClient.get).mockRejectedValue(error);

      await expect(getProfiles()).rejects.toThrow("Network error");
    });
  });

  describe("getProfile", () => {
    it("should fetch a single profile by id", async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: mockProfile });

      const result = await getProfile("profile-1");

      expect(apiClient.get).toHaveBeenCalledWith("/api/profiles/profile-1");
      expect(result).toEqual(mockProfile);
    });

    it("should normalize toneTags to tone", async () => {
      const backendProfile = {
        ...mockProfile,
        tone: undefined,
        toneTags: ["casual"],
      };
      vi.mocked(apiClient.get).mockResolvedValue({ data: backendProfile });

      const result = await getProfile("profile-1");

      expect(result.tone).toEqual(["casual"]);
    });

    it("should throw error when profile not found", async () => {
      const error = { message: "Profile not found", statusCode: 404 };
      vi.mocked(apiClient.get).mockRejectedValue(error);

      await expect(getProfile("invalid-id")).rejects.toEqual(error);
    });
  });

  describe("createProfile", () => {
    it("should create a new profile", async () => {
      const createData: CreateProfileDto = {
        name: "New Profile",
        bio: "A brand new profile for testing",
        tone: ["professional"],
        doRules: ["Rule 1"],
        dontRules: ["Don't rule 1"],
      };

      const createdProfile: Profile = {
        ...mockProfile,
        id: "new-profile-id",
        ...createData,
      };

      vi.mocked(apiClient.post).mockResolvedValue({ data: createdProfile });

      const result = await createProfile(createData);

      expect(apiClient.post).toHaveBeenCalledWith("/api/profiles", {
        ...createData,
        toneTags: createData.tone,
      });
      expect(result).toEqual(createdProfile);
    });

    it("should throw error on validation failure", async () => {
      const createData: CreateProfileDto = {
        name: "",
        bio: "Short",
        tone: [],
        doRules: [],
        dontRules: [],
      };

      const error = { message: "Validation failed", statusCode: 400 };
      vi.mocked(apiClient.post).mockRejectedValue(error);

      await expect(createProfile(createData)).rejects.toEqual(error);
    });
  });

  describe("updateProfile", () => {
    it("should update an existing profile", async () => {
      const updateData: UpdateProfileDto = {
        name: "Updated Profile Name",
        bio: "Updated bio for the profile",
      };

      const updatedProfile: Profile = {
        ...mockProfile,
        ...updateData,
      };

      vi.mocked(apiClient.put).mockResolvedValue({ data: updatedProfile });

      const result = await updateProfile("profile-1", updateData);

      expect(apiClient.put).toHaveBeenCalledWith("/api/profiles/profile-1", {
        ...updateData,
        toneTags: updateData.tone,
      });
      expect(result).toEqual(updatedProfile);
    });

    it("should allow partial updates", async () => {
      const updateData: UpdateProfileDto = {
        tone: ["casual", "friendly", "humorous"],
      };

      const updatedProfile: Profile = {
        ...mockProfile,
        tone: updateData.tone!,
      };

      vi.mocked(apiClient.put).mockResolvedValue({ data: updatedProfile });

      const result = await updateProfile("profile-1", updateData);

      expect(result.tone).toEqual(updateData.tone);
    });

    it("should throw error when profile not found", async () => {
      const error = { message: "Profile not found", statusCode: 404 };
      vi.mocked(apiClient.put).mockRejectedValue(error);

      await expect(
        updateProfile("invalid-id", { name: "Test" })
      ).rejects.toEqual(error);
    });
  });

  describe("deleteProfile", () => {
    it("should delete a profile", async () => {
      vi.mocked(apiClient.delete).mockResolvedValue(undefined);

      await deleteProfile("profile-1");

      expect(apiClient.delete).toHaveBeenCalledWith("/api/profiles/profile-1");
    });

    it("should throw error when profile not found", async () => {
      const error = { message: "Profile not found", statusCode: 404 };
      vi.mocked(apiClient.delete).mockRejectedValue(error);

      await expect(deleteProfile("invalid-id")).rejects.toEqual(error);
    });

    it("should throw error when profile is in use", async () => {
      const error = {
        message: "Cannot delete profile that is in use",
        statusCode: 409,
      };
      vi.mocked(apiClient.delete).mockRejectedValue(error);

      await expect(deleteProfile("profile-in-use")).rejects.toEqual(error);
    });
  });
});
