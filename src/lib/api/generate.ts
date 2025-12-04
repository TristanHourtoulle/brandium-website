import { apiClient } from "./client";
import type {
  GenerateRequest,
  GeneratedPost,
  GenerateResponse,
  RateLimitStatus,
} from "@/types";

const GENERATE_ENDPOINT = "/api/generate";

// Backend response types (matching actual backend response)
interface BackendGenerateResponse {
  message: string;
  data: {
    postId: string;
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

// Normalize backend response to frontend types
function normalizeGeneratedPost(
  backendData: BackendGenerateResponse["data"],
  request: GenerateRequest
): GeneratedPost {
  return {
    id: backendData.postId,
    content: backendData.generatedText,
    profileId: backendData.context.profile.id,
    projectId: backendData.context.project?.id,
    platformId: backendData.context.platform?.id,
    goal: request.goal,
    rawIdea: request.rawIdea,
    createdAt: new Date().toISOString(),
  };
}

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

export async function generatePost(
  request: GenerateRequest
): Promise<GenerateResponse> {
  const response = await apiClient.post<BackendGenerateResponse>(
    GENERATE_ENDPOINT,
    request
  );

  return {
    post: normalizeGeneratedPost(response.data, request),
    rateLimit: normalizeRateLimit(response.rateLimit),
  };
}

export async function getRateLimitStatus(): Promise<RateLimitStatus> {
  const response = await apiClient.get<BackendRateLimitResponse>(
    `${GENERATE_ENDPOINT}/status`
  );

  return normalizeRateLimit(response);
}
