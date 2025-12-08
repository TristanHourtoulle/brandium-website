import { apiClient } from "./client";
import type {
  GenerateRequest,
  GeneratedPost,
  GenerateResponse,
  RateLimitStatus,
  GenerateWithVariantsRequest,
  GenerateSingleResponse,
  GenerateVariantsResponse,
  VariantApproach,
  LinkedInFormat,
} from "@/types";
import { isVariantsResponse } from "@/types";

const GENERATE_ENDPOINT = "/api/generate";

// ================================
// Backend Response Types (v2.0)
// ================================

// Response when variants=1 (default)
interface BackendSingleResponse {
  message: string;
  data: {
    post: {
      id: string;
      totalVersions: number;
    };
    version: {
      id: string;
      versionNumber: number;
      generatedText: string;
      isSelected: boolean;
      approach: VariantApproach | null;
      format: LinkedInFormat;
      usage: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
      };
    };
  };
  rateLimit?: {
    remaining: number;
    total: number;
    resetAt: string;
  };
}

// Response when variants >= 2
interface BackendVariantsResponse {
  message: string;
  data: {
    variants: Array<{
      postId: string;
      versionId: string;
      versionNumber: number;
      generatedText: string;
      approach: VariantApproach;
      format: LinkedInFormat;
      usage: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
      };
    }>;
    totalVariants: number;
    context: {
      profile?: { id: string; name: string };
      project?: { id: string; name: string };
      platform?: { id: string; name: string };
      historicalPostsUsed: number;
    };
  };
  rateLimit?: {
    remaining: number;
    total: number;
    resetAt: string;
  };
}

// Legacy response (v1.x compatibility)
interface BackendLegacyResponse {
  message: string;
  data: {
    postId: string;
    versionId: string;
    versionNumber: number;
    generatedText: string;
    usage: {
      promptTokens: number;
      completionTokens: number;
      totalTokens: number;
    };
    context: {
      profile: { id: string; name: string };
      project?: { id: string; name: string };
      platform?: { id: string; name: string };
    };
  };
  rateLimit?: {
    remaining: number;
    total: number;
    resetAt: string;
  };
}

interface BackendRateLimitResponse {
  remaining: number;
  total: number;
  resetAt: string;
}

// Default rate limit when not provided by backend
const DEFAULT_RATE_LIMIT: RateLimitStatus = {
  remaining: 10,
  total: 10,
  resetAt: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
};

// ================================
// Type Guards
// ================================

function isV2SingleResponse(
  response: unknown
): response is BackendSingleResponse {
  const r = response as BackendSingleResponse;
  return (
    r?.data !== undefined &&
    "post" in r.data &&
    "version" in r.data &&
    typeof r.data.post?.id === "string"
  );
}

function isV2VariantsResponse(
  response: unknown
): response is BackendVariantsResponse {
  const r = response as BackendVariantsResponse;
  return (
    r?.data !== undefined &&
    "variants" in r.data &&
    Array.isArray(r.data.variants)
  );
}

function isLegacyResponse(
  response: unknown
): response is BackendLegacyResponse {
  const r = response as BackendLegacyResponse;
  return (
    r?.data !== undefined &&
    "postId" in r.data &&
    "generatedText" in r.data &&
    !("post" in r.data) &&
    !("variants" in r.data)
  );
}

// ================================
// Normalization Functions
// ================================

function normalizeRateLimit(
  backendRateLimit?: BackendRateLimitResponse
): RateLimitStatus {
  if (!backendRateLimit) {
    return DEFAULT_RATE_LIMIT;
  }
  return {
    remaining: backendRateLimit.remaining,
    total: backendRateLimit.total,
    resetAt: backendRateLimit.resetAt,
  };
}

// Normalize v2 single response to GeneratedPost
function normalizeV2SingleToPost(
  response: BackendSingleResponse,
  request: GenerateRequest
): GeneratedPost {
  return {
    id: response.data.post.id,
    content: response.data.version.generatedText,
    profileId: request.profileId,
    projectId: request.projectId,
    platformId: request.platformId,
    goal: request.goal,
    rawIdea: request.rawIdea,
    createdAt: new Date().toISOString(),
    versionId: response.data.version.id,
    versionNumber: response.data.version.versionNumber,
    totalVersions: response.data.post.totalVersions,
  };
}

// Normalize legacy response to GeneratedPost
function normalizeLegacyToPost(
  response: BackendLegacyResponse,
  request: GenerateRequest
): GeneratedPost {
  return {
    id: response.data.postId,
    content: response.data.generatedText,
    profileId: response.data.context.profile.id,
    projectId: response.data.context.project?.id,
    platformId: response.data.context.platform?.id,
    goal: request.goal,
    rawIdea: request.rawIdea,
    createdAt: new Date().toISOString(),
    versionId: response.data.versionId,
    versionNumber: response.data.versionNumber,
    totalVersions: 1,
  };
}

// ================================
// API Functions
// ================================

/**
 * Generate a single post (v1.x compatible, works with v2.0 backend)
 */
export async function generatePost(
  request: GenerateRequest
): Promise<GenerateResponse> {
  const response = await apiClient.post<
    BackendSingleResponse | BackendLegacyResponse
  >(GENERATE_ENDPOINT, request);

  // Handle v2.0 single response
  if (isV2SingleResponse(response)) {
    return {
      post: normalizeV2SingleToPost(response, request),
      rateLimit: normalizeRateLimit(response.rateLimit),
      context: {
        historicalPostsUsed: 0,
      },
    };
  }

  // Handle legacy response
  if (isLegacyResponse(response)) {
    return {
      post: normalizeLegacyToPost(response, request),
      rateLimit: normalizeRateLimit(response.rateLimit),
      context: {
        profile: response.data.context.profile,
        project: response.data.context.project,
        platform: response.data.context.platform,
        historicalPostsUsed: 0,
      },
    };
  }

  throw new Error("Unexpected response format from generate endpoint");
}

/**
 * Generate post with variants (v2.0)
 * @param request - Request with optional variants count (1-4)
 * @returns Single response or variants response based on variants count
 */
export async function generateWithVariants(
  request: GenerateWithVariantsRequest
): Promise<GenerateSingleResponse | GenerateVariantsResponse> {
  const response = await apiClient.post<
    BackendSingleResponse | BackendVariantsResponse
  >(GENERATE_ENDPOINT, request);

  // Return as-is for v2.0 responses (they match our types)
  if (isV2VariantsResponse(response)) {
    return {
      message: response.message,
      data: {
        variants: response.data.variants,
        totalVariants: response.data.totalVariants,
        context: response.data.context,
      },
      rateLimit: response.rateLimit,
    };
  }

  if (isV2SingleResponse(response)) {
    return {
      message: response.message,
      data: {
        post: response.data.post,
        version: response.data.version,
      },
      rateLimit: response.rateLimit,
    };
  }

  throw new Error("Unexpected response format from generate endpoint");
}

/**
 * Get rate limit status
 */
export async function getRateLimitStatus(): Promise<RateLimitStatus> {
  const response = await apiClient.get<BackendRateLimitResponse>(
    `${GENERATE_ENDPOINT}/status`
  );

  return normalizeRateLimit(response);
}

// Re-export type guard for use in components
export { isVariantsResponse };
