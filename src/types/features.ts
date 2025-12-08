/**
 * New feature types for Brandium v2.0
 * Includes: Hooks, Templates, Variants, Enhanced PostVersion
 */

// ================================
// Hook Types
// ================================

export type HookType = "question" | "stat" | "story" | "bold_opinion";

export interface Hook {
  type: HookType;
  text: string;
  estimatedEngagement: number; // 1-10
}

export interface GenerateHooksRequest {
  rawIdea: string;
  goal?: string;
  profileId?: string;
  count?: number; // 1-10, default: 4
}

export interface GenerateHooksResponse {
  message: string;
  data: {
    hooks: Hook[];
    totalHooks: number;
  };
}

// ================================
// Template Types
// ================================

export type TemplateCategory =
  | "announcement"
  | "tutorial"
  | "experience"
  | "question"
  | "tip"
  | "milestone"
  | "behind-the-scenes"
  | "testimonial"
  | "poll"
  | "event";

export interface TemplateVariable {
  name: string;
  description: string;
  required: boolean;
  defaultValue?: string;
}

export interface Template {
  id: string;
  userId: string | null; // NULL for system templates
  profileId: string | null;
  name: string;
  description: string | null;
  category: TemplateCategory;
  content: string; // Template with {{variables}}
  variables: TemplateVariable[];
  exampleVariables: Record<string, string> | null;
  platformId: string | null;
  isSystem: boolean;
  isPublic: boolean;
  usageCount: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface TemplateFilters {
  category?: TemplateCategory;
  isSystem?: boolean;
  isPublic?: boolean;
  profileId?: string;
  platformId?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface CreateTemplateRequest {
  name: string;
  description?: string;
  category: TemplateCategory;
  content: string;
  variables: TemplateVariable[];
  exampleVariables?: Record<string, string>;
  profileId?: string;
  platformId?: string;
  isPublic?: boolean;
  tags?: string[];
}

export interface UpdateTemplateRequest {
  name?: string;
  description?: string;
  category?: TemplateCategory;
  content?: string;
  variables?: TemplateVariable[];
  exampleVariables?: Record<string, string>;
  profileId?: string;
  platformId?: string;
  isPublic?: boolean;
  tags?: string[];
}

export interface GenerateFromTemplateRequest {
  templateId: string;
  variables: Record<string, string>;
  profileId?: string;
  platformId?: string;
}

export interface RenderTemplateRequest {
  variables: Record<string, string>;
}

export interface RenderTemplateResponse {
  message: string;
  data: {
    rendered: string;
    template: {
      id: string;
      name: string;
    };
    missingVariables: string[];
    unusedVariables: string[];
  };
}

export interface TemplatesApiResponse {
  message: string;
  data: {
    templates: Template[];
    total: number;
    page: number;
    totalPages: number;
  };
}

export interface TemplateApiResponse {
  message: string;
  data: {
    template: Template;
  };
}

export interface TemplateSuggestion {
  template: Template;
  matchScore: number;
  matchReason: string;
}

export interface TemplateSuggestionsResponse {
  message: string;
  data: {
    suggestions: TemplateSuggestion[];
    totalSuggestions: number;
  };
}

export interface TemplateStatistics {
  totalTemplates: number;
  userTemplates: number;
  systemTemplates: number;
  publicTemplates: number;
  mostUsed: {
    id: string;
    name: string;
    category: TemplateCategory;
    usageCount: number;
  }[];
  byCategory: Record<TemplateCategory, number>;
}

// ================================
// Iteration Types (Enhanced)
// ================================

export type IterationType =
  | "shorter"
  | "stronger_hook"
  | "more_personal"
  | "add_data"
  | "simplify"
  | "custom";

export type VariantApproach =
  | "direct"
  | "storytelling"
  | "data-driven"
  | "emotional";

export type LinkedInFormat = "story" | "opinion" | "debate";

/**
 * Enhanced PostVersion with new fields from v2.0
 */
export interface PostVersionV2 {
  id: string;
  postId: string;
  versionNumber: number;
  generatedText: string;
  iterationType: IterationType | null; // NULL for initial version
  iterationPrompt: string | null;
  approach: VariantApproach | null;
  format: LinkedInFormat;
  isSelected: boolean;
  promptTokens: number | null;
  completionTokens: number | null;
  totalTokens: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface IteratePostRequest {
  type: IterationType;
  feedback?: string; // Required if type='custom'
  maxTokens?: number;
}

export interface IteratePostResponse {
  message: string;
  data: {
    version: PostVersionV2;
    post: {
      id: string;
      totalVersions: number;
    };
  };
}

export interface SelectVersionResponse {
  message: string;
  data: {
    version: {
      id: string;
      versionNumber: number;
      isSelected: boolean;
    };
  };
}

// ================================
// Variant Generation Types
// ================================

export interface GenerateWithVariantsRequest {
  rawIdea: string;
  goal?: string;
  profileId?: string;
  projectId?: string;
  platformId?: string;
  variants?: number; // 1-4, default: 1
}

export interface VariantData {
  postId: string;
  versionId: string;
  versionNumber: number;
  generatedText: string;
  approach: VariantApproach;
  format: LinkedInFormat;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

// Response when variants=1 (default behavior)
export interface GenerateSingleResponse {
  message: string;
  data: {
    post: {
      id: string;
      totalVersions: number;
    };
    version: {
      id: string;
      versionNumber: number;
      generatedText: string;
      isSelected: boolean;
      approach: VariantApproach | null;
      format: LinkedInFormat;
      usage: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
      };
    };
  };
  rateLimit?: {
    remaining: number;
    total: number;
    resetAt: string;
  };
}

// Response when variants >= 2
export interface GenerateVariantsResponse {
  message: string;
  data: {
    variants: VariantData[];
    totalVariants: number;
    context: {
      profile?: { id: string; name: string };
      project?: { id: string; name: string };
      platform?: { id: string; name: string };
      historicalPostsUsed: number;
    };
  };
  rateLimit?: {
    remaining: number;
    total: number;
    resetAt: string;
  };
}

// Union type for generate response
export type GenerateResponseV2 = GenerateSingleResponse | GenerateVariantsResponse;

// Type guard for variant response
export function isVariantsResponse(
  response: GenerateResponseV2
): response is GenerateVariantsResponse {
  return "variants" in response.data;
}

// ================================
// Enhanced Post Ideas Types
// ================================

export interface GenerateIdeasRequestV2 {
  theme: string;
  goal?: string;
  profileId?: string;
  count?: number; // 3-20, default: 10
}

export interface PostIdeaV2 {
  id: string;
  userId: string;
  title: string;
  description: string;
  suggestedGoal: string | null;
  relevanceScore: number; // 1-10
  tags: string[];
  generationContext: {
    theme: string;
    profileId?: string;
    goal?: string;
  };
  isUsed: boolean;
  usedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface GenerateIdeasResponseV2 {
  message: string;
  data: {
    ideas: PostIdeaV2[];
    totalIdeas: number;
    usage: {
      promptTokens: number;
      completionTokens: number;
      totalTokens: number;
    };
  };
}

export interface UseIdeaRequest {
  profileId?: string;
  platformId?: string;
  variants?: number; // 1-4, default: 1
}

export interface UseIdeaResponse {
  message: string;
  data: {
    idea: {
      id: string;
      isUsed: boolean;
      usedAt: string;
    };
    post: {
      id: string;
      totalVersions: number;
    };
    version: {
      id: string;
      versionNumber: number;
      generatedText: string;
      usage: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
      };
    };
  };
}

// ================================
// Historical Post Types (Enhanced)
// ================================

export interface HistoricalPostV2 {
  id: string;
  userId: string;
  siteIdentifier: string;
  content: string;
  publishedAt: string;
  externalUrl: string | null;
  engagement: {
    likes?: number;
    comments?: number;
    shares?: number;
    views?: number;
    engagementRate?: number;
  };
  metadata: {
    platform?: string;
    format?: string;
    topics?: string[];
    performance?: "low" | "medium" | "high";
  };
  createdAt: string;
  updatedAt: string;
}

// ================================
// Enhanced Post Type with Versions
// ================================

export interface PostWithVersions {
  id: string;
  userId: string;
  profileId: string | null;
  projectId: string | null;
  platformId: string | null;
  goal: string | null;
  rawIdea: string;
  totalVersions: number;
  createdAt: string;
  updatedAt: string;
  // Relations
  profile?: { id: string; name: string };
  project?: { id: string; name: string };
  platform?: { id: string; name: string };
  // Versions array (populated in GET requests)
  versions?: PostVersionV2[];
}

// ================================
// Generate from Template Response
// ================================

export interface GenerateFromTemplateResponse {
  message: string;
  data: {
    post: {
      id: string;
      totalVersions: number;
    };
    version: {
      id: string;
      versionNumber: number;
      generatedText: string;
      isSelected: boolean;
      usage: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
      };
    };
    template: {
      id: string;
      name: string;
      usageCount: number;
    };
  };
}
