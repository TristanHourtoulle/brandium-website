import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  formatCharacterCount,
  getCharacterCountStatus,
  truncateText,
  copyToClipboard,
  formatRelativeTime,
  formatCountdown,
  calculateRateLimitPercentage,
} from "@/lib/utils/format";

describe("formatCharacterCount", () => {
  it("returns just the count when no max is provided", () => {
    expect(formatCharacterCount(100)).toBe("100");
    expect(formatCharacterCount(0)).toBe("0");
  });

  it("returns count with max when max is provided", () => {
    expect(formatCharacterCount(100, 280)).toBe("100 / 280");
    expect(formatCharacterCount(0, 500)).toBe("0 / 500");
  });

  it("handles undefined max", () => {
    expect(formatCharacterCount(150, undefined)).toBe("150");
  });

  it("handles null max", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(formatCharacterCount(150, null as any)).toBe("150");
  });
});

describe("getCharacterCountStatus", () => {
  it("returns normal when no max is provided", () => {
    expect(getCharacterCountStatus(100)).toBe("normal");
    expect(getCharacterCountStatus(1000)).toBe("normal");
  });

  it("returns normal when under 90% of max", () => {
    expect(getCharacterCountStatus(100, 280)).toBe("normal");
    expect(getCharacterCountStatus(200, 280)).toBe("normal");
    expect(getCharacterCountStatus(251, 280)).toBe("normal"); // 89.6%
  });

  it("returns warning when at or above 90% but under 100%", () => {
    expect(getCharacterCountStatus(252, 280)).toBe("warning"); // 90%
    expect(getCharacterCountStatus(270, 280)).toBe("warning");
    expect(getCharacterCountStatus(279, 280)).toBe("warning");
  });

  it("returns error when at or above 100%", () => {
    expect(getCharacterCountStatus(280, 280)).toBe("error");
    expect(getCharacterCountStatus(300, 280)).toBe("error");
  });

  it("handles edge cases", () => {
    expect(getCharacterCountStatus(0, 100)).toBe("normal");
    expect(getCharacterCountStatus(100, undefined)).toBe("normal");
  });
});

describe("truncateText", () => {
  it("returns text unchanged if shorter than maxLength", () => {
    expect(truncateText("Hello", 10)).toBe("Hello");
    expect(truncateText("Hi", 5)).toBe("Hi");
  });

  it("truncates text and adds ellipsis when longer than maxLength", () => {
    expect(truncateText("Hello World", 8)).toBe("Hello...");
    expect(truncateText("This is a long text", 10)).toBe("This is...");
  });

  it("handles edge case when maxLength is less than 4", () => {
    expect(truncateText("Hello", 3)).toBe("Hel");
    expect(truncateText("Hello", 2)).toBe("He");
  });

  it("handles exact length match", () => {
    expect(truncateText("Hello", 5)).toBe("Hello");
  });

  it("handles empty string", () => {
    expect(truncateText("", 10)).toBe("");
  });
});

describe("copyToClipboard", () => {
  const originalNavigator = global.navigator;
  const originalDocument = global.document;

  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(() => {
    // Restore original navigator
    Object.defineProperty(global, "navigator", {
      value: originalNavigator,
      writable: true,
    });
    Object.defineProperty(global, "document", {
      value: originalDocument,
      writable: true,
    });
  });

  it("uses modern clipboard API when available", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(global, "navigator", {
      value: { clipboard: { writeText } },
      writable: true,
    });

    const result = await copyToClipboard("test text");
    expect(result).toBe(true);
    expect(writeText).toHaveBeenCalledWith("test text");
  });

  it("returns false when modern clipboard API fails", async () => {
    const writeText = vi.fn().mockRejectedValue(new Error("Failed"));
    Object.defineProperty(global, "navigator", {
      value: { clipboard: { writeText } },
      writable: true,
    });

    const result = await copyToClipboard("test text");
    expect(result).toBe(false);
  });

  it("uses fallback when clipboard API is not available", async () => {
    Object.defineProperty(global, "navigator", {
      value: { clipboard: undefined },
      writable: true,
    });

    // Mock document methods
    const mockTextArea = {
      value: "",
      style: {},
      focus: vi.fn(),
      select: vi.fn(),
    };
    const createElement = vi.fn().mockReturnValue(mockTextArea);
    const appendChild = vi.fn();
    const removeChild = vi.fn();
    const execCommand = vi.fn().mockReturnValue(true);

    Object.defineProperty(global, "document", {
      value: {
        createElement,
        body: { appendChild, removeChild },
        execCommand,
      },
      writable: true,
    });

    const result = await copyToClipboard("test text");
    expect(result).toBe(true);
    expect(createElement).toHaveBeenCalledWith("textarea");
    expect(mockTextArea.value).toBe("test text");
  });
});

describe("formatRelativeTime", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-01-15T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns 'just now' for very recent times", () => {
    expect(formatRelativeTime("2025-01-15T12:00:00Z")).toBe("just now");
    expect(formatRelativeTime("2025-01-15T11:59:59Z")).toBe("just now");
  });

  it("returns seconds ago for times less than a minute", () => {
    expect(formatRelativeTime("2025-01-15T11:59:30Z")).toBe("30 seconds ago");
    expect(formatRelativeTime("2025-01-15T11:59:15Z")).toBe("45 seconds ago");
  });

  it("returns minutes ago for times less than an hour", () => {
    expect(formatRelativeTime("2025-01-15T11:59:00Z")).toBe("1 minute ago");
    expect(formatRelativeTime("2025-01-15T11:30:00Z")).toBe("30 minutes ago");
  });

  it("returns hours ago for times less than a day", () => {
    expect(formatRelativeTime("2025-01-15T11:00:00Z")).toBe("1 hour ago");
    expect(formatRelativeTime("2025-01-15T00:00:00Z")).toBe("12 hours ago");
  });

  it("returns days ago for times less than a week", () => {
    expect(formatRelativeTime("2025-01-14T12:00:00Z")).toBe("1 day ago");
    expect(formatRelativeTime("2025-01-10T12:00:00Z")).toBe("5 days ago");
  });

  it("returns weeks ago for times less than a month", () => {
    expect(formatRelativeTime("2025-01-08T12:00:00Z")).toBe("1 week ago");
    expect(formatRelativeTime("2024-12-25T12:00:00Z")).toBe("3 weeks ago");
  });

  it("returns months ago for times less than a year", () => {
    expect(formatRelativeTime("2024-12-15T12:00:00Z")).toBe("1 month ago");
    expect(formatRelativeTime("2024-07-15T12:00:00Z")).toBe("6 months ago");
  });

  it("returns years ago for older times", () => {
    expect(formatRelativeTime("2024-01-15T12:00:00Z")).toBe("1 year ago");
    expect(formatRelativeTime("2022-01-15T12:00:00Z")).toBe("3 years ago");
  });

  it("returns 'just now' for future dates", () => {
    expect(formatRelativeTime("2025-01-15T13:00:00Z")).toBe("just now");
  });
});

describe("formatCountdown", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-01-15T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns 'now' when reset time has passed", () => {
    expect(formatCountdown("2025-01-15T11:00:00Z")).toBe("now");
    expect(formatCountdown("2025-01-15T12:00:00Z")).toBe("now");
  });

  it("returns seconds for short durations", () => {
    expect(formatCountdown("2025-01-15T12:00:30Z")).toBe("30s");
    expect(formatCountdown("2025-01-15T12:00:45Z")).toBe("45s");
  });

  it("returns minutes and seconds for medium durations", () => {
    expect(formatCountdown("2025-01-15T12:05:30Z")).toBe("5m 30s");
    expect(formatCountdown("2025-01-15T12:30:00Z")).toBe("30m 0s");
  });

  it("returns hours and minutes for long durations", () => {
    expect(formatCountdown("2025-01-15T13:30:00Z")).toBe("1h 30m");
    expect(formatCountdown("2025-01-15T14:00:00Z")).toBe("2h 0m");
  });
});

describe("calculateRateLimitPercentage", () => {
  it("calculates correct percentage", () => {
    expect(calculateRateLimitPercentage(50, 100)).toBe(50);
    expect(calculateRateLimitPercentage(25, 100)).toBe(25);
    expect(calculateRateLimitPercentage(100, 100)).toBe(100);
  });

  it("handles zero remaining", () => {
    expect(calculateRateLimitPercentage(0, 100)).toBe(0);
  });

  it("handles zero total", () => {
    expect(calculateRateLimitPercentage(50, 0)).toBe(0);
  });

  it("handles negative total", () => {
    expect(calculateRateLimitPercentage(50, -10)).toBe(0);
  });

  it("rounds to nearest integer", () => {
    expect(calculateRateLimitPercentage(33, 100)).toBe(33);
    expect(calculateRateLimitPercentage(1, 3)).toBe(33);
    expect(calculateRateLimitPercentage(2, 3)).toBe(67);
  });
});
