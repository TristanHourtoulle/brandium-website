import type { ApiError } from "@/types";

/**
 * Type guard to check if an error is an ApiError
 */
export function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    "statusCode" in error
  );
}

/**
 * Extract a user-friendly message from any error
 */
export function getErrorMessage(error: unknown): string {
  // Handle ApiError
  if (isApiError(error)) {
    return error.message;
  }

  // Handle standard Error
  if (error instanceof Error) {
    // Network errors
    if (error.message === "Failed to fetch") {
      return "Network error. Please check your internet connection.";
    }
    return error.message;
  }

  // Handle string errors
  if (typeof error === "string") {
    return error;
  }

  // Default message
  return "An unexpected error occurred. Please try again.";
}

/**
 * Rate limit error details
 */
export interface RateLimitInfo {
  retryAfter?: number; // seconds
  resetAt?: string; // ISO timestamp
  remaining?: number;
  limit?: number;
}

/**
 * Get an HTTP status code description
 */
export function getStatusCodeMessage(statusCode: number): string {
  const messages: Record<number, string> = {
    400: "Bad request. Please check your input.",
    401: "Please sign in to continue.",
    403: "You don't have permission to perform this action.",
    404: "The requested resource was not found.",
    409: "This action conflicts with existing data.",
    422: "Invalid data provided.",
    429: "Too many requests. Please wait a moment and try again.",
    500: "Server error. Please try again later.",
    502: "Server temporarily unavailable. Please try again later.",
    503: "Service unavailable. Please try again later.",
  };

  return messages[statusCode] || "An unexpected error occurred.";
}

/**
 * Check if error is a rate limit error
 */
export function isRateLimitError(error: unknown): boolean {
  if (isApiError(error)) {
    return error.statusCode === 429;
  }
  return false;
}

/**
 * Extract rate limit info from error response
 */
export function extractRateLimitInfo(error: unknown): RateLimitInfo | null {
  if (!isApiError(error) || error.statusCode !== 429) {
    return null;
  }

  // Try to extract retry-after from error details
  // Cast through unknown to avoid type overlap issues
  const errorObj = error as unknown as { details?: Record<string, unknown> };
  const details = errorObj.details;

  if (details) {
    return {
      retryAfter: typeof details.retryAfter === "number" ? details.retryAfter : undefined,
      resetAt: typeof details.resetAt === "string" ? details.resetAt : undefined,
      remaining: typeof details.remaining === "number" ? details.remaining : undefined,
      limit: typeof details.limit === "number" ? details.limit : undefined,
    };
  }

  // Default retry after 30 seconds
  return { retryAfter: 30 };
}

/**
 * Format rate limit error message with retry time
 */
export function formatRateLimitMessage(error: unknown): string {
  const info = extractRateLimitInfo(error);

  if (!info) {
    return "Too many requests. Please try again later.";
  }

  if (info.retryAfter) {
    if (info.retryAfter < 60) {
      return `Too many requests. Please try again in ${info.retryAfter} seconds.`;
    }
    const minutes = Math.ceil(info.retryAfter / 60);
    return `Too many requests. Please try again in ${minutes} minute${minutes > 1 ? "s" : ""}.`;
  }

  if (info.resetAt) {
    const resetDate = new Date(info.resetAt);
    const now = new Date();
    const diffMs = resetDate.getTime() - now.getTime();
    if (diffMs > 0) {
      const diffSeconds = Math.ceil(diffMs / 1000);
      if (diffSeconds < 60) {
        return `Too many requests. Please try again in ${diffSeconds} seconds.`;
      }
      const diffMinutes = Math.ceil(diffSeconds / 60);
      return `Too many requests. Please try again in ${diffMinutes} minute${diffMinutes > 1 ? "s" : ""}.`;
    }
  }

  return "Too many requests. Please wait a moment and try again.";
}

/**
 * Format API error for display
 */
export function formatApiError(error: unknown): {
  title: string;
  description: string;
  statusCode?: number;
  retryAfter?: number;
} {
  if (isApiError(error)) {
    // Special handling for rate limit errors
    if (error.statusCode === 429) {
      const rateLimitInfo = extractRateLimitInfo(error);
      return {
        title: "Rate Limit Exceeded",
        description: formatRateLimitMessage(error),
        statusCode: error.statusCode,
        retryAfter: rateLimitInfo?.retryAfter,
      };
    }

    const title = getStatusCodeMessage(error.statusCode);
    const description = error.message !== title ? error.message : "";

    return {
      title,
      description,
      statusCode: error.statusCode,
    };
  }

  return {
    title: getErrorMessage(error),
    description: "",
  };
}

/**
 * Handle API errors with logging (for development)
 */
export function handleApiError(error: unknown, context?: string): void {
  const formattedError = formatApiError(error);

  if (process.env.NODE_ENV === "development") {
    console.error(`[API Error]${context ? ` ${context}:` : ""}`, {
      ...formattedError,
      originalError: error,
    });
  }
}

/**
 * Retry logic wrapper for async functions
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: {
    maxAttempts?: number;
    delayMs?: number;
    shouldRetry?: (error: unknown) => boolean;
  } = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    delayMs = 1000,
    shouldRetry = (error) => {
      // Only retry on network errors or 5xx server errors
      if (isApiError(error)) {
        return error.statusCode >= 500;
      }
      return error instanceof Error && error.message === "Failed to fetch";
    },
  } = options;

  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt === maxAttempts || !shouldRetry(error)) {
        throw error;
      }

      // Exponential backoff
      const delay = delayMs * Math.pow(2, attempt - 1);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

/**
 * Safe JSON parse that won't throw
 */
export function safeJsonParse<T>(
  json: string,
  fallback: T
): T {
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
}
