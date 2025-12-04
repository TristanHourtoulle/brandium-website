export interface Post {
  id: string;
  userId: string;
  content: string; // Mapped from generatedText
  platformId?: string;
  profileId?: string;
  projectId?: string;
  goal?: string;
  rawIdea: string;
  createdAt: string;
  updatedAt: string;

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
}

// Raw API response structure
export interface PostApiResponse {
  id: string;
  userId: string;
  generatedText: string;
  platformId?: string;
  profileId?: string;
  projectId?: string;
  goal?: string;
  rawIdea: string;
  createdAt: string;
  updatedAt: string;
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
