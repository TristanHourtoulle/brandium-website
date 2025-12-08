"use client";

import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import type { Template, TemplateFilters, TemplateCategory } from "@/types";
import {
  getTemplates as getTemplatesApi,
  getTemplateById,
  deleteTemplate as deleteTemplateApi,
  duplicateTemplate as duplicateTemplateApi,
} from "@/lib/api/templates";
import { getErrorMessage } from "@/lib/utils/error-handler";

interface UseTemplatesState {
  templates: Template[];
  isLoading: boolean;
  error: string | null;
  count: number;
  total: number;
}

interface UseTemplatesOptions {
  /** Initial filters */
  initialFilters?: TemplateFilters;
  /** Auto-fetch on mount */
  autoFetch?: boolean;
  /** Show toast notifications */
  showToasts?: boolean;
}

interface UseTemplatesReturn extends UseTemplatesState {
  /** Fetch templates with filters */
  fetchTemplates: (filters?: TemplateFilters) => Promise<void>;
  /** Refresh templates with current filters */
  refresh: () => Promise<void>;
  /** Delete a template */
  deleteTemplate: (id: string) => Promise<boolean>;
  /** Duplicate a template */
  duplicateTemplate: (id: string, name?: string) => Promise<Template | null>;
  /** Get a template by ID from cache or fetch */
  getTemplate: (id: string) => Promise<Template | null>;
  /** Filter by category */
  filterByCategory: (category: TemplateCategory | null) => void;
  /** Filter by type (system/public/mine) */
  filterByType: (type: "all" | "system" | "public" | "mine") => void;
  /** Search templates */
  search: (query: string) => void;
  /** Current filters */
  filters: TemplateFilters;
  /** Clear all filters */
  clearFilters: () => void;
  /** Check if has more results */
  hasMore: boolean;
  /** Load more results */
  loadMore: () => Promise<void>;
}

export function useTemplates(
  options: UseTemplatesOptions = {}
): UseTemplatesReturn {
  const { initialFilters = {}, autoFetch = true, showToasts = true } = options;

  const [state, setState] = useState<UseTemplatesState>({
    templates: [],
    isLoading: false,
    error: null,
    count: 0,
    total: 0,
  });

  const [filters, setFilters] = useState<TemplateFilters>(initialFilters);

  const fetchTemplates = useCallback(
    async (newFilters?: TemplateFilters) => {
      const appliedFilters = newFilters ?? filters;

      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const result = await getTemplatesApi(appliedFilters);

        setState({
          templates: result.templates,
          count: result.count,
          total: result.total,
          isLoading: false,
          error: null,
        });

        if (newFilters) {
          setFilters(newFilters);
        }
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
        }));

        if (showToasts) {
          toast.error(errorMessage);
        }
      }
    },
    [filters, showToasts]
  );

  const refresh = useCallback(async () => {
    await fetchTemplates(filters);
  }, [fetchTemplates, filters]);

  const deleteTemplate = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        await deleteTemplateApi(id);

        // Remove from local state
        setState((prev) => ({
          ...prev,
          templates: prev.templates.filter((t) => t.id !== id),
          count: prev.count - 1,
          total: prev.total - 1,
        }));

        if (showToasts) {
          toast.success("Template deleted");
        }

        return true;
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        if (showToasts) {
          toast.error(errorMessage);
        }
        return false;
      }
    },
    [showToasts]
  );

  const duplicateTemplate = useCallback(
    async (id: string, name?: string): Promise<Template | null> => {
      try {
        const newTemplate = await duplicateTemplateApi(id, name);

        // Add to local state
        setState((prev) => ({
          ...prev,
          templates: [newTemplate, ...prev.templates],
          count: prev.count + 1,
          total: prev.total + 1,
        }));

        if (showToasts) {
          toast.success("Template duplicated");
        }

        return newTemplate;
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        if (showToasts) {
          toast.error(errorMessage);
        }
        return null;
      }
    },
    [showToasts]
  );

  const getTemplate = useCallback(
    async (id: string): Promise<Template | null> => {
      // Check cache first
      const cached = state.templates.find((t) => t.id === id);
      if (cached) return cached;

      try {
        return await getTemplateById(id);
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        if (showToasts) {
          toast.error(errorMessage);
        }
        return null;
      }
    },
    [state.templates, showToasts]
  );

  const filterByCategory = useCallback(
    (category: TemplateCategory | null) => {
      const newFilters = { ...filters, category: category ?? undefined, offset: 0 };
      fetchTemplates(newFilters);
    },
    [filters, fetchTemplates]
  );

  const filterByType = useCallback(
    (type: "all" | "system" | "public" | "mine") => {
      let newFilters: TemplateFilters = { ...filters, offset: 0 };

      switch (type) {
        case "system":
          newFilters = { ...newFilters, isSystem: true, isPublic: undefined };
          break;
        case "public":
          newFilters = { ...newFilters, isSystem: false, isPublic: true };
          break;
        case "mine":
          newFilters = { ...newFilters, isSystem: false, isPublic: false };
          break;
        default:
          newFilters = { ...newFilters, isSystem: undefined, isPublic: undefined };
      }

      fetchTemplates(newFilters);
    },
    [filters, fetchTemplates]
  );

  const search = useCallback(
    (query: string) => {
      const newFilters = { ...filters, search: query || undefined, offset: 0 };
      fetchTemplates(newFilters);
    },
    [filters, fetchTemplates]
  );

  const clearFilters = useCallback(() => {
    fetchTemplates({});
  }, [fetchTemplates]);

  const loadMore = useCallback(async () => {
    if (state.isLoading || state.count >= state.total) return;

    const newFilters = {
      ...filters,
      offset: (filters.offset ?? 0) + (filters.limit ?? 20),
    };

    try {
      const result = await getTemplatesApi(newFilters);

      setState((prev) => ({
        ...prev,
        templates: [...prev.templates, ...result.templates],
        count: prev.count + result.count,
      }));

      setFilters(newFilters);
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      if (showToasts) {
        toast.error(errorMessage);
      }
    }
  }, [filters, state.isLoading, state.count, state.total, showToasts]);

  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch) {
      fetchTemplates();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    ...state,
    fetchTemplates,
    refresh,
    deleteTemplate,
    duplicateTemplate,
    getTemplate,
    filterByCategory,
    filterByType,
    search,
    filters,
    clearFilters,
    hasMore: state.count < state.total,
    loadMore,
  };
}

// ================================
// Single Template Hook
// ================================

interface UseTemplateState {
  template: Template | null;
  isLoading: boolean;
  error: string | null;
}

export function useTemplate(id: string | null): UseTemplateState & {
  refresh: () => Promise<void>;
} {
  const [state, setState] = useState<UseTemplateState>({
    template: null,
    isLoading: false,
    error: null,
  });

  const fetchTemplate = useCallback(async () => {
    if (!id) {
      setState({ template: null, isLoading: false, error: null });
      return;
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const template = await getTemplateById(id);
      setState({ template, isLoading: false, error: null });
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      setState({ template: null, isLoading: false, error: errorMessage });
    }
  }, [id]);

  useEffect(() => {
    // Data fetching on mount/id change
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchTemplate();
  }, [fetchTemplate]);

  return {
    ...state,
    refresh: fetchTemplate,
  };
}
