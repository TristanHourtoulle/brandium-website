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

export interface GenerateResponse {
  post: GeneratedPost;
  rateLimit: RateLimitStatus;
}
