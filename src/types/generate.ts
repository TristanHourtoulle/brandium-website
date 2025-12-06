export interface GenerateRequest {
  profileId: string;
  projectId?: string;
  platformId?: string;
  goal?: string;
  rawIdea: string;
}

export interface GeneratedPost {
  id: string;
  content: string;
  profileId: string;
  projectId?: string;
  platformId?: string;
  goal?: string;
  rawIdea: string;
  createdAt: string;
  // Version tracking
  versionId?: string;
  versionNumber?: number;
  totalVersions?: number;
}

export interface RateLimitStatus {
  remaining: number;
  total: number;
  resetAt: string;
}

/** Context information about what influenced the generation */
export interface GenerationContext {
  profile?: { id: string; name: string };
  project?: { id: string; name: string };
  platform?: { id: string; name: string };
  historicalPostsUsed: number;
}

export interface GenerateResponse {
  post: GeneratedPost;
  rateLimit: RateLimitStatus;
  context?: GenerationContext;
}
