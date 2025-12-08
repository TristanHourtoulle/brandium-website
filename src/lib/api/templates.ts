import { apiClient } from "./client";
import type {
  Template,
  TemplateFilters,
  TemplatesApiResponse,
  TemplateApiResponse,
  CreateTemplateRequest,
  UpdateTemplateRequest,
  RenderTemplateRequest,
  RenderTemplateResponse,
  GenerateFromTemplateRequest,
  GenerateFromTemplateResponse,
  TemplateSuggestionsResponse,
  TemplateStatistics,
  TemplateCategory,
} from "@/types";

const TEMPLATES_ENDPOINT = "/api/templates";

// ================================
// Template Category Metadata
// ================================

export const TEMPLATE_CATEGORIES: Record<
  TemplateCategory,
  {
    label: string;
    description: string;
    color: string;
    bgColor: string;
    icon: string;
  }
> = {
  announcement: {
    label: "Announcement",
    description: "Share news, updates, or launches",
    color: "text-blue-600",
    bgColor: "bg-blue-100",
    icon: "megaphone",
  },
  tutorial: {
    label: "Tutorial",
    description: "Step-by-step guides and how-tos",
    color: "text-green-600",
    bgColor: "bg-green-100",
    icon: "book-open",
  },
  experience: {
    label: "Experience",
    description: "Share personal experiences and learnings",
    color: "text-purple-600",
    bgColor: "bg-purple-100",
    icon: "lightbulb",
  },
  question: {
    label: "Question",
    description: "Engage audience with questions",
    color: "text-orange-600",
    bgColor: "bg-orange-100",
    icon: "help-circle",
  },
  tip: {
    label: "Tip",
    description: "Quick tips and best practices",
    color: "text-teal-600",
    bgColor: "bg-teal-100",
    icon: "zap",
  },
  milestone: {
    label: "Milestone",
    description: "Celebrate achievements and milestones",
    color: "text-yellow-600",
    bgColor: "bg-yellow-100",
    icon: "trophy",
  },
  "behind-the-scenes": {
    label: "Behind the Scenes",
    description: "Show your process and daily work",
    color: "text-pink-600",
    bgColor: "bg-pink-100",
    icon: "eye",
  },
  testimonial: {
    label: "Testimonial",
    description: "Share customer success stories",
    color: "text-indigo-600",
    bgColor: "bg-indigo-100",
    icon: "quote",
  },
  poll: {
    label: "Poll",
    description: "Create interactive polls",
    color: "text-cyan-600",
    bgColor: "bg-cyan-100",
    icon: "bar-chart",
  },
  event: {
    label: "Event",
    description: "Promote events and webinars",
    color: "text-red-600",
    bgColor: "bg-red-100",
    icon: "calendar",
  },
};

// ================================
// API Functions
// ================================

/**
 * Build query string from filters
 */
function buildQueryString(filters: TemplateFilters): string {
  const params = new URLSearchParams();

  if (filters.category) params.set("category", filters.category);
  if (filters.isSystem !== undefined) params.set("isSystem", String(filters.isSystem));
  if (filters.isPublic !== undefined) params.set("isPublic", String(filters.isPublic));
  if (filters.profileId) params.set("profileId", filters.profileId);
  if (filters.platformId) params.set("platformId", filters.platformId);
  if (filters.search) params.set("search", filters.search);
  if (filters.limit) params.set("limit", String(filters.limit));
  if (filters.offset) params.set("offset", String(filters.offset));

  const queryString = params.toString();
  return queryString ? `?${queryString}` : "";
}

/**
 * Fetch list of templates with optional filters
 */
export async function getTemplates(
  filters: TemplateFilters = {}
): Promise<{ templates: Template[]; count: number; total: number }> {
  const queryString = buildQueryString(filters);
  const response = await apiClient.get<TemplatesApiResponse>(
    `${TEMPLATES_ENDPOINT}${queryString}`
  );

  return {
    templates: response.data.templates,
    count: response.data.templates.length,
    total: response.data.total,
  };
}

/**
 * Fetch a single template by ID
 */
export async function getTemplateById(id: string): Promise<Template> {
  const response = await apiClient.get<TemplateApiResponse>(
    `${TEMPLATES_ENDPOINT}/${id}`
  );
  return response.data.template;
}

/**
 * Create a new template
 */
export async function createTemplate(
  data: CreateTemplateRequest
): Promise<Template> {
  const response = await apiClient.post<TemplateApiResponse>(
    TEMPLATES_ENDPOINT,
    data
  );
  return response.data.template;
}

/**
 * Update an existing template
 */
export async function updateTemplate(
  id: string,
  data: UpdateTemplateRequest
): Promise<Template> {
  const response = await apiClient.patch<TemplateApiResponse>(
    `${TEMPLATES_ENDPOINT}/${id}`,
    data
  );
  return response.data.template;
}

/**
 * Delete a template
 */
export async function deleteTemplate(id: string): Promise<void> {
  await apiClient.delete<void>(`${TEMPLATES_ENDPOINT}/${id}`);
}

/**
 * Duplicate a template
 */
export async function duplicateTemplate(
  id: string,
  name?: string
): Promise<Template> {
  const response = await apiClient.post<TemplateApiResponse>(
    `${TEMPLATES_ENDPOINT}/${id}/duplicate`,
    name ? { name } : {}
  );
  return response.data.template;
}

/**
 * Render a template with variables (preview)
 */
export async function renderTemplate(
  id: string,
  variables: Record<string, string>
): Promise<RenderTemplateResponse["data"]> {
  const request: RenderTemplateRequest = { variables };
  const response = await apiClient.post<RenderTemplateResponse>(
    `${TEMPLATES_ENDPOINT}/${id}/render`,
    request
  );
  return response.data;
}

/**
 * Generate a post from a template
 */
export async function generateFromTemplate(
  request: GenerateFromTemplateRequest
): Promise<GenerateFromTemplateResponse["data"]> {
  const response = await apiClient.post<GenerateFromTemplateResponse>(
    `${TEMPLATES_ENDPOINT}/${request.templateId}/generate`,
    {
      variables: request.variables,
      profileId: request.profileId,
      platformId: request.platformId,
    }
  );
  return response.data;
}

/**
 * Get template suggestions based on rawIdea
 */
export async function getTemplateSuggestions(
  rawIdea: string,
  limit?: number
): Promise<TemplateSuggestionsResponse["data"]> {
  const params = new URLSearchParams({ rawIdea });
  if (limit) params.set("limit", String(limit));

  const response = await apiClient.get<TemplateSuggestionsResponse>(
    `${TEMPLATES_ENDPOINT}/suggest?${params.toString()}`
  );
  return response.data;
}

/**
 * Get template statistics
 */
export async function getTemplateStatistics(): Promise<TemplateStatistics> {
  const response = await apiClient.get<{ data: TemplateStatistics }>(
    `${TEMPLATES_ENDPOINT}/statistics`
  );
  return response.data;
}

// ================================
// Helper Functions
// ================================

/**
 * Get template category info
 */
export function getTemplateCategoryInfo(category: TemplateCategory) {
  return TEMPLATE_CATEGORIES[category];
}

/**
 * Get all template categories
 */
export function getAllTemplateCategories(): TemplateCategory[] {
  return Object.keys(TEMPLATE_CATEGORIES) as TemplateCategory[];
}

/**
 * Parse variables from template content
 * Extracts {{variableName}} patterns
 */
export function parseTemplateVariables(content: string): string[] {
  const regex = /\{\{(\w+)\}\}/g;
  const matches: string[] = [];
  let match;

  while ((match = regex.exec(content)) !== null) {
    if (!matches.includes(match[1])) {
      matches.push(match[1]);
    }
  }

  return matches;
}

/**
 * Validate that all required variables are provided
 */
export function validateTemplateVariables(
  template: Template,
  providedVariables: Record<string, string>
): { isValid: boolean; missingVariables: string[]; errors: string[] } {
  const missingVariables: string[] = [];
  const errors: string[] = [];

  for (const variable of template.variables) {
    if (variable.required && !providedVariables[variable.name]?.trim()) {
      missingVariables.push(variable.name);
      errors.push(`${variable.name} is required`);
    }
  }

  return {
    isValid: missingVariables.length === 0,
    missingVariables,
    errors,
  };
}

/**
 * Render template content with variables (client-side preview)
 */
export function renderTemplateContent(
  content: string,
  variables: Record<string, string>
): string {
  let rendered = content;

  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, "g");
    rendered = rendered.replace(regex, value || `{{${key}}}`);
  }

  return rendered;
}

/**
 * Check if a template belongs to the current user
 */
export function isOwnTemplate(template: Template, userId: string): boolean {
  return template.userId === userId;
}

/**
 * Check if a template can be edited
 */
export function canEditTemplate(template: Template, userId: string): boolean {
  return isOwnTemplate(template, userId) && !template.isSystem;
}

/**
 * Check if a template can be duplicated
 * Users can duplicate system templates, public templates, or their own templates
 */
export function canDuplicateTemplate(template: Template, userId?: string): boolean {
  if (template.isSystem || template.isPublic) return true;
  // Allow users to duplicate their own templates
  if (userId && template.userId === userId) return true;
  return false;
}

/**
 * Format usage count for display
 */
export function formatUsageCount(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return String(count);
}
