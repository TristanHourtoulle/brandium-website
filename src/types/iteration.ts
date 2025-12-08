import type { IterationType, VariantApproach, LinkedInFormat } from "./features";

/**
 * Token usage statistics for AI generation
 */
export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

/**
 * Represents a single version of a post (v2.0 enhanced)
 */
export interface PostVersion {
  id: string;
  postId?: string;
  versionNumber: number;
  generatedText: string;
  iterationType?: IterationType | null; // NEW: Type of iteration (shorter, stronger_hook, etc.)
  iterationPrompt: string | null;
  approach?: VariantApproach | null; // NEW: Variant approach used
  format?: LinkedInFormat; // NEW: LinkedIn format (story, opinion, debate)
  isSelected: boolean;
  usage: TokenUsage;
  // Token fields can also be at root level (for v2.0 compatibility)
  promptTokens?: number | null;
  completionTokens?: number | null;
  totalTokens?: number | null;
  createdAt: string;
  updatedAt?: string;
}

/**
 * Request payload for creating a new iteration (v2.0 enhanced)
 * Now uses type-based iterations instead of free-form prompts
 */
export interface IterateRequest {
  /** @deprecated Use 'type' for v2.0 iterations */
  iterationPrompt?: string;
  /** The type of iteration to apply */
  type?: IterationType;
  /** Required if type='custom', ignored otherwise */
  feedback?: string;
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
