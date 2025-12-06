import { apiClient } from "./client";
import type {
  AnalysisStats,
  AnalysisResponse,
  ApplyAnalysisDto,
  AnalyzeFromPostsParams,
} from "@/types";
import type { Profile } from "@/types";

/**
 * Build query string from analysis params
 */
function buildAnalysisQueryString(params?: AnalyzeFromPostsParams): string {
  if (!params) return "";

  const searchParams = new URLSearchParams();

  if (params.autoApply !== undefined) {
    searchParams.set("autoApply", params.autoApply.toString());
  }
  if (params.platformId) {
    searchParams.set("platformId", params.platformId);
  }
  if (params.maxPosts !== undefined) {
    searchParams.set("maxPosts", params.maxPosts.toString());
  }

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : "";
}

/**
 * Get analysis statistics for a profile
 * Returns information about whether the profile has enough posts for analysis
 */
export async function getAnalysisStats(profileId: string): Promise<AnalysisStats> {
  const response = await apiClient.get<{ data: AnalysisStats }>(
    `/api/profiles/${profileId}/analysis-stats`
  );
  return response.data;
}

/**
 * Analyze profile from historical posts
 * Generates tone tags, do/don't rules, and style insights
 */
export async function analyzeProfileFromPosts(
  profileId: string,
  params?: AnalyzeFromPostsParams
): Promise<AnalysisResponse> {
  const queryString = buildAnalysisQueryString(params);
  return apiClient.post<AnalysisResponse>(
    `/api/profiles/${profileId}/analyze-from-posts${queryString}`
  );
}

/**
 * Apply analysis suggestions to a profile
 * Updates the profile with the provided tone tags and rules
 */
export async function applyAnalysis(
  profileId: string,
  data: ApplyAnalysisDto
): Promise<Profile> {
  const response = await apiClient.post<{ data: Profile; message: string }>(
    `/api/profiles/${profileId}/apply-analysis`,
    data
  );
  return response.data;
}
