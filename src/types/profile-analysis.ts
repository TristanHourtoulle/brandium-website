/**
 * Profile Analysis Types
 * Types for AI-powered profile analysis from historical posts
 */

/** Platform count in analysis stats */
export interface AnalysisPlatformCount {
  platformId: string | null;
  count: number;
}

/** Analysis readiness statistics */
export interface AnalysisStats {
  profileId: string;
  totalPosts: number;
  postsWithEngagement: number;
  hasEnoughPosts: boolean;
  minimumRequired: number;
  platforms: AnalysisPlatformCount[];
  readyForAnalysis: boolean;
  message: string;
}

/** Style insights from AI analysis */
export interface StyleInsights {
  averageLength: "short" | "medium" | "long";
  emojiUsage: "none" | "minimal" | "moderate" | "heavy";
  hashtagUsage: "none" | "minimal" | "moderate" | "heavy";
  questionUsage: "none" | "low" | "moderate" | "high";
  callToActionUsage: "none" | "low" | "moderate" | "high";
}

/** AI-generated suggestions for profile */
export interface ProfileSuggestions {
  toneTags: string[];
  doRules: string[];
  dontRules: string[];
  styleInsights: StyleInsights;
}

/** Analysis result from AI */
export interface AnalysisResult {
  totalPostsAnalyzed: number;
  suggestions: ProfileSuggestions;
  confidence: number;
  applied: boolean;
}

/** Analysis response from API */
export interface AnalysisResponse {
  message: string;
  data: AnalysisResult;
}

/** DTO for applying analysis to profile */
export interface ApplyAnalysisDto {
  toneTags: string[];
  doRules: string[];
  dontRules: string[];
}

/** Query parameters for analyze-from-posts endpoint */
export interface AnalyzeFromPostsParams {
  autoApply?: boolean;
  platformId?: string;
  maxPosts?: number;
}
