import type { PostVersion } from "./iteration";

export interface Post {
  id: string;
  userId: string;
  content: string; // Mapped from generatedText or selectedVersion.generatedText
  platformId?: string;
  profileId?: string;
  projectId?: string;
  goal?: string;
  rawIdea: string;
  createdAt: string;
  updatedAt: string;

  // Version tracking
  currentVersionId?: string;
  totalVersions: number;

  // Populated relations (from API)
  platform?: {
    id: string;
    name: string;
  };
  profile?: {
    id: string;
    name: string;
  };
  project?: {
    id: string;
    name: string;
  };

  // v2.0: Versions array (populated in GET /api/posts/:id)
  versions?: PostVersion[];
  // v2.0: Selected version (convenience field)
  selectedVersion?: PostVersion;
}

/**
 * Raw API response structure for a post version
 */
export interface PostVersionApiResponse {
  id: string;
  versionNumber: number;
  generatedText: string;
  iterationType?: string | null;
  iterationPrompt?: string | null;
  approach?: string | null;
  format?: string;
  isSelected: boolean;
  promptTokens?: number | null;
  completionTokens?: number | null;
  totalTokens?: number | null;
  createdAt: string;
  updatedAt?: string;
}

/**
 * Raw API response structure (v2.0 enhanced)
 * Note: generatedText is DEPRECATED in v2.0 - use versions array instead
 */
export interface PostApiResponse {
  id: string;
  userId: string;
  /** @deprecated In v2.0, use versions[].generatedText instead */
  generatedText?: string;
  platformId?: string;
  profileId?: string;
  projectId?: string;
  goal?: string;
  rawIdea: string;
  createdAt: string;
  updatedAt: string;
  currentVersionId?: string;
  totalVersions: number;
  platform?: {
    id: string;
    name: string;
  };
  profile?: {
    id: string;
    name: string;
  };
  project?: {
    id: string;
    name: string;
  };
  // v2.0: Versions array (included in GET /api/posts/:id)
  versions?: PostVersionApiResponse[];
}

export interface PostsApiResponse {
  data: PostApiResponse[];
  pagination: ApiPaginationInfo;
}

export interface ApiPaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PostsResponse {
  posts: Post[];
  pagination: PaginationInfo;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export interface PostFilters {
  search?: string;
  platformId?: string;
  profileId?: string;
  projectId?: string;
  page?: number;
  limit?: number;
}

export interface PostsQueryParams {
  search?: string;
  platformId?: string;
  profileId?: string;
  projectId?: string;
  page?: string;
  limit?: string;
}
