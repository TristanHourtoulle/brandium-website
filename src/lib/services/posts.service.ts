/**
 * Format a post preview by truncating the content
 * @param content - The full post content
 * @param maxLength - Maximum length before truncation (default: 150)
 * @returns Truncated content with ellipsis if needed
 */
export function formatPostPreview(content: string, maxLength: number = 150): string {
  if (!content) return "";
  if (content.length <= maxLength) return content;

  // Find the last space before maxLength to avoid cutting words
  const truncated = content.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(" ");

  if (lastSpace > maxLength * 0.7) {
    return truncated.substring(0, lastSpace) + "...";
  }

  return truncated + "...";
}

/**
 * Highlight search term in text for display
 * @param text - The text to search in
 * @param searchTerm - The term to highlight
 * @returns Object with parts array for rendering highlighted text
 */
export function highlightSearchTerm(
  text: string,
  searchTerm: string
): { parts: Array<{ text: string; highlighted: boolean }> } {
  if (!searchTerm || !text) {
    return { parts: [{ text, highlighted: false }] };
  }

  const parts: Array<{ text: string; highlighted: boolean }> = [];
  const lowerText = text.toLowerCase();
  const lowerSearch = searchTerm.toLowerCase();
  let lastIndex = 0;

  let index = lowerText.indexOf(lowerSearch);
  while (index !== -1) {
    // Add non-highlighted part before match
    if (index > lastIndex) {
      parts.push({
        text: text.substring(lastIndex, index),
        highlighted: false,
      });
    }

    // Add highlighted match
    parts.push({
      text: text.substring(index, index + searchTerm.length),
      highlighted: true,
    });

    lastIndex = index + searchTerm.length;
    index = lowerText.indexOf(lowerSearch, lastIndex);
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push({
      text: text.substring(lastIndex),
      highlighted: false,
    });
  }

  return { parts };
}

/**
 * Calculate the character count and status for a post
 * @param content - The post content
 * @param maxLength - Optional maximum length for the platform
 * @returns Character count info
 */
export function getCharacterCountInfo(
  content: string,
  maxLength?: number
): {
  count: number;
  maxLength?: number;
  percentage?: number;
  isOverLimit: boolean;
  status: "ok" | "warning" | "error";
} {
  const count = content?.length || 0;

  if (!maxLength) {
    return {
      count,
      isOverLimit: false,
      status: "ok",
    };
  }

  const percentage = Math.round((count / maxLength) * 100);
  const isOverLimit = count > maxLength;

  let status: "ok" | "warning" | "error" = "ok";
  if (isOverLimit) {
    status = "error";
  } else if (percentage >= 90) {
    status = "warning";
  }

  return {
    count,
    maxLength,
    percentage,
    isOverLimit,
    status,
  };
}

/**
 * Format a date for display
 * @param dateString - ISO date string
 * @returns Formatted date string
 */
export function formatPostDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  // Today
  if (diffDays === 0) {
    return `Today at ${date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    })}`;
  }

  // Yesterday
  if (diffDays === 1) {
    return `Yesterday at ${date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    })}`;
  }

  // Within last 7 days
  if (diffDays < 7) {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      hour: "numeric",
      minute: "2-digit",
    });
  }

  // Older dates
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

/**
 * Copy text to clipboard
 * @param text - Text to copy
 * @returns Promise that resolves to true if successful
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for older browsers
    try {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      return true;
    } catch {
      return false;
    }
  }
}
