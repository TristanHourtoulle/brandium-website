import { describe, it, expect } from "vitest";
import { profileSchema } from "@/lib/utils/validation";

describe("profileSchema", () => {
  const validProfile = {
    name: "Professional LinkedIn",
    bio: "A professional tone for LinkedIn posts that helps build my brand.",
    tone: ["professional", "friendly"],
    doRules: ["Use emojis sparingly"],
    dontRules: ["Avoid jargon"],
  };

  describe("name validation", () => {
    it("should accept a valid name", () => {
      const result = profileSchema.safeParse(validProfile);
      expect(result.success).toBe(true);
    });

    it("should reject an empty name", () => {
      const result = profileSchema.safeParse({
        ...validProfile,
        name: "",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Name is required");
      }
    });

    it("should reject a name longer than 100 characters", () => {
      const result = profileSchema.safeParse({
        ...validProfile,
        name: "a".repeat(101),
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "Name must be less than 100 characters"
        );
      }
    });

    it("should accept a name with exactly 100 characters", () => {
      const result = profileSchema.safeParse({
        ...validProfile,
        name: "a".repeat(100),
      });
      expect(result.success).toBe(true);
    });
  });

  describe("bio validation", () => {
    it("should accept a valid bio", () => {
      const result = profileSchema.safeParse(validProfile);
      expect(result.success).toBe(true);
    });

    it("should reject a bio shorter than 10 characters", () => {
      const result = profileSchema.safeParse({
        ...validProfile,
        bio: "Too short",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "Bio must be at least 10 characters"
        );
      }
    });

    it("should accept a bio with exactly 10 characters", () => {
      const result = profileSchema.safeParse({
        ...validProfile,
        bio: "a".repeat(10),
      });
      expect(result.success).toBe(true);
    });

    it("should reject a bio longer than 500 characters", () => {
      const result = profileSchema.safeParse({
        ...validProfile,
        bio: "a".repeat(501),
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "Bio must be less than 500 characters"
        );
      }
    });

    it("should accept a bio with exactly 500 characters", () => {
      const result = profileSchema.safeParse({
        ...validProfile,
        bio: "a".repeat(500),
      });
      expect(result.success).toBe(true);
    });
  });

  describe("tone validation", () => {
    it("should accept a valid tone array", () => {
      const result = profileSchema.safeParse(validProfile);
      expect(result.success).toBe(true);
    });

    it("should reject an empty tone array", () => {
      const result = profileSchema.safeParse({
        ...validProfile,
        tone: [],
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Select at least one tone");
      }
    });

    it("should accept up to 5 tones", () => {
      const result = profileSchema.safeParse({
        ...validProfile,
        tone: ["professional", "friendly", "casual", "authoritative", "humorous"],
      });
      expect(result.success).toBe(true);
    });

    it("should reject more than 5 tones", () => {
      const result = profileSchema.safeParse({
        ...validProfile,
        tone: [
          "professional",
          "friendly",
          "casual",
          "authoritative",
          "humorous",
          "inspirational",
        ],
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Maximum 5 tones allowed");
      }
    });

    it("should accept a single tone", () => {
      const result = profileSchema.safeParse({
        ...validProfile,
        tone: ["professional"],
      });
      expect(result.success).toBe(true);
    });
  });

  describe("doRules validation", () => {
    it("should accept an empty doRules array", () => {
      const result = profileSchema.safeParse({
        ...validProfile,
        doRules: [],
      });
      expect(result.success).toBe(true);
    });

    it("should accept multiple doRules", () => {
      const result = profileSchema.safeParse({
        ...validProfile,
        doRules: ["Rule 1", "Rule 2", "Rule 3"],
      });
      expect(result.success).toBe(true);
    });

    it("should default to empty array if not provided", () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { doRules: _doRules, ...profileWithoutDoRules } = validProfile;
      const result = profileSchema.safeParse(profileWithoutDoRules);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.doRules).toEqual([]);
      }
    });
  });

  describe("dontRules validation", () => {
    it("should accept an empty dontRules array", () => {
      const result = profileSchema.safeParse({
        ...validProfile,
        dontRules: [],
      });
      expect(result.success).toBe(true);
    });

    it("should accept multiple dontRules", () => {
      const result = profileSchema.safeParse({
        ...validProfile,
        dontRules: ["Don't do 1", "Don't do 2", "Don't do 3"],
      });
      expect(result.success).toBe(true);
    });

    it("should default to empty array if not provided", () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { dontRules: _dontRules, ...profileWithoutDontRules } = validProfile;
      const result = profileSchema.safeParse(profileWithoutDontRules);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.dontRules).toEqual([]);
      }
    });
  });

  describe("full profile validation", () => {
    it("should accept a complete valid profile", () => {
      const result = profileSchema.safeParse(validProfile);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validProfile);
      }
    });

    it("should reject a profile with multiple errors", () => {
      const result = profileSchema.safeParse({
        name: "",
        bio: "Short",
        tone: [],
        doRules: [],
        dontRules: [],
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.length).toBeGreaterThanOrEqual(3);
      }
    });
  });
});
