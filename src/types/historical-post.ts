/**
 * Historical Post Types
 * Types for managing historical social media posts imported by users
 */

/** Engagement metrics for a historical post */
export interface PostEngagement {
  likes?: number;
  comments?: number;
  shares?: number;
  views?: number;
}

/** Metadata for a historical post */
export interface PostMetadata {
  hashtags?: string[];
  mentions?: string[];
  [key: string]: unknown;
}

/** Platform information included in post responses */
export interface PostPlatform {
  id: string;
  name: string;
}

/** Historical post entity */
export interface HistoricalPost {
  id: string;
  profileId: string;
  platformId?: string;
  content: string;
  publishedAt: string;
  externalUrl?: string;
  engagement?: PostEngagement;
  metadata?: PostMetadata;
  platform?: PostPlatform;
  createdAt: string;
  updatedAt: string;
}

/** DTO for creating a historical post */
export interface CreateHistoricalPostDto {
  content: string;
  platformId?: string;
  publishedAt?: string;
  externalUrl?: string;
  engagement?: PostEngagement;
  metadata?: PostMetadata;
}

/** DTO for updating a historical post */
export interface UpdateHistoricalPostDto {
  content?: string;
  platformId?: string;
  publishedAt?: string;
  externalUrl?: string;
  engagement?: PostEngagement;
  metadata?: PostMetadata;
}

/** DTO for bulk importing historical posts */
export interface BulkImportHistoricalPostsDto {
  posts: CreateHistoricalPostDto[];
}

/** Platform statistics in historical posts stats */
export interface PlatformPostStats {
  platformId: string | null;
  platformName: string | null;
  count: number;
}

/** Engagement statistics */
export interface EngagementStats {
  postsWithEngagement: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  totalViews: number;
  averageLikes: number;
  averageComments: number;
}

/** Date range for posts */
export interface PostDateRange {
  oldest: string | null;
  newest: string | null;
}

/** Historical posts statistics response */
export interface HistoricalPostsStats {
  totalPosts: number;
  byPlatform: PlatformPostStats[];
  engagement: EngagementStats;
  dateRange: PostDateRange;
}

/** Pagination info for historical posts list responses */
export interface HistoricalPostsPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/** Paginated historical posts response */
export interface HistoricalPostsListResponse {
  data: HistoricalPost[];
  pagination: HistoricalPostsPagination;
}

/** Single historical post response */
export interface HistoricalPostResponse {
  data: HistoricalPost;
  message?: string;
}

/** Bulk import error detail */
export interface BulkImportError {
  index: number;
  reason: string;
}

/** Bulk import response */
export interface BulkImportResponse {
  message: string;
  created: number;
  failed: number;
  errors: BulkImportError[];
  data: HistoricalPost[];
}

/** Query parameters for listing historical posts */
export interface HistoricalPostsQueryParams {
  page?: number;
  limit?: number;
  platformId?: string;
  sortBy?: "publishedAt" | "createdAt" | "updatedAt";
  order?: "ASC" | "DESC";
}
