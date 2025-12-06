// Post Idea types

export interface PostIdea {
  id: string;
  title: string;
  description: string;
  suggestedGoal?: string;
  relevanceScore: number;
  tags: string[];
  isUsed: boolean;
  usedAt?: string;
  postId?: string;
  profile?: { id: string; name: string };
  project?: { id: string; name: string };
  platform?: { id: string; name: string };
  createdAt: string;
  updatedAt?: string;
  generationContext?: IdeaGenerationContext;
}

export interface IdeaGenerationContext {
  mode: "auto" | "manual" | "custom";
  customContext?: string;
  historicalPostsCount: number;
  recentTopicsExcluded: string[];
  timestamp: string;
}

// API Request types
export interface GenerateIdeasRequest {
  profileId?: string;
  projectId?: string;
  platformId?: string;
  auto?: boolean;
  customContext?: string;
  count?: number;
  excludeRecentTopics?: boolean;
}

// API Response types
export interface GenerateIdeasResponse {
  message: string;
  data: {
    ideas: PostIdea[];
    context: {
      profile?: { id: string; name: string };
      project?: { id: string; name: string };
      platform?: { id: string; name: string };
      historicalPostsAnalyzed: number;
    };
    usage: {
      promptTokens: number;
      completionTokens: number;
      totalTokens: number;
    };
  };
}

export interface IdeaApiResponse {
  id: string;
  title: string;
  description: string;
  suggestedGoal?: string;
  relevanceScore: number;
  tags: string[];
  isUsed: boolean;
  usedAt?: string;
  postId?: string;
  profile?: { id: string; name: string };
  project?: { id: string; name: string };
  platform?: { id: string; name: string };
  createdAt: string;
  updatedAt?: string;
  generationContext?: IdeaGenerationContext;
}

export interface IdeasApiResponse {
  data: IdeaApiResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface IdeasResponse {
  ideas: PostIdea[];
  pagination: IdeaPaginationInfo;
}

export interface IdeaPaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export interface IdeaFilters {
  profileId?: string;
  projectId?: string;
  platformId?: string;
  isUsed?: boolean;
  page?: number;
  limit?: number;
}

export interface IdeaQueryParams {
  profileId?: string;
  projectId?: string;
  platformId?: string;
  isUsed?: string;
  page?: string;
  limit?: string;
}

export interface MarkIdeaAsUsedRequest {
  postId?: string;
}

export interface MarkIdeaAsUsedResponse {
  message: string;
  data: {
    id: string;
    title: string;
    isUsed: boolean;
    usedAt: string;
    postId?: string;
  };
}

export interface DeleteBulkIdeasRequest {
  ids: string[];
}

export interface DeleteBulkIdeasResponse {
  message: string;
  deletedCount: number;
}
