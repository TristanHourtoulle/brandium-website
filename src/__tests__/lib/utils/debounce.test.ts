import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { debounce, throttle, DEBOUNCE_DELAYS } from "@/lib/utils/debounce";

describe("debounce utility", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("debounce", () => {
    it("should delay function execution", () => {
      const fn = vi.fn();
      const debouncedFn = debounce(fn, 100);

      debouncedFn();
      expect(fn).not.toHaveBeenCalled();

      vi.advanceTimersByTime(50);
      expect(fn).not.toHaveBeenCalled();

      vi.advanceTimersByTime(50);
      expect(fn).toHaveBeenCalledOnce();
    });

    it("should reset delay on subsequent calls", () => {
      const fn = vi.fn();
      const debouncedFn = debounce(fn, 100);

      debouncedFn();
      vi.advanceTimersByTime(50);

      debouncedFn();
      vi.advanceTimersByTime(50);

      expect(fn).not.toHaveBeenCalled();

      vi.advanceTimersByTime(50);
      expect(fn).toHaveBeenCalledOnce();
    });

    it("should pass arguments to the function", () => {
      const fn = vi.fn();
      const debouncedFn = debounce(fn, 100);

      debouncedFn("arg1", "arg2");
      vi.advanceTimersByTime(100);

      expect(fn).toHaveBeenCalledWith("arg1", "arg2");
    });

    it("should use latest arguments", () => {
      const fn = vi.fn();
      const debouncedFn = debounce(fn, 100);

      debouncedFn("first");
      debouncedFn("second");
      debouncedFn("third");

      vi.advanceTimersByTime(100);

      expect(fn).toHaveBeenCalledOnce();
      expect(fn).toHaveBeenCalledWith("third");
    });

    describe("cancel", () => {
      it("should cancel pending execution", () => {
        const fn = vi.fn();
        const debouncedFn = debounce(fn, 100);

        debouncedFn();
        debouncedFn.cancel();

        vi.advanceTimersByTime(200);
        expect(fn).not.toHaveBeenCalled();
      });

      it("should be safe to call multiple times", () => {
        const fn = vi.fn();
        const debouncedFn = debounce(fn, 100);

        debouncedFn();
        debouncedFn.cancel();
        debouncedFn.cancel();

        expect(fn).not.toHaveBeenCalled();
      });
    });

    describe("flush", () => {
      it("should execute immediately", () => {
        const fn = vi.fn();
        const debouncedFn = debounce(fn, 100);

        debouncedFn("arg");
        expect(fn).not.toHaveBeenCalled();

        debouncedFn.flush();
        expect(fn).toHaveBeenCalledWith("arg");
      });

      it("should not execute if nothing is pending", () => {
        const fn = vi.fn();
        const debouncedFn = debounce(fn, 100);

        debouncedFn.flush();
        expect(fn).not.toHaveBeenCalled();
      });

      it("should clear pending timeout after flush", () => {
        const fn = vi.fn();
        const debouncedFn = debounce(fn, 100);

        debouncedFn("arg");
        debouncedFn.flush();

        vi.advanceTimersByTime(200);
        expect(fn).toHaveBeenCalledOnce();
      });
    });
  });

  describe("throttle", () => {
    it("should execute immediately on first call", () => {
      const fn = vi.fn();
      const throttledFn = throttle(fn, 100);

      throttledFn();
      expect(fn).toHaveBeenCalledOnce();
    });

    it("should throttle subsequent calls", () => {
      const fn = vi.fn();
      const throttledFn = throttle(fn, 100);

      throttledFn();
      throttledFn();
      throttledFn();

      expect(fn).toHaveBeenCalledOnce();
    });

    it("should execute after wait time", () => {
      const fn = vi.fn();
      const throttledFn = throttle(fn, 100);

      throttledFn("first");
      throttledFn("second");

      expect(fn).toHaveBeenCalledOnce();

      vi.advanceTimersByTime(100);

      expect(fn).toHaveBeenCalledTimes(2);
      expect(fn).toHaveBeenLastCalledWith("second");
    });

    it("should pass arguments to the function", () => {
      const fn = vi.fn();
      const throttledFn = throttle(fn, 100);

      throttledFn("arg1", "arg2");
      expect(fn).toHaveBeenCalledWith("arg1", "arg2");
    });

    it("should use latest arguments for delayed execution", () => {
      const fn = vi.fn();
      const throttledFn = throttle(fn, 100);

      throttledFn("first");
      throttledFn("second");
      throttledFn("third");

      vi.advanceTimersByTime(100);

      expect(fn).toHaveBeenLastCalledWith("third");
    });

    describe("cancel", () => {
      it("should cancel pending execution", () => {
        const fn = vi.fn();
        const throttledFn = throttle(fn, 100);

        throttledFn("first");
        throttledFn("second");
        throttledFn.cancel();

        vi.advanceTimersByTime(200);

        expect(fn).toHaveBeenCalledOnce();
        expect(fn).toHaveBeenCalledWith("first");
      });

      it("should reset state after cancel", () => {
        const fn = vi.fn();
        const throttledFn = throttle(fn, 100);

        throttledFn("first");
        throttledFn.cancel();

        throttledFn("after-cancel");
        expect(fn).toHaveBeenCalledTimes(2);
        expect(fn).toHaveBeenLastCalledWith("after-cancel");
      });
    });
  });

  describe("DEBOUNCE_DELAYS", () => {
    it("should have correct delay values", () => {
      expect(DEBOUNCE_DELAYS.SEARCH).toBe(300);
      expect(DEBOUNCE_DELAYS.TEMPLATE_PREVIEW).toBe(500);
      expect(DEBOUNCE_DELAYS.VALIDATION).toBe(200);
      expect(DEBOUNCE_DELAYS.AUTOSAVE).toBe(1000);
      expect(DEBOUNCE_DELAYS.RESIZE).toBe(150);
    });
  });
});
