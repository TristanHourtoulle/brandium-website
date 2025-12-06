import { apiClient } from "./client";
import type {
  PostIdea,
  IdeaApiResponse,
  IdeasApiResponse,
  IdeasResponse,
  IdeaFilters,
  IdeaQueryParams,
  GenerateIdeasRequest,
  GenerateIdeasResponse,
  MarkIdeaAsUsedRequest,
  MarkIdeaAsUsedResponse,
  DeleteBulkIdeasRequest,
  DeleteBulkIdeasResponse,
} from "@/types";

/**
 * Build query string from filters
 */
function buildQueryString(filters: IdeaFilters): string {
  const params: IdeaQueryParams = {};

  if (filters.profileId) params.profileId = filters.profileId;
  if (filters.projectId) params.projectId = filters.projectId;
  if (filters.platformId) params.platformId = filters.platformId;
  if (filters.isUsed !== undefined) params.isUsed = String(filters.isUsed);
  if (filters.page) params.page = String(filters.page);
  if (filters.limit) params.limit = String(filters.limit);

  const queryString = new URLSearchParams(
    params as Record<string, string>
  ).toString();
  return queryString ? `?${queryString}` : "";
}

/**
 * Transform API idea response to frontend PostIdea type
 */
function transformIdea(apiIdea: IdeaApiResponse): PostIdea {
  return {
    id: apiIdea.id,
    title: apiIdea.title,
    description: apiIdea.description,
    suggestedGoal: apiIdea.suggestedGoal,
    relevanceScore: apiIdea.relevanceScore,
    tags: apiIdea.tags,
    isUsed: apiIdea.isUsed,
    usedAt: apiIdea.usedAt,
    postId: apiIdea.postId,
    profile: apiIdea.profile,
    project: apiIdea.project,
    platform: apiIdea.platform,
    createdAt: apiIdea.createdAt,
    updatedAt: apiIdea.updatedAt,
    generationContext: apiIdea.generationContext,
  };
}

/**
 * Transform API pagination to frontend pagination format
 */
function transformPagination(
  apiPagination: IdeasApiResponse["pagination"]
): IdeasResponse["pagination"] {
  return {
    currentPage: apiPagination.page,
    totalPages: apiPagination.totalPages,
    totalItems: apiPagination.total,
    itemsPerPage: apiPagination.limit,
  };
}

/**
 * Generate new post ideas
 */
export async function generateIdeas(
  request: GenerateIdeasRequest
): Promise<GenerateIdeasResponse> {
  return apiClient.post<GenerateIdeasResponse>("/api/ideas/generate", request);
}

/**
 * Fetch paginated list of ideas with optional filters
 */
export async function fetchIdeas(
  filters: IdeaFilters = {}
): Promise<IdeasResponse> {
  const queryString = buildQueryString(filters);
  const response = await apiClient.get<IdeasApiResponse>(
    `/api/ideas${queryString}`
  );

  return {
    ideas: response.data.map(transformIdea),
    pagination: transformPagination(response.pagination),
  };
}

/**
 * Fetch a single idea by ID
 */
export async function fetchIdeaById(id: string): Promise<PostIdea> {
  const response = await apiClient.get<{ data: IdeaApiResponse }>(
    `/api/ideas/${id}`
  );
  return transformIdea(response.data);
}

/**
 * Mark an idea as used
 */
export async function markIdeaAsUsed(
  id: string,
  postId?: string
): Promise<MarkIdeaAsUsedResponse> {
  const request: MarkIdeaAsUsedRequest = {};
  if (postId) {
    request.postId = postId;
  }
  return apiClient.post<MarkIdeaAsUsedResponse>(`/api/ideas/${id}/use`, request);
}

/**
 * Delete a single idea by ID
 */
export async function deleteIdea(id: string): Promise<void> {
  await apiClient.delete<void>(`/api/ideas/${id}`);
}

/**
 * Delete multiple ideas at once
 */
export async function deleteBulkIdeas(
  ids: string[]
): Promise<DeleteBulkIdeasResponse> {
  const request: DeleteBulkIdeasRequest = { ids };
  return apiClient.delete<DeleteBulkIdeasResponse>("/api/ideas", {
    body: JSON.stringify(request),
  });
}
