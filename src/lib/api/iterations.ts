import { apiClient } from "./client";
import type {
  IterateRequest,
  IterateResponse,
  IterateApiResponse,
  PostVersion,
  VersionsResponse,
  VersionsApiResponse,
  VersionApiResponse,
} from "@/types";

/**
 * Create a new iteration of a post
 * @param postId - The ID of the post to iterate on
 * @param request - The iteration request containing the prompt
 * @returns The new version created
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
 * Select a version as the current one
 * Updates the parent post's generatedText to match
 * @param postId - The ID of the post
 * @param versionId - The ID of the version to select
 * @returns The selected version
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
