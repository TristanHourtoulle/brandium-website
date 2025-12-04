import { describe, it, expect } from "vitest";
import { projectSchema } from "@/lib/utils/validation";

describe("projectSchema", () => {
  const validProject = {
    name: "Product Launch 2024",
    description: "Launch campaign for our new product line targeting tech professionals",
    audience: "Tech professionals aged 25-45",
    keyMessages: ["Innovative solution", "Save 5 hours per week"],
  };

  describe("name validation", () => {
    it("should accept a valid name", () => {
      const result = projectSchema.safeParse(validProject);
      expect(result.success).toBe(true);
    });

    it("should reject an empty name", () => {
      const result = projectSchema.safeParse({
        ...validProject,
        name: "",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Name is required");
      }
    });

    it("should reject a name longer than 100 characters", () => {
      const result = projectSchema.safeParse({
        ...validProject,
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
      const result = projectSchema.safeParse({
        ...validProject,
        name: "a".repeat(100),
      });
      expect(result.success).toBe(true);
    });
  });

  describe("description validation", () => {
    it("should accept a valid description", () => {
      const result = projectSchema.safeParse(validProject);
      expect(result.success).toBe(true);
    });

    it("should reject a description shorter than 10 characters", () => {
      const result = projectSchema.safeParse({
        ...validProject,
        description: "Too short",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "Description must be at least 10 characters"
        );
      }
    });

    it("should accept a description with exactly 10 characters", () => {
      const result = projectSchema.safeParse({
        ...validProject,
        description: "a".repeat(10),
      });
      expect(result.success).toBe(true);
    });

    it("should reject a description longer than 500 characters", () => {
      const result = projectSchema.safeParse({
        ...validProject,
        description: "a".repeat(501),
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "Description must be less than 500 characters"
        );
      }
    });

    it("should accept a description with exactly 500 characters", () => {
      const result = projectSchema.safeParse({
        ...validProject,
        description: "a".repeat(500),
      });
      expect(result.success).toBe(true);
    });
  });

  describe("audience validation", () => {
    it("should accept a valid audience", () => {
      const result = projectSchema.safeParse(validProject);
      expect(result.success).toBe(true);
    });

    it("should reject an empty audience", () => {
      const result = projectSchema.safeParse({
        ...validProject,
        audience: "",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Target audience is required");
      }
    });

    it("should reject an audience longer than 200 characters", () => {
      const result = projectSchema.safeParse({
        ...validProject,
        audience: "a".repeat(201),
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "Audience must be less than 200 characters"
        );
      }
    });

    it("should accept an audience with exactly 200 characters", () => {
      const result = projectSchema.safeParse({
        ...validProject,
        audience: "a".repeat(200),
      });
      expect(result.success).toBe(true);
    });
  });

  describe("keyMessages validation", () => {
    it("should accept a valid keyMessages array", () => {
      const result = projectSchema.safeParse(validProject);
      expect(result.success).toBe(true);
    });

    it("should reject an empty keyMessages array", () => {
      const result = projectSchema.safeParse({
        ...validProject,
        keyMessages: [],
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "At least one key message is required"
        );
      }
    });

    it("should accept up to 10 key messages", () => {
      const result = projectSchema.safeParse({
        ...validProject,
        keyMessages: Array(10).fill("Message"),
      });
      expect(result.success).toBe(true);
    });

    it("should reject more than 10 key messages", () => {
      const result = projectSchema.safeParse({
        ...validProject,
        keyMessages: Array(11).fill("Message"),
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Maximum 10 key messages allowed");
      }
    });

    it("should reject empty strings in keyMessages", () => {
      const result = projectSchema.safeParse({
        ...validProject,
        keyMessages: ["Valid message", ""],
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Message cannot be empty");
      }
    });

    it("should accept a single key message", () => {
      const result = projectSchema.safeParse({
        ...validProject,
        keyMessages: ["Single message"],
      });
      expect(result.success).toBe(true);
    });
  });

  describe("full project validation", () => {
    it("should accept a complete valid project", () => {
      const result = projectSchema.safeParse(validProject);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validProject);
      }
    });

    it("should reject a project with multiple errors", () => {
      const result = projectSchema.safeParse({
        name: "",
        description: "Short",
        audience: "",
        keyMessages: [],
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.length).toBeGreaterThanOrEqual(4);
      }
    });
  });
});
