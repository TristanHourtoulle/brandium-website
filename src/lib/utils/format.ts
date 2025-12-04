/**
 * Format character count with optional max length indicator
 * @param current - Current character count
 * @param max - Optional maximum character limit
 * @returns Formatted string like "150" or "150 / 280"
 */
export function formatCharacterCount(current: number, max?: number): string {
  if (max === undefined || max === null) {
    return current.toString();
  }
  return `${current} / ${max}`;
}

/**
 * Get character count status for styling
 * @param current - Current character count
 * @param max - Maximum character limit
 * @returns Status: "normal", "warning", or "error"
 */
export function getCharacterCountStatus(
  current: number,
  max?: number
): "normal" | "warning" | "error" {
  if (max === undefined || max === null) {
    return "normal";
  }

  const ratio = current / max;

  if (ratio >= 1) {
    return "error";
  }

  if (ratio >= 0.9) {
    return "warning";
  }

  return "normal";
}

/**
 * Truncate text to a maximum length with ellipsis
 * @param text - Text to truncate
 * @param maxLength - Maximum length (including ellipsis)
 * @returns Truncated text with ellipsis if needed
 */
export function truncateText(text: string, maxLength: number): string {
  if (maxLength < 4) {
    return text.slice(0, maxLength);
  }

  if (text.length <= maxLength) {
    return text;
  }

  return text.slice(0, maxLength - 3) + "...";
}

/**
 * Copy text to clipboard
 * @param text - Text to copy
 * @returns Promise that resolves to true on success, false on failure
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (!navigator?.clipboard) {
    // Fallback for older browsers
    try {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const result = document.execCommand("copy");
      document.body.removeChild(textArea);
      return result;
    } catch {
      return false;
    }
  }

  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/**
 * Format a date string to relative time (e.g., "2 minutes ago", "1 hour ago")
 * @param dateString - ISO date string
 * @returns Relative time string
 */
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 0) {
    return "just now";
  }

  if (diffInSeconds < 60) {
    return diffInSeconds <= 1 ? "just now" : `${diffInSeconds} seconds ago`;
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return diffInMinutes === 1 ? "1 minute ago" : `${diffInMinutes} minutes ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return diffInHours === 1 ? "1 hour ago" : `${diffInHours} hours ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return diffInDays === 1 ? "1 day ago" : `${diffInDays} days ago`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return diffInWeeks === 1 ? "1 week ago" : `${diffInWeeks} weeks ago`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return diffInMonths === 1 ? "1 month ago" : `${diffInMonths} months ago`;
  }

  const diffInYears = Math.floor(diffInDays / 365);
  return diffInYears === 1 ? "1 year ago" : `${diffInYears} years ago`;
}

/**
 * Format countdown time until a reset date
 * @param resetAt - ISO date string for reset time
 * @returns Formatted countdown string (e.g., "5m 30s", "1h 15m")
 */
export function formatCountdown(resetAt: string): string {
  const resetDate = new Date(resetAt);
  const now = new Date();
  const diffInSeconds = Math.max(
    0,
    Math.floor((resetDate.getTime() - now.getTime()) / 1000)
  );

  if (diffInSeconds === 0) {
    return "now";
  }

  const hours = Math.floor(diffInSeconds / 3600);
  const minutes = Math.floor((diffInSeconds % 3600) / 60);
  const seconds = diffInSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }

  return `${seconds}s`;
}

/**
 * Calculate the percentage of rate limit used
 * @param remaining - Remaining requests
 * @param total - Total allowed requests
 * @returns Percentage remaining (0-100)
 */
export function calculateRateLimitPercentage(
  remaining: number,
  total: number
): number {
  if (total <= 0) {
    return 0;
  }

  return Math.round((remaining / total) * 100);
}
