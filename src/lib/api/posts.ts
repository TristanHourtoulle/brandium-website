import { apiClient } from "./client";
import type {
  Post,
  PostsResponse,
  PostFilters,
  PostsQueryParams,
  PostsApiResponse,
  PostApiResponse,
} from "@/types";

/**
 * Build query string from filters
 */
function buildQueryString(filters: PostFilters): string {
  const params: PostsQueryParams = {};

  if (filters.search) params.search = filters.search;
  if (filters.platformId) params.platformId = filters.platformId;
  if (filters.profileId) params.profileId = filters.profileId;
  if (filters.projectId) params.projectId = filters.projectId;
  if (filters.page) params.page = String(filters.page);
  if (filters.limit) params.limit = String(filters.limit);

  const queryString = new URLSearchParams(
    params as Record<string, string>
  ).toString();
  return queryString ? `?${queryString}` : "";
}

/**
 * Transform API post response to frontend Post type
 */
function transformPost(apiPost: PostApiResponse): Post {
  return {
    id: apiPost.id,
    userId: apiPost.userId,
    content: apiPost.generatedText, // Map generatedText to content
    platformId: apiPost.platformId,
    profileId: apiPost.profileId,
    projectId: apiPost.projectId,
    goal: apiPost.goal,
    rawIdea: apiPost.rawIdea,
    createdAt: apiPost.createdAt,
    updatedAt: apiPost.updatedAt,
    platform: apiPost.platform,
    profile: apiPost.profile,
    project: apiPost.project,
  };
}

/**
 * Transform API pagination to frontend pagination format
 */
function transformPagination(apiPagination: PostsApiResponse["pagination"]): PostsResponse["pagination"] {
  return {
    currentPage: apiPagination.page,
    totalPages: apiPagination.totalPages,
    totalItems: apiPagination.total,
    itemsPerPage: apiPagination.limit,
  };
}

/**
 * Fetch paginated list of posts with optional filters
 */
export async function fetchPosts(
  filters: PostFilters = {}
): Promise<PostsResponse> {
  const queryString = buildQueryString(filters);
  const response = await apiClient.get<PostsApiResponse>(`/api/posts${queryString}`);

  return {
    posts: response.data.map(transformPost),
    pagination: transformPagination(response.pagination),
  };
}

/**
 * Fetch a single post by ID
 */
export async function fetchPostById(id: string): Promise<Post> {
  const response = await apiClient.get<{ data: PostApiResponse }>(`/api/posts/${id}`);
  return transformPost(response.data);
}

/**
 * Delete a post by ID
 */
export async function deletePost(id: string): Promise<void> {
  await apiClient.delete<void>(`/api/posts/${id}`);
}
