import { describe, it, expect } from "vitest";
import { platformSchema } from "@/lib/utils/validation";

describe("platformSchema", () => {
  const validPlatform = {
    name: "LinkedIn",
    styleGuidelines: "Professional tone, use hashtags sparingly, include a call-to-action",
    maxLength: 3000,
  };

  describe("name validation", () => {
    it("should accept a valid name", () => {
      const result = platformSchema.safeParse(validPlatform);
      expect(result.success).toBe(true);
    });

    it("should reject an empty name", () => {
      const result = platformSchema.safeParse({
        ...validPlatform,
        name: "",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Platform name is required");
      }
    });

    it("should reject a name longer than 50 characters", () => {
      const result = platformSchema.safeParse({
        ...validPlatform,
        name: "a".repeat(51),
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "Name must be less than 50 characters"
        );
      }
    });

    it("should accept a name with exactly 50 characters", () => {
      const result = platformSchema.safeParse({
        ...validPlatform,
        name: "a".repeat(50),
      });
      expect(result.success).toBe(true);
    });
  });

  describe("styleGuidelines validation", () => {
    it("should accept valid styleGuidelines", () => {
      const result = platformSchema.safeParse(validPlatform);
      expect(result.success).toBe(true);
    });

    it("should reject styleGuidelines shorter than 10 characters", () => {
      const result = platformSchema.safeParse({
        ...validPlatform,
        styleGuidelines: "Too short",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "Style guidelines must be at least 10 characters"
        );
      }
    });

    it("should accept styleGuidelines with exactly 10 characters", () => {
      const result = platformSchema.safeParse({
        ...validPlatform,
        styleGuidelines: "a".repeat(10),
      });
      expect(result.success).toBe(true);
    });

    it("should reject styleGuidelines longer than 1000 characters", () => {
      const result = platformSchema.safeParse({
        ...validPlatform,
        styleGuidelines: "a".repeat(1001),
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "Style guidelines must be less than 1000 characters"
        );
      }
    });

    it("should accept styleGuidelines with exactly 1000 characters", () => {
      const result = platformSchema.safeParse({
        ...validPlatform,
        styleGuidelines: "a".repeat(1000),
      });
      expect(result.success).toBe(true);
    });
  });

  describe("maxLength validation", () => {
    it("should accept a valid maxLength", () => {
      const result = platformSchema.safeParse(validPlatform);
      expect(result.success).toBe(true);
    });

    it("should accept undefined maxLength", () => {
      const result = platformSchema.safeParse({
        ...validPlatform,
        maxLength: undefined,
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.maxLength).toBeUndefined();
      }
    });

    it("should transform null maxLength to undefined", () => {
      const result = platformSchema.safeParse({
        ...validPlatform,
        maxLength: null,
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.maxLength).toBeUndefined();
      }
    });

    it("should reject negative maxLength", () => {
      const result = platformSchema.safeParse({
        ...validPlatform,
        maxLength: -1,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Max length must be positive");
      }
    });

    it("should reject zero maxLength", () => {
      const result = platformSchema.safeParse({
        ...validPlatform,
        maxLength: 0,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Max length must be positive");
      }
    });

    it("should reject maxLength greater than 10000", () => {
      const result = platformSchema.safeParse({
        ...validPlatform,
        maxLength: 10001,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Max length cannot exceed 10000");
      }
    });

    it("should accept maxLength of exactly 10000", () => {
      const result = platformSchema.safeParse({
        ...validPlatform,
        maxLength: 10000,
      });
      expect(result.success).toBe(true);
    });

    it("should reject non-integer maxLength", () => {
      const result = platformSchema.safeParse({
        ...validPlatform,
        maxLength: 280.5,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Max length must be a whole number");
      }
    });

    it("should accept platform without maxLength field", () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { maxLength: _maxLength, ...platformWithoutMaxLength } = validPlatform;
      const result = platformSchema.safeParse(platformWithoutMaxLength);
      expect(result.success).toBe(true);
    });
  });

  describe("full platform validation", () => {
    it("should accept a complete valid platform", () => {
      const result = platformSchema.safeParse(validPlatform);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe(validPlatform.name);
        expect(result.data.styleGuidelines).toBe(validPlatform.styleGuidelines);
        expect(result.data.maxLength).toBe(validPlatform.maxLength);
      }
    });

    it("should accept a platform without optional maxLength", () => {
      const result = platformSchema.safeParse({
        name: "Blog",
        styleGuidelines: "Long-form content with detailed explanations",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.maxLength).toBeUndefined();
      }
    });

    it("should reject a platform with multiple errors", () => {
      const result = platformSchema.safeParse({
        name: "",
        styleGuidelines: "Short",
        maxLength: -1,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.length).toBeGreaterThanOrEqual(3);
      }
    });
  });
});
