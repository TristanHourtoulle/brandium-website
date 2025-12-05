/**
 * Token usage statistics for AI generation
 */
export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

/**
 * Represents a single version of a post
 */
export interface PostVersion {
  id: string;
  versionNumber: number;
  generatedText: string;
  iterationPrompt: string | null;
  isSelected: boolean;
  usage: TokenUsage;
  createdAt: string;
}

/**
 * Request payload for creating a new iteration
 */
export interface IterateRequest {
  iterationPrompt: string;
  maxTokens?: number;
}

/**
 * Response from creating a new iteration
 */
export interface IterateResponse {
  versionId: string;
  versionNumber: number;
  generatedText: string;
  iterationPrompt: string;
  isSelected: boolean;
  usage: TokenUsage;
}

/**
 * Response from fetching all versions of a post
 */
export interface VersionsResponse {
  postId: string;
  totalVersions: number;
  versions: PostVersion[];
}

/**
 * Backend API response wrapper for iterate endpoint
 */
export interface IterateApiResponse {
  message: string;
  data: IterateResponse;
}

/**
 * Backend API response wrapper for versions endpoint
 */
export interface VersionsApiResponse {
  message: string;
  data: VersionsResponse;
}

/**
 * Backend API response wrapper for single version endpoint
 */
export interface VersionApiResponse {
  message: string;
  data: PostVersion;
}
