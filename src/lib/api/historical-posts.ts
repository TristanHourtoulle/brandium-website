import { apiClient } from "./client";
import type {
  HistoricalPost,
  HistoricalPostsListResponse,
  HistoricalPostResponse,
  HistoricalPostsStats,
  BulkImportResponse,
  CreateHistoricalPostDto,
  UpdateHistoricalPostDto,
  BulkImportHistoricalPostsDto,
  HistoricalPostsQueryParams,
} from "@/types";

/**
 * Build the historical posts endpoint URL for a profile
 */
function getEndpoint(profileId: string, postId?: string): string {
  const base = `/api/profiles/${profileId}/historical-posts`;
  return postId ? `${base}/${postId}` : base;
}

/**
 * Build query string from params
 */
function buildQueryString(params?: HistoricalPostsQueryParams): string {
  if (!params) return "";

  const searchParams = new URLSearchParams();

  if (params.page !== undefined) {
    searchParams.set("page", params.page.toString());
  }
  if (params.limit !== undefined) {
    searchParams.set("limit", params.limit.toString());
  }
  if (params.platformId) {
    searchParams.set("platformId", params.platformId);
  }
  if (params.sortBy) {
    searchParams.set("sortBy", params.sortBy);
  }
  if (params.order) {
    searchParams.set("order", params.order);
  }

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : "";
}

/**
 * Get paginated list of historical posts for a profile
 */
export async function getHistoricalPosts(
  profileId: string,
  params?: HistoricalPostsQueryParams
): Promise<HistoricalPostsListResponse> {
  const queryString = buildQueryString(params);
  return apiClient.get<HistoricalPostsListResponse>(
    `${getEndpoint(profileId)}${queryString}`
  );
}

/**
 * Get a single historical post by ID
 */
export async function getHistoricalPost(
  profileId: string,
  postId: string
): Promise<HistoricalPost> {
  const response = await apiClient.get<HistoricalPostResponse>(
    getEndpoint(profileId, postId)
  );
  return response.data;
}

/**
 * Create a new historical post
 */
export async function createHistoricalPost(
  profileId: string,
  data: CreateHistoricalPostDto
): Promise<HistoricalPost> {
  const response = await apiClient.post<HistoricalPostResponse>(
    getEndpoint(profileId),
    data
  );
  return response.data;
}

/**
 * Update an existing historical post
 */
export async function updateHistoricalPost(
  profileId: string,
  postId: string,
  data: UpdateHistoricalPostDto
): Promise<HistoricalPost> {
  const response = await apiClient.patch<HistoricalPostResponse>(
    getEndpoint(profileId, postId),
    data
  );
  return response.data;
}

/**
 * Delete a historical post
 */
export async function deleteHistoricalPost(
  profileId: string,
  postId: string
): Promise<void> {
  await apiClient.delete(getEndpoint(profileId, postId));
}

/**
 * Bulk import historical posts (max 100)
 */
export async function bulkImportHistoricalPosts(
  profileId: string,
  data: BulkImportHistoricalPostsDto
): Promise<BulkImportResponse> {
  return apiClient.post<BulkImportResponse>(
    `${getEndpoint(profileId)}/bulk`,
    data
  );
}

/**
 * Get statistics for historical posts of a profile
 */
export async function getHistoricalPostsStats(
  profileId: string
): Promise<HistoricalPostsStats> {
  const response = await apiClient.get<{ data: HistoricalPostsStats }>(
    `${getEndpoint(profileId)}/stats`
  );
  return response.data;
}
