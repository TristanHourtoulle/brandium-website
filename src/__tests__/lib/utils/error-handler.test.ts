import { describe, it, expect } from "vitest";
import {
  isApiError,
  getErrorMessage,
  getStatusCodeMessage,
  formatApiError,
  withRetry,
  safeJsonParse,
} from "@/lib/utils/error-handler";

describe("Error Handler", () => {
  describe("isApiError", () => {
    it("should return true for valid ApiError", () => {
      const error = { message: "Error", statusCode: 400 };
      expect(isApiError(error)).toBe(true);
    });

    it("should return false for regular Error", () => {
      const error = new Error("Regular error");
      expect(isApiError(error)).toBe(false);
    });

    it("should return false for null", () => {
      expect(isApiError(null)).toBe(false);
    });

    it("should return false for string", () => {
      expect(isApiError("error")).toBe(false);
    });
  });

  describe("getErrorMessage", () => {
    it("should extract message from ApiError", () => {
      const error = { message: "API Error", statusCode: 400 };
      expect(getErrorMessage(error)).toBe("API Error");
    });

    it("should extract message from Error", () => {
      const error = new Error("Standard error");
      expect(getErrorMessage(error)).toBe("Standard error");
    });

    it("should return string as-is", () => {
      expect(getErrorMessage("String error")).toBe("String error");
    });

    it("should return default message for unknown error", () => {
      expect(getErrorMessage(undefined)).toBe("An unexpected error occurred. Please try again.");
    });

    it("should handle network error", () => {
      const error = new Error("Failed to fetch");
      expect(getErrorMessage(error)).toBe("Network error. Please check your internet connection.");
    });
  });

  describe("getStatusCodeMessage", () => {
    it("should return message for 400", () => {
      expect(getStatusCodeMessage(400)).toBe("Bad request. Please check your input.");
    });

    it("should return message for 401", () => {
      expect(getStatusCodeMessage(401)).toBe("Please sign in to continue.");
    });

    it("should return message for 404", () => {
      expect(getStatusCodeMessage(404)).toBe("The requested resource was not found.");
    });

    it("should return message for 500", () => {
      expect(getStatusCodeMessage(500)).toBe("Server error. Please try again later.");
    });

    it("should return default message for unknown status code", () => {
      expect(getStatusCodeMessage(999)).toBe("An unexpected error occurred.");
    });
  });

  describe("formatApiError", () => {
    it("should format ApiError correctly", () => {
      const error = { message: "Detailed error message", statusCode: 400 };
      const result = formatApiError(error);
      expect(result.title).toBe("Bad request. Please check your input.");
      expect(result.description).toBe("Detailed error message");
      expect(result.statusCode).toBe(400);
    });

    it("should handle non-ApiError", () => {
      const error = new Error("Regular error");
      const result = formatApiError(error);
      expect(result.title).toBe("Regular error");
      expect(result.description).toBe("");
    });
  });

  describe("withRetry", () => {
    it("should return result on first success", async () => {
      const fn = async () => "success";
      const result = await withRetry(fn);
      expect(result).toBe("success");
    });

    it("should retry on failure", async () => {
      let attempts = 0;
      const fn = async () => {
        attempts++;
        if (attempts < 2) {
          throw new Error("Failed to fetch");
        }
        return "success";
      };

      const result = await withRetry(fn, { maxAttempts: 3, delayMs: 10 });
      expect(result).toBe("success");
      expect(attempts).toBe(2);
    });

    it("should throw after max attempts", async () => {
      const fn = async () => {
        throw new Error("Failed to fetch");
      };

      await expect(withRetry(fn, { maxAttempts: 2, delayMs: 10 })).rejects.toThrow("Failed to fetch");
    });

    it("should not retry if shouldRetry returns false", async () => {
      let attempts = 0;
      const fn = async () => {
        attempts++;
        throw { message: "Client error", statusCode: 400 };
      };

      await expect(
        withRetry(fn, {
          maxAttempts: 3,
          delayMs: 10,
          shouldRetry: (error) => {
            if (typeof error === "object" && error !== null && "statusCode" in error) {
              return (error as { statusCode: number }).statusCode >= 500;
            }
            return false;
          },
        })
      ).rejects.toEqual({ message: "Client error", statusCode: 400 });

      expect(attempts).toBe(1);
    });
  });

  describe("safeJsonParse", () => {
    it("should parse valid JSON", () => {
      const result = safeJsonParse('{"key": "value"}', {});
      expect(result).toEqual({ key: "value" });
    });

    it("should return fallback for invalid JSON", () => {
      const fallback = { default: true };
      const result = safeJsonParse("invalid json", fallback);
      expect(result).toEqual(fallback);
    });

    it("should parse arrays", () => {
      const result = safeJsonParse("[1, 2, 3]", []);
      expect(result).toEqual([1, 2, 3]);
    });
  });
});
