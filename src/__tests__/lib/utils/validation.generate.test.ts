import { describe, it, expect } from "vitest";
import { generateRequestSchema } from "@/lib/utils/validation";

describe("generateRequestSchema", () => {
  describe("profileId validation", () => {
    it("accepts valid UUID", () => {
      const result = generateRequestSchema.safeParse({
        profileId: "123e4567-e89b-12d3-a456-426614174000",
        rawIdea: "This is a valid idea for content generation",
      });
      expect(result.success).toBe(true);
    });

    it("rejects invalid UUID", () => {
      const result = generateRequestSchema.safeParse({
        profileId: "not-a-uuid",
        rawIdea: "This is a valid idea for content generation",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe("Invalid profile ID");
      }
    });

    it("rejects empty profileId", () => {
      const result = generateRequestSchema.safeParse({
        profileId: "",
        rawIdea: "This is a valid idea for content generation",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("projectId validation (optional)", () => {
    it("accepts valid UUID", () => {
      const result = generateRequestSchema.safeParse({
        profileId: "123e4567-e89b-12d3-a456-426614174000",
        projectId: "223e4567-e89b-12d3-a456-426614174000",
        rawIdea: "This is a valid idea for content generation",
      });
      expect(result.success).toBe(true);
    });

    it("accepts undefined projectId", () => {
      const result = generateRequestSchema.safeParse({
        profileId: "123e4567-e89b-12d3-a456-426614174000",
        rawIdea: "This is a valid idea for content generation",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.projectId).toBeUndefined();
      }
    });

    it("rejects invalid UUID", () => {
      const result = generateRequestSchema.safeParse({
        profileId: "123e4567-e89b-12d3-a456-426614174000",
        projectId: "invalid",
        rawIdea: "This is a valid idea for content generation",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("platformId validation (optional)", () => {
    it("accepts valid UUID", () => {
      const result = generateRequestSchema.safeParse({
        profileId: "123e4567-e89b-12d3-a456-426614174000",
        platformId: "323e4567-e89b-12d3-a456-426614174000",
        rawIdea: "This is a valid idea for content generation",
      });
      expect(result.success).toBe(true);
    });

    it("accepts undefined platformId", () => {
      const result = generateRequestSchema.safeParse({
        profileId: "123e4567-e89b-12d3-a456-426614174000",
        rawIdea: "This is a valid idea for content generation",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.platformId).toBeUndefined();
      }
    });
  });

  describe("goal validation (optional)", () => {
    it("accepts valid goal", () => {
      const result = generateRequestSchema.safeParse({
        profileId: "123e4567-e89b-12d3-a456-426614174000",
        goal: "Drive traffic to my blog",
        rawIdea: "This is a valid idea for content generation",
      });
      expect(result.success).toBe(true);
    });

    it("accepts empty goal and transforms to undefined", () => {
      const result = generateRequestSchema.safeParse({
        profileId: "123e4567-e89b-12d3-a456-426614174000",
        goal: "",
        rawIdea: "This is a valid idea for content generation",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.goal).toBeUndefined();
      }
    });

    it("accepts undefined goal", () => {
      const result = generateRequestSchema.safeParse({
        profileId: "123e4567-e89b-12d3-a456-426614174000",
        rawIdea: "This is a valid idea for content generation",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.goal).toBeUndefined();
      }
    });

    it("rejects goal over 200 characters", () => {
      const result = generateRequestSchema.safeParse({
        profileId: "123e4567-e89b-12d3-a456-426614174000",
        goal: "a".repeat(201),
        rawIdea: "This is a valid idea for content generation",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe(
          "Goal must be less than 200 characters"
        );
      }
    });

    it("accepts goal at exactly 200 characters", () => {
      const result = generateRequestSchema.safeParse({
        profileId: "123e4567-e89b-12d3-a456-426614174000",
        goal: "a".repeat(200),
        rawIdea: "This is a valid idea for content generation",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("rawIdea validation", () => {
    it("accepts valid rawIdea", () => {
      const result = generateRequestSchema.safeParse({
        profileId: "123e4567-e89b-12d3-a456-426614174000",
        rawIdea: "This is a valid idea for content generation",
      });
      expect(result.success).toBe(true);
    });

    it("rejects rawIdea under 10 characters", () => {
      const result = generateRequestSchema.safeParse({
        profileId: "123e4567-e89b-12d3-a456-426614174000",
        rawIdea: "Too short",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe(
          "Your idea must be at least 10 characters"
        );
      }
    });

    it("accepts rawIdea at exactly 10 characters", () => {
      const result = generateRequestSchema.safeParse({
        profileId: "123e4567-e89b-12d3-a456-426614174000",
        rawIdea: "1234567890",
      });
      expect(result.success).toBe(true);
    });

    it("rejects rawIdea over 2000 characters", () => {
      const result = generateRequestSchema.safeParse({
        profileId: "123e4567-e89b-12d3-a456-426614174000",
        rawIdea: "a".repeat(2001),
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe(
          "Your idea must be less than 2000 characters"
        );
      }
    });

    it("accepts rawIdea at exactly 2000 characters", () => {
      const result = generateRequestSchema.safeParse({
        profileId: "123e4567-e89b-12d3-a456-426614174000",
        rawIdea: "a".repeat(2000),
      });
      expect(result.success).toBe(true);
    });

    it("rejects missing rawIdea", () => {
      const result = generateRequestSchema.safeParse({
        profileId: "123e4567-e89b-12d3-a456-426614174000",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("full request validation", () => {
    it("accepts complete valid request", () => {
      const result = generateRequestSchema.safeParse({
        profileId: "123e4567-e89b-12d3-a456-426614174000",
        projectId: "223e4567-e89b-12d3-a456-426614174000",
        platformId: "323e4567-e89b-12d3-a456-426614174000",
        goal: "Increase engagement",
        rawIdea: "Share my thoughts about the latest tech trends in AI",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({
          profileId: "123e4567-e89b-12d3-a456-426614174000",
          projectId: "223e4567-e89b-12d3-a456-426614174000",
          platformId: "323e4567-e89b-12d3-a456-426614174000",
          goal: "Increase engagement",
          rawIdea: "Share my thoughts about the latest tech trends in AI",
        });
      }
    });

    it("accepts minimal valid request", () => {
      const result = generateRequestSchema.safeParse({
        profileId: "123e4567-e89b-12d3-a456-426614174000",
        rawIdea: "My minimal idea for a post",
      });
      expect(result.success).toBe(true);
    });

    it("rejects request missing required fields", () => {
      const result = generateRequestSchema.safeParse({
        goal: "Some goal",
      });
      expect(result.success).toBe(false);
    });
  });
});
