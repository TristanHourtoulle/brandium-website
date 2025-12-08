import { apiClient } from "./client";
import type {
  IterateRequest,
  IterateResponse,
  IterateApiResponse,
  PostVersion,
  VersionsResponse,
  VersionsApiResponse,
  VersionApiResponse,
  IterationType,
  IteratePostRequest,
  IteratePostResponse,
  SelectVersionResponse,
} from "@/types";

// ================================
// Iteration Type Labels & Descriptions
// ================================

export const ITERATION_TYPES: Record<
  IterationType,
  { label: string; description: string; icon: string; estimatedTime: string }
> = {
  shorter: {
    label: "Make Shorter",
    description: "Reduce length by ~30% while keeping the essential message",
    icon: "✂️",
    estimatedTime: "5-10s",
  },
  stronger_hook: {
    label: "Stronger Hook",
    description: "Improve the opening 2-3 lines for more impact",
    icon: "🎣",
    estimatedTime: "5-10s",
  },
  more_personal: {
    label: "More Personal",
    description: "Add a personal anecdote or authentic moment",
    icon: "💭",
    estimatedTime: "10-15s",
  },
  add_data: {
    label: "Add Data",
    description: "Include relevant statistics or data points",
    icon: "📊",
    estimatedTime: "10-15s",
  },
  simplify: {
    label: "Simplify",
    description: "Remove jargon and make language more accessible",
    icon: "🔍",
    estimatedTime: "5-10s",
  },
  custom: {
    label: "Custom Feedback",
    description: "Apply your own specific instructions",
    icon: "✏️",
    estimatedTime: "10-20s",
  },
};

// ================================
// API Functions
// ================================

/**
 * Create a new iteration of a post (v1.x compatible)
 * @deprecated Use iteratePostV2 for v2.0 type-based iterations
 */
export async function iteratePost(
  postId: string,
  request: IterateRequest
): Promise<IterateResponse> {
  const response = await apiClient.post<IterateApiResponse>(
    `/api/posts/${postId}/iterate`,
    request
  );
  return response.data;
}

/**
 * Create a new iteration using v2.0 type-based iterations
 * @param postId - The ID of the post to iterate on
 * @param type - The type of iteration (shorter, stronger_hook, etc.)
 * @param feedback - Required if type is 'custom'
 * @param maxTokens - Optional max tokens limit
 */
export async function iteratePostV2(
  postId: string,
  type: IterationType,
  feedback?: string,
  maxTokens?: number
): Promise<IteratePostResponse> {
  const request: IteratePostRequest = {
    type,
    feedback: type === "custom" ? feedback : undefined,
    maxTokens,
  };

  const response = await apiClient.post<IteratePostResponse>(
    `/api/posts/${postId}/iterate`,
    request
  );

  return response;
}

/**
 * Fetch all versions of a post
 * @param postId - The ID of the post to get versions for
 * @returns All versions of the post ordered by version number
 */
export async function fetchVersions(
  postId: string
): Promise<VersionsResponse> {
  const response = await apiClient.get<VersionsApiResponse>(
    `/api/posts/${postId}/versions`
  );
  return response.data;
}

/**
 * Fetch a specific version of a post
 * @param postId - The ID of the post
 * @param versionId - The ID of the version to fetch
 * @returns The specific version
 */
export async function fetchVersion(
  postId: string,
  versionId: string
): Promise<PostVersion> {
  const response = await apiClient.get<VersionApiResponse>(
    `/api/posts/${postId}/versions/${versionId}`
  );
  return response.data;
}

/**
 * Select a version as the current one (v1.x)
 * Updates the parent post's generatedText to match
 * @deprecated Use selectVersionV2 for v2.0 response format
 */
export async function selectVersion(
  postId: string,
  versionId: string
): Promise<PostVersion> {
  const response = await apiClient.patch<VersionApiResponse>(
    `/api/posts/${postId}/versions/${versionId}/select`
  );
  return response.data;
}

/**
 * Select a version as the current one (v2.0)
 * Uses PUT method as per v2.0 API spec
 */
export async function selectVersionV2(
  postId: string,
  versionId: string
): Promise<SelectVersionResponse> {
  const response = await apiClient.put<SelectVersionResponse>(
    `/api/posts/${postId}/versions/${versionId}/select`
  );
  return response;
}

// ================================
// Helper Functions
// ================================

/**
 * Get iteration type info
 */
export function getIterationTypeInfo(type: IterationType) {
  return ITERATION_TYPES[type];
}

/**
 * Get all available iteration types (excluding custom)
 */
export function getQuickIterationTypes(): IterationType[] {
  return ["shorter", "stronger_hook", "more_personal", "add_data", "simplify"];
}

/**
 * Validate custom iteration feedback
 */
export function validateCustomFeedback(feedback: string): {
  isValid: boolean;
  error?: string;
} {
  if (!feedback || feedback.trim().length === 0) {
    return { isValid: false, error: "Feedback is required for custom iterations" };
  }
  if (feedback.trim().length < 10) {
    return { isValid: false, error: "Feedback should be at least 10 characters" };
  }
  if (feedback.length > 500) {
    return { isValid: false, error: "Feedback should not exceed 500 characters" };
  }
  return { isValid: true };
}
