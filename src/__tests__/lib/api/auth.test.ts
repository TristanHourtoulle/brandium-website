import { describe, it, expect, vi, beforeEach } from "vitest";
import { login, register, getCurrentUser, refreshToken } from "@/lib/api/auth";

describe("Auth API", () => {
  const mockFetch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = mockFetch;
    (window.localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue(null);
  });

  describe("login", () => {
    it("should call login endpoint with credentials", async () => {
      const mockResponse = {
        user: { id: "1", email: "test@example.com" },
        token: "test-token",
        message: "Login successful",
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      });

      const result = await login({
        email: "test@example.com",
        password: "password123",
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/auth/login"),
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({
            email: "test@example.com",
            password: "password123",
          }),
        })
      );

      expect(result).toEqual(mockResponse);
    });

    it("should throw on invalid credentials", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ message: "Invalid credentials" }),
      });

      await expect(
        login({ email: "test@example.com", password: "wrong" })
      ).rejects.toMatchObject({
        message: "Invalid credentials",
        statusCode: 401,
      });
    });
  });

  describe("register", () => {
    it("should call register endpoint with credentials", async () => {
      const mockResponse = {
        user: { id: "1", email: "new@example.com" },
        token: "new-token",
        message: "Registration successful",
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => mockResponse,
      });

      const result = await register({
        email: "new@example.com",
        password: "password123",
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/auth/register"),
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({
            email: "new@example.com",
            password: "password123",
          }),
        })
      );

      expect(result).toEqual(mockResponse);
    });

    it("should throw on duplicate email", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 409,
        json: async () => ({ message: "Email already exists" }),
      });

      await expect(
        register({ email: "existing@example.com", password: "password123" })
      ).rejects.toMatchObject({
        message: "Email already exists",
        statusCode: 409,
      });
    });
  });

  describe("getCurrentUser", () => {
    it("should call me endpoint with auth token", async () => {
      const mockUser = {
        id: "1",
        email: "test@example.com",
        createdAt: "2024-01-01",
        updatedAt: "2024-01-01",
      };

      (window.localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue("test-token");

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ user: mockUser }),
      });

      const result = await getCurrentUser();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/auth/me"),
        expect.objectContaining({
          method: "GET",
          headers: expect.objectContaining({
            Authorization: "Bearer test-token",
          }),
        })
      );

      expect(result).toEqual(mockUser);
    });

    it("should throw on unauthorized", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ message: "Unauthorized" }),
      });

      await expect(getCurrentUser()).rejects.toMatchObject({
        message: "Unauthorized",
        statusCode: 401,
      });
    });
  });

  describe("refreshToken", () => {
    it("should call refresh endpoint and return new tokens", async () => {
      const mockTokens = {
        accessToken: "new-access-token",
        refreshToken: "new-refresh-token",
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockTokens,
      });

      const result = await refreshToken();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/auth/refresh"),
        expect.objectContaining({
          method: "POST",
        })
      );

      expect(result).toEqual(mockTokens);
    });

    it("should throw on invalid refresh token", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ message: "Invalid refresh token" }),
      });

      await expect(refreshToken()).rejects.toMatchObject({
        message: "Invalid refresh token",
        statusCode: 401,
      });
    });
  });
});
