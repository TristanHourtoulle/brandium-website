import { describe, it, expect, vi, beforeEach } from "vitest";
import { ApiClient } from "@/lib/api/client";

describe("ApiClient", () => {
  let client: ApiClient;
  const mockFetch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = mockFetch;
    client = new ApiClient("http://localhost:3001");
    (window.localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue(null);
  });

  describe("get", () => {
    it("should make GET request with correct headers", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ data: "test" }),
      });

      await client.get("/test");

      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:3001/test",
        expect.objectContaining({
          method: "GET",
          headers: expect.objectContaining({
            "Content-Type": "application/json",
          }),
        })
      );
    });

    it("should include auth token when available", async () => {
      (window.localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue("test-token");

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ data: "test" }),
      });

      await client.get("/test");

      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:3001/test",
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: "Bearer test-token",
          }),
        })
      );
    });

    it("should return parsed JSON response", async () => {
      const expectedData = { id: 1, name: "Test" };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => expectedData,
      });

      const result = await client.get("/test");
      expect(result).toEqual(expectedData);
    });

    it("should throw error on non-ok response", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ message: "Unauthorized" }),
      });

      await expect(client.get("/test")).rejects.toMatchObject({
        message: "Unauthorized",
        statusCode: 401,
      });
    });
  });

  describe("post", () => {
    it("should make POST request with body", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ success: true }),
      });

      const body = { email: "test@example.com" };
      await client.post("/test", body);

      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:3001/test",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify(body),
        })
      );
    });

    it("should handle POST without body", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ success: true }),
      });

      await client.post("/test");

      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:3001/test",
        expect.objectContaining({
          method: "POST",
          body: undefined,
        })
      );
    });
  });

  describe("put", () => {
    it("should make PUT request with body", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ success: true }),
      });

      const body = { name: "Updated" };
      await client.put("/test/1", body);

      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:3001/test/1",
        expect.objectContaining({
          method: "PUT",
          body: JSON.stringify(body),
        })
      );
    });
  });

  describe("delete", () => {
    it("should make DELETE request", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204,
      });

      await client.delete("/test/1");

      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:3001/test/1",
        expect.objectContaining({
          method: "DELETE",
        })
      );
    });

    it("should handle 204 No Content response", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204,
      });

      const result = await client.delete("/test/1");
      expect(result).toEqual({});
    });
  });

  describe("error handling", () => {
    it("should handle network errors", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      await expect(client.get("/test")).rejects.toThrow("Network error");
    });

    it("should handle JSON parse error in error response", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => {
          throw new Error("Not JSON");
        },
      });

      await expect(client.get("/test")).rejects.toMatchObject({
        message: "An error occurred",
        statusCode: 500,
      });
    });

    it("should include validation errors from API", async () => {
      const errorResponse = {
        message: "Validation failed",
        errors: { email: ["Invalid email format"] },
      };
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => errorResponse,
      });

      await expect(client.get("/test")).rejects.toMatchObject({
        message: "Validation failed",
        statusCode: 400,
        errors: { email: ["Invalid email format"] },
      });
    });
  });
});
