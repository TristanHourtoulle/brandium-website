import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  announceToScreenReader,
  announcements,
  createFocusTrap,
  prefersReducedMotion,
  generateAriaId,
  Keys,
  isKey,
  handleListKeyboard,
} from "@/lib/utils/accessibility";

// Mock requestAnimationFrame for synchronous testing
const originalRAF = globalThis.requestAnimationFrame;
beforeEach(() => {
  globalThis.requestAnimationFrame = (cb: FrameRequestCallback) => {
    cb(0);
    return 0;
  };
});
afterEach(() => {
  globalThis.requestAnimationFrame = originalRAF;
});

describe("accessibility utility", () => {
  describe("announceToScreenReader", () => {
    beforeEach(() => {
      // Clean up any existing announcer elements
      document.querySelectorAll("[aria-live]").forEach((el) => el.remove());
    });

    afterEach(() => {
      document.querySelectorAll("[aria-live]").forEach((el) => el.remove());
    });

    it("should create an announcer element with polite priority", () => {
      announceToScreenReader("Test message", "polite");

      const announcer = document.querySelector('[aria-live="polite"]');
      expect(announcer).toBeTruthy();
      expect(announcer?.textContent).toBe("Test message");
    });

    it("should create an announcer element with assertive priority", () => {
      announceToScreenReader("Urgent message", "assertive");

      const announcer = document.querySelector('[aria-live="assertive"]');
      expect(announcer).toBeTruthy();
      expect(announcer?.textContent).toBe("Urgent message");
    });

    it("should use polite priority by default", () => {
      announceToScreenReader("Default priority");

      const announcer = document.querySelector('[aria-live="polite"]');
      expect(announcer).toBeTruthy();
    });

    it("should keep the announcer element in the DOM", () => {
      // The implementation reuses the same announcer element for all messages
      // rather than removing it after each announcement
      announceToScreenReader("First message");
      const announcer1 = document.getElementById("sr-announcer");
      expect(announcer1).toBeTruthy();

      announceToScreenReader("Second message");
      const announcer2 = document.getElementById("sr-announcer");
      expect(announcer2).toBe(announcer1); // Same element reused
      expect(announcer2?.textContent).toBe("Second message");
    });
  });

  describe("announcements", () => {
    beforeEach(() => {
      document.querySelectorAll("[aria-live]").forEach((el) => el.remove());
    });

    afterEach(() => {
      document.querySelectorAll("[aria-live]").forEach((el) => el.remove());
    });

    it("should announce loading", () => {
      announcements.loading("profile");
      const announcer = document.querySelector('[aria-live="polite"]');
      expect(announcer?.textContent).toBe("Loading profile...");
    });

    it("should announce saved", () => {
      announcements.saved("Post");
      const announcer = document.querySelector('[aria-live="polite"]');
      expect(announcer?.textContent).toBe("Post saved successfully");
    });

    it("should announce deleted", () => {
      announcements.deleted("Template");
      const announcer = document.querySelector('[aria-live="polite"]');
      expect(announcer?.textContent).toBe("Template deleted");
    });

    it("should announce error assertively", () => {
      announcements.error("Something went wrong");
      const announcer = document.querySelector('[aria-live="assertive"]');
      expect(announcer?.textContent).toBe("Error: Something went wrong");
    });

    it("should announce selected", () => {
      announcements.selected("Profile");
      const announcer = document.querySelector('[aria-live="polite"]');
      expect(announcer?.textContent).toBe("Profile selected");
    });

    it("should announce formError assertively", () => {
      announcements.formError("Email", "Invalid format");
      const announcer = document.querySelector('[aria-live="assertive"]');
      expect(announcer?.textContent).toBe("Email: Invalid format");
    });

    it("should announce copied", () => {
      announcements.copied();
      const announcer = document.querySelector('[aria-live="polite"]');
      expect(announcer?.textContent).toBe("Copied to clipboard");
    });

    it("should announce generated", () => {
      announcements.generated(3, "variant");
      const announcer = document.querySelector('[aria-live="polite"]');
      expect(announcer?.textContent).toBe("Generated 3 variants");
    });

    it("should announce generated singular", () => {
      announcements.generated(1, "post");
      const announcer = document.querySelector('[aria-live="polite"]');
      expect(announcer?.textContent).toBe("Generated 1 post");
    });
  });

  describe("createFocusTrap", () => {
    let container: HTMLDivElement;
    let button1: HTMLButtonElement;
    let button2: HTMLButtonElement;
    let button3: HTMLButtonElement;

    beforeEach(() => {
      container = document.createElement("div");
      button1 = document.createElement("button");
      button2 = document.createElement("button");
      button3 = document.createElement("button");

      button1.textContent = "First";
      button2.textContent = "Second";
      button3.textContent = "Third";

      container.appendChild(button1);
      container.appendChild(button2);
      container.appendChild(button3);
      document.body.appendChild(container);
    });

    afterEach(() => {
      container.remove();
    });

    it("should create trap with activate and deactivate functions", () => {
      const trap = createFocusTrap(container);
      expect(trap).toHaveProperty("activate");
      expect(trap).toHaveProperty("deactivate");
    });

    it("should focus first element on activate", () => {
      const trap = createFocusTrap(container);
      trap.activate();
      expect(document.activeElement).toBe(button1);
    });

    it("should trap Tab key within container", () => {
      const trap = createFocusTrap(container);
      trap.activate();

      button3.focus();

      const event = new KeyboardEvent("keydown", {
        key: "Tab",
        bubbles: true,
      });
      const preventDefaultSpy = vi.spyOn(event, "preventDefault");

      container.dispatchEvent(event);

      expect(preventDefaultSpy).toHaveBeenCalled();
      expect(document.activeElement).toBe(button1);
    });

    it("should trap Shift+Tab within container", () => {
      const trap = createFocusTrap(container);
      trap.activate();

      button1.focus();

      const event = new KeyboardEvent("keydown", {
        key: "Tab",
        shiftKey: true,
        bubbles: true,
      });
      const preventDefaultSpy = vi.spyOn(event, "preventDefault");

      container.dispatchEvent(event);

      expect(preventDefaultSpy).toHaveBeenCalled();
      expect(document.activeElement).toBe(button3);
    });

    it("should remove listener on deactivate", () => {
      const trap = createFocusTrap(container);
      trap.activate();
      trap.deactivate();

      button3.focus();
      const event = new KeyboardEvent("keydown", {
        key: "Tab",
        bubbles: true,
      });

      container.dispatchEvent(event);

      // Should not wrap - focus stays on button3
      expect(document.activeElement).toBe(button3);
    });
  });

  describe("prefersReducedMotion", () => {
    beforeEach(() => {
      Object.defineProperty(window, "matchMedia", {
        writable: true,
        value: vi.fn().mockImplementation((query: string) => ({
          matches: query === "(prefers-reduced-motion: reduce)",
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });
    });

    it("should return boolean", () => {
      const result = prefersReducedMotion();
      expect(typeof result).toBe("boolean");
    });

    it("should return true when reduced motion is preferred", () => {
      const result = prefersReducedMotion();
      expect(result).toBe(true);
    });

    it("should return false when reduced motion is not preferred", () => {
      Object.defineProperty(window, "matchMedia", {
        writable: true,
        value: vi.fn().mockImplementation((query: string) => ({
          matches: false,
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });
      const result = prefersReducedMotion();
      expect(result).toBe(false);
    });
  });

  describe("generateAriaId", () => {
    it("should generate unique IDs with prefix", () => {
      const id1 = generateAriaId("button");
      const id2 = generateAriaId("button");

      expect(id1).toMatch(/^button-\d+$/);
      expect(id2).toMatch(/^button-\d+$/);
      expect(id1).not.toBe(id2);
    });

    it("should use different prefixes", () => {
      const buttonId = generateAriaId("button");
      const inputId = generateAriaId("input");

      expect(buttonId).toMatch(/^button-/);
      expect(inputId).toMatch(/^input-/);
    });
  });

  describe("Keys", () => {
    it("should have correct key values", () => {
      expect(Keys.Enter).toBe("Enter");
      expect(Keys.Space).toBe(" ");
      expect(Keys.Escape).toBe("Escape");
      expect(Keys.ArrowUp).toBe("ArrowUp");
      expect(Keys.ArrowDown).toBe("ArrowDown");
      expect(Keys.ArrowLeft).toBe("ArrowLeft");
      expect(Keys.ArrowRight).toBe("ArrowRight");
      expect(Keys.Home).toBe("Home");
      expect(Keys.End).toBe("End");
      expect(Keys.Tab).toBe("Tab");
    });
  });

  describe("isKey", () => {
    it("should return true for matching key", () => {
      const event = new KeyboardEvent("keydown", { key: "Enter" });
      expect(isKey(event, "Enter")).toBe(true);
    });

    it("should return false for non-matching key", () => {
      const event = new KeyboardEvent("keydown", { key: "Escape" });
      expect(isKey(event, "Enter")).toBe(false);
    });
  });

  describe("handleListKeyboard", () => {
    it("should call onSelect with next index on ArrowDown", () => {
      const onSelect = vi.fn();
      const event = new KeyboardEvent("keydown", { key: "ArrowDown" });
      const preventDefaultSpy = vi.spyOn(event, "preventDefault");

      handleListKeyboard(event, 0, 3, onSelect);

      expect(preventDefaultSpy).toHaveBeenCalled();
      expect(onSelect).toHaveBeenCalledWith(1);
    });

    it("should wrap to first item from last on ArrowDown", () => {
      const onSelect = vi.fn();
      const event = new KeyboardEvent("keydown", { key: "ArrowDown" });

      handleListKeyboard(event, 2, 3, onSelect);

      expect(onSelect).toHaveBeenCalledWith(0);
    });

    it("should call onSelect with previous index on ArrowUp", () => {
      const onSelect = vi.fn();
      const event = new KeyboardEvent("keydown", { key: "ArrowUp" });

      handleListKeyboard(event, 1, 3, onSelect);

      expect(onSelect).toHaveBeenCalledWith(0);
    });

    it("should wrap to last item from first on ArrowUp", () => {
      const onSelect = vi.fn();
      const event = new KeyboardEvent("keydown", { key: "ArrowUp" });

      handleListKeyboard(event, 0, 3, onSelect);

      expect(onSelect).toHaveBeenCalledWith(2);
    });

    it("should call onSelect with 0 on Home", () => {
      const onSelect = vi.fn();
      const event = new KeyboardEvent("keydown", { key: "Home" });

      handleListKeyboard(event, 2, 3, onSelect);

      expect(onSelect).toHaveBeenCalledWith(0);
    });

    it("should call onSelect with last index on End", () => {
      const onSelect = vi.fn();
      const event = new KeyboardEvent("keydown", { key: "End" });

      handleListKeyboard(event, 0, 3, onSelect);

      expect(onSelect).toHaveBeenCalledWith(2);
    });

    it("should not call onSelect if index does not change", () => {
      const onSelect = vi.fn();
      const event = new KeyboardEvent("keydown", { key: "Home" });

      handleListKeyboard(event, 0, 3, onSelect);

      expect(onSelect).not.toHaveBeenCalled();
    });

    it("should not call onSelect for unhandled keys", () => {
      const onSelect = vi.fn();
      const event = new KeyboardEvent("keydown", { key: "a" });

      handleListKeyboard(event, 0, 3, onSelect);

      expect(onSelect).not.toHaveBeenCalled();
    });
  });
});
