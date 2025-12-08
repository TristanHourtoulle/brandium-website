import { apiClient } from "./client";
import type {
  Hook,
  HookType,
  GenerateHooksRequest,
  GenerateHooksFromIdeaRequest,
  GenerateHooksFromPostRequest,
  GenerateHooksResponse,
} from "@/types";
import { isHooksFromPostRequest } from "@/types";

const HOOKS_ENDPOINT = "/api/generate/hooks";

// ================================
// Hook Type Metadata
// ================================

export const HOOK_TYPES: Record<
  HookType,
  {
    label: string;
    description: string;
    color: string;
    bgColor: string;
    icon: string;
  }
> = {
  question: {
    label: "Question",
    description: "Curiosity-driven question that makes readers stop and think",
    color: "text-blue-600",
    bgColor: "bg-blue-100",
    icon: "❓",
  },
  stat: {
    label: "Statistic",
    description: "Data-backed statistic that adds credibility",
    color: "text-orange-600",
    bgColor: "bg-orange-100",
    icon: "📊",
  },
  story: {
    label: "Story",
    description: "Personal moment or anecdote for emotional connection",
    color: "text-purple-600",
    bgColor: "bg-purple-100",
    icon: "📖",
  },
  bold_opinion: {
    label: "Bold Opinion",
    description: "Provocative statement that sparks debate",
    color: "text-red-600",
    bgColor: "bg-red-100",
    icon: "💥",
  },
};

// ================================
// API Functions
// ================================

/**
 * Generate hooks for a post idea (from raw idea)
 * @param rawIdea - The post idea (5-500 characters)
 * @param options - Optional: goal, profileId, count
 * @returns Array of hooks with type, text, and engagement score
 */
export async function generateHooks(
  rawIdea: string,
  options?: {
    goal?: string;
    profileId?: string;
    count?: number;
  }
): Promise<Hook[]> {
  const request: GenerateHooksFromIdeaRequest = {
    rawIdea,
    goal: options?.goal,
    profileId: options?.profileId,
    count: options?.count ?? 4,
  };

  const response = await apiClient.post<GenerateHooksResponse>(
    HOOKS_ENDPOINT,
    request
  );

  return response.data.hooks;
}

/**
 * Generate hooks from an existing post
 * This provides better context for hook generation as the API has access
 * to the full post content, profile, and platform information.
 *
 * @param postId - UUID of the existing post
 * @param options - Optional: variants (1-3), goal, profileId
 * @returns Array of hooks with type, text, and engagement score
 */
export async function generateHooksFromPost(
  postId: string,
  options?: {
    variants?: number;
    goal?: string;
    profileId?: string;
  }
): Promise<Hook[]> {
  const request: GenerateHooksFromPostRequest = {
    postId,
    variants: options?.variants ?? 2,
    goal: options?.goal,
    profileId: options?.profileId,
  };

  const response = await apiClient.post<GenerateHooksResponse>(
    HOOKS_ENDPOINT,
    request
  );

  return response.data.hooks;
}

/**
 * Generate hooks from an existing post with full metadata response
 */
export async function generateHooksFromPostWithMeta(
  postId: string,
  options?: {
    variants?: number;
    goal?: string;
    profileId?: string;
  }
): Promise<GenerateHooksResponse["data"]> {
  const request: GenerateHooksFromPostRequest = {
    postId,
    variants: options?.variants ?? 2,
    goal: options?.goal,
    profileId: options?.profileId,
  };

  const response = await apiClient.post<GenerateHooksResponse>(
    HOOKS_ENDPOINT,
    request
  );

  return response.data;
}

/**
 * Generate hooks with full response (includes totalHooks)
 * Works with both rawIdea and postId modes
 */
export async function generateHooksWithMeta(
  request: GenerateHooksRequest
): Promise<GenerateHooksResponse["data"]> {
  const response = await apiClient.post<GenerateHooksResponse>(
    HOOKS_ENDPOINT,
    request
  );

  return response.data;
}

/**
 * Type guard re-export for convenience
 */
export { isHooksFromPostRequest };

// ================================
// Helper Functions
// ================================

/**
 * Get hook type metadata
 */
export function getHookTypeInfo(type: HookType) {
  return HOOK_TYPES[type];
}

/**
 * Get all hook types
 */
export function getAllHookTypes(): HookType[] {
  return ["question", "stat", "story", "bold_opinion"];
}

/**
 * Sort hooks by engagement score (highest first)
 */
export function sortHooksByEngagement(hooks: Hook[]): Hook[] {
  return [...hooks].sort((a, b) => b.estimatedEngagement - a.estimatedEngagement);
}

/**
 * Get the best hook (highest engagement)
 */
export function getBestHook(hooks: Hook[]): Hook | null {
  if (hooks.length === 0) return null;
  return sortHooksByEngagement(hooks)[0];
}

/**
 * Format engagement score for display
 */
export function formatEngagementScore(score: number): {
  label: string;
  color: string;
} {
  if (score >= 9) {
    return { label: "Excellent", color: "text-green-600" };
  }
  if (score >= 7) {
    return { label: "Good", color: "text-blue-600" };
  }
  if (score >= 5) {
    return { label: "Average", color: "text-yellow-600" };
  }
  return { label: "Low", color: "text-gray-600" };
}

/**
 * Validate rawIdea for hook generation
 */
export function validateRawIdea(rawIdea: string): {
  isValid: boolean;
  error?: string;
} {
  if (!rawIdea || rawIdea.trim().length === 0) {
    return { isValid: false, error: "Please enter a post idea" };
  }
  if (rawIdea.trim().length < 5) {
    return { isValid: false, error: "Post idea should be at least 5 characters" };
  }
  if (rawIdea.length > 500) {
    return { isValid: false, error: "Post idea should not exceed 500 characters" };
  }
  return { isValid: true };
}
