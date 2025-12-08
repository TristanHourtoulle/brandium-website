import { apiClient } from "./client";
import type {
  Post,
  PostsResponse,
  PostFilters,
  PostsQueryParams,
  PostsApiResponse,
  PostApiResponse,
  PostVersion,
  PostVersionApiResponse,
  IterationType,
  VariantApproach,
  LinkedInFormat,
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
 * Transform API version response to frontend PostVersion type
 */
function transformVersion(apiVersion: PostVersionApiResponse): PostVersion {
  return {
    id: apiVersion.id,
    versionNumber: apiVersion.versionNumber,
    generatedText: apiVersion.generatedText,
    iterationType: apiVersion.iterationType as IterationType | null | undefined,
    iterationPrompt: apiVersion.iterationPrompt ?? null,
    approach: apiVersion.approach as VariantApproach | null | undefined,
    format: (apiVersion.format as LinkedInFormat) || "opinion",
    isSelected: apiVersion.isSelected,
    usage: {
      promptTokens: apiVersion.promptTokens ?? 0,
      completionTokens: apiVersion.completionTokens ?? 0,
      totalTokens: apiVersion.totalTokens ?? 0,
    },
    promptTokens: apiVersion.promptTokens,
    completionTokens: apiVersion.completionTokens,
    totalTokens: apiVersion.totalTokens,
    createdAt: apiVersion.createdAt,
    updatedAt: apiVersion.updatedAt,
  };
}

/**
 * Transform API post response to frontend Post type
 * Handles both v1.x (generatedText) and v2.0 (versions array) responses
 */
function transformPost(apiPost: PostApiResponse): Post {
  // Transform versions if present (v2.0)
  const versions = apiPost.versions?.map(transformVersion);

  // Find selected version or use the latest one
  const selectedVersion = versions?.find((v) => v.isSelected) ?? versions?.[versions.length - 1];

  // Get content from selected version or fallback to generatedText (v1.x compatibility)
  const content = selectedVersion?.generatedText ?? apiPost.generatedText ?? "";

  return {
    id: apiPost.id,
    userId: apiPost.userId,
    content,
    platformId: apiPost.platformId,
    profileId: apiPost.profileId,
    projectId: apiPost.projectId,
    goal: apiPost.goal,
    rawIdea: apiPost.rawIdea,
    createdAt: apiPost.createdAt,
    updatedAt: apiPost.updatedAt,
    // Version tracking
    currentVersionId: apiPost.currentVersionId,
    totalVersions: apiPost.totalVersions ?? versions?.length ?? 1,
    // Relations
    platform: apiPost.platform,
    profile: apiPost.profile,
    project: apiPost.project,
    // v2.0: Include versions array
    versions,
    selectedVersion,
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
 * Fetch a single post by ID (includes versions in v2.0)
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

/**
 * Get the content to display for a post
 * Uses selected version content or falls back to post.content
 */
export function getPostDisplayContent(post: Post): string {
  return post.selectedVersion?.generatedText ?? post.content;
}

/**
 * Get the version info for display
 */
export function getPostVersionInfo(post: Post): {
  currentVersion: number;
  totalVersions: number;
  hasMultipleVersions: boolean;
} {
  const currentVersion = post.selectedVersion?.versionNumber ?? 1;
  const totalVersions = post.totalVersions ?? post.versions?.length ?? 1;

  return {
    currentVersion,
    totalVersions,
    hasMultipleVersions: totalVersions > 1,
  };
}
