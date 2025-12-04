import { describe, it, expect, vi, beforeEach } from "vitest";
import { toast as sonnerToast } from "sonner";
import {
  showSuccess,
  showError,
  showInfo,
  showWarning,
  showLoading,
  dismissToast,
  updateToSuccess,
  updateToError,
  showPromise,
} from "@/lib/utils/toast";

// Mock sonner
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
    loading: vi.fn(() => "toast-id"),
    dismiss: vi.fn(),
    promise: vi.fn(),
  },
}));

describe("Toast Utils", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("showSuccess", () => {
    it("should call sonner.success with message", () => {
      showSuccess("Success message");
      expect(sonnerToast.success).toHaveBeenCalledWith("Success message", {
        description: undefined,
      });
    });

    it("should call sonner.success with message and description", () => {
      showSuccess("Success message", "Description");
      expect(sonnerToast.success).toHaveBeenCalledWith("Success message", {
        description: "Description",
      });
    });
  });

  describe("showError", () => {
    it("should call sonner.error with message", () => {
      showError("Error message");
      expect(sonnerToast.error).toHaveBeenCalledWith("Error message", {
        description: undefined,
      });
    });

    it("should call sonner.error with message and description", () => {
      showError("Error message", "Error details");
      expect(sonnerToast.error).toHaveBeenCalledWith("Error message", {
        description: "Error details",
      });
    });
  });

  describe("showInfo", () => {
    it("should call sonner.info with message", () => {
      showInfo("Info message");
      expect(sonnerToast.info).toHaveBeenCalledWith("Info message", {
        description: undefined,
      });
    });
  });

  describe("showWarning", () => {
    it("should call sonner.warning with message", () => {
      showWarning("Warning message");
      expect(sonnerToast.warning).toHaveBeenCalledWith("Warning message", {
        description: undefined,
      });
    });
  });

  describe("showLoading", () => {
    it("should call sonner.loading and return toast ID", () => {
      const id = showLoading("Loading...");
      expect(sonnerToast.loading).toHaveBeenCalledWith("Loading...");
      expect(id).toBe("toast-id");
    });
  });

  describe("dismissToast", () => {
    it("should call sonner.dismiss with ID", () => {
      dismissToast("toast-id");
      expect(sonnerToast.dismiss).toHaveBeenCalledWith("toast-id");
    });
  });

  describe("updateToSuccess", () => {
    it("should update toast to success", () => {
      updateToSuccess("toast-id", "Updated success");
      expect(sonnerToast.success).toHaveBeenCalledWith("Updated success", {
        id: "toast-id",
        description: undefined,
      });
    });
  });

  describe("updateToError", () => {
    it("should update toast to error", () => {
      updateToError("toast-id", "Updated error", "Details");
      expect(sonnerToast.error).toHaveBeenCalledWith("Updated error", {
        id: "toast-id",
        description: "Details",
      });
    });
  });

  describe("showPromise", () => {
    it("should call sonner.promise and return the promise result", async () => {
      const promise = Promise.resolve("result");
      const messages = {
        loading: "Loading...",
        success: "Success!",
        error: "Error!",
      };

      const result = await showPromise(promise, messages);

      expect(sonnerToast.promise).toHaveBeenCalledWith(promise, messages);
      expect(result).toBe("result");
    });
  });
});
