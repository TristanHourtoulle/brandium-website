import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  formatPostPreview,
  highlightSearchTerm,
  getCharacterCountInfo,
  formatPostDate,
  copyToClipboard,
} from "@/lib/services/posts.service";

describe("Posts Service", () => {
  describe("formatPostPreview", () => {
    it("should return empty string for empty content", () => {
      expect(formatPostPreview("")).toBe("");
    });

    it("should return content as-is if shorter than maxLength", () => {
      const content = "Short content";
      expect(formatPostPreview(content, 150)).toBe(content);
    });

    it("should truncate content at word boundary", () => {
      const content = "This is a long text that needs to be truncated at a word boundary";
      const result = formatPostPreview(content, 30);
      expect(result).toContain("...");
      expect(result.length).toBeLessThanOrEqual(33); // 30 + "..."
    });

    it("should use default maxLength of 150", () => {
      const content = "A".repeat(200);
      const result = formatPostPreview(content);
      expect(result.length).toBeLessThanOrEqual(153);
    });
  });

  describe("highlightSearchTerm", () => {
    it("should return original text if no search term", () => {
      const result = highlightSearchTerm("Hello world", "");
      expect(result.parts).toEqual([{ text: "Hello world", highlighted: false }]);
    });

    it("should return original text if search term not found", () => {
      const result = highlightSearchTerm("Hello world", "xyz");
      expect(result.parts).toEqual([{ text: "Hello world", highlighted: false }]);
    });

    it("should highlight single occurrence", () => {
      const result = highlightSearchTerm("Hello world", "world");
      expect(result.parts).toEqual([
        { text: "Hello ", highlighted: false },
        { text: "world", highlighted: true },
      ]);
    });

    it("should highlight multiple occurrences", () => {
      const result = highlightSearchTerm("test test test", "test");
      expect(result.parts.filter(p => p.highlighted)).toHaveLength(3);
    });

    it("should be case insensitive", () => {
      const result = highlightSearchTerm("Hello World", "world");
      expect(result.parts.some(p => p.highlighted)).toBe(true);
    });
  });

  describe("getCharacterCountInfo", () => {
    it("should return count without maxLength", () => {
      const result = getCharacterCountInfo("Hello");
      expect(result).toEqual({
        count: 5,
        isOverLimit: false,
        status: "ok",
      });
    });

    it("should return ok status when under limit", () => {
      const result = getCharacterCountInfo("Hello", 100);
      expect(result.status).toBe("ok");
      expect(result.isOverLimit).toBe(false);
      expect(result.percentage).toBe(5);
    });

    it("should return warning status when approaching limit (90%+)", () => {
      const result = getCharacterCountInfo("A".repeat(95), 100);
      expect(result.status).toBe("warning");
      expect(result.isOverLimit).toBe(false);
    });

    it("should return error status when over limit", () => {
      const result = getCharacterCountInfo("A".repeat(110), 100);
      expect(result.status).toBe("error");
      expect(result.isOverLimit).toBe(true);
    });

    it("should handle empty content", () => {
      const result = getCharacterCountInfo("");
      expect(result.count).toBe(0);
    });
  });

  describe("formatPostDate", () => {
    it("should format today as 'Today at HH:MM'", () => {
      const now = new Date();
      const result = formatPostDate(now.toISOString());
      expect(result).toContain("Today at");
    });

    it("should format yesterday", () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const result = formatPostDate(yesterday.toISOString());
      expect(result).toContain("Yesterday at");
    });

    it("should format dates within last 7 days with weekday", () => {
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      const result = formatPostDate(threeDaysAgo.toISOString());
      // Should contain a weekday name
      expect(result).toMatch(/Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday/);
    });

    it("should format older dates with month and day", () => {
      const oldDate = new Date("2023-06-15");
      const result = formatPostDate(oldDate.toISOString());
      expect(result).toContain("Jun");
      expect(result).toContain("15");
    });
  });

  describe("copyToClipboard", () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it("should copy text using navigator.clipboard", async () => {
      const mockWriteText = vi.fn().mockResolvedValue(undefined);
      Object.assign(navigator, {
        clipboard: {
          writeText: mockWriteText,
        },
      });

      const result = await copyToClipboard("test text");

      expect(mockWriteText).toHaveBeenCalledWith("test text");
      expect(result).toBe(true);
    });

    it("should return false on clipboard error", async () => {
      const mockWriteText = vi.fn().mockRejectedValue(new Error("Clipboard error"));
      Object.assign(navigator, {
        clipboard: {
          writeText: mockWriteText,
        },
      });

      // Mock document.createElement to simulate fallback failure
      vi.spyOn(document, "createElement").mockImplementation(() => {
        throw new Error("Cannot create element");
      });

      const result = await copyToClipboard("test text");

      expect(result).toBe(false);

      vi.restoreAllMocks();
    });
  });
});
