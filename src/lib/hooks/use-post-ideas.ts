"use client";

import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import * as ideasApi from "@/lib/api/ideas";
import type {
  PostIdea,
  IdeaFilters,
  IdeaPaginationInfo,
  GenerateIdeasRequest,
  GenerateIdeasResponse,
} from "@/types";

// ============================================================================
// usePostIdeas - Main hook for listing and managing ideas
// ============================================================================

interface UsePostIdeasReturn {
  ideas: PostIdea[];
  isLoading: boolean;
  error: string | null;
  pagination: IdeaPaginationInfo;
  filters: IdeaFilters;
  selectedIds: string[];
  fetchIdeas: (newFilters?: IdeaFilters) => Promise<void>;
  deleteIdea: (id: string) => Promise<boolean>;
  deleteBulkIdeas: (ids: string[]) => Promise<boolean>;
  markAsUsed: (id: string, postId?: string) => Promise<boolean>;
  setFilters: (newFilters: IdeaFilters) => void;
  nextPage: () => void;
  prevPage: () => void;
  goToPage: (page: number) => void;
  resetFilters: () => void;
  toggleSelection: (id: string) => void;
  selectAll: () => void;
  clearSelection: () => void;
  refetch: () => Promise<void>;
}

const DEFAULT_PAGINATION: IdeaPaginationInfo = {
  currentPage: 1,
  totalPages: 1,
  totalItems: 0,
  itemsPerPage: 20,
};

const DEFAULT_FILTERS: IdeaFilters = {
  page: 1,
  limit: 20,
};

export function usePostIdeas(): UsePostIdeasReturn {
  const [ideas, setIdeas] = useState<PostIdea[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] =
    useState<IdeaPaginationInfo>(DEFAULT_PAGINATION);
  const [filters, setFiltersState] = useState<IdeaFilters>(DEFAULT_FILTERS);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const fetchIdeas = useCallback(
    async (newFilters?: IdeaFilters) => {
      setIsLoading(true);
      setError(null);

      const currentFilters = newFilters
        ? { ...filters, ...newFilters }
        : filters;

      try {
        const response = await ideasApi.fetchIdeas(currentFilters);
        setIdeas(response?.ideas ?? []);
        setPagination(response?.pagination ?? DEFAULT_PAGINATION);

        if (newFilters) {
          setFiltersState(currentFilters);
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to load ideas";
        setError(message);
        setIdeas([]);
        setPagination(DEFAULT_PAGINATION);
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    },
    [filters]
  );

  const deleteIdea = useCallback(async (id: string): Promise<boolean> => {
    try {
      await ideasApi.deleteIdea(id);
      setIdeas((prev) => prev.filter((i) => i.id !== id));
      setPagination((prev) => ({
        ...prev,
        totalItems: prev.totalItems - 1,
      }));
      setSelectedIds((prev) => prev.filter((selectedId) => selectedId !== id));
      toast.success("Idea deleted successfully");
      return true;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to delete idea";
      toast.error(message);
      return false;
    }
  }, []);

  const deleteBulkIdeas = useCallback(
    async (ids: string[]): Promise<boolean> => {
      if (ids.length === 0) return false;

      try {
        const response = await ideasApi.deleteBulkIdeas(ids);
        setIdeas((prev) => prev.filter((i) => !ids.includes(i.id)));
        setPagination((prev) => ({
          ...prev,
          totalItems: prev.totalItems - response.deletedCount,
        }));
        setSelectedIds([]);
        toast.success(`${response.deletedCount} idea(s) deleted successfully`);
        return true;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to delete ideas";
        toast.error(message);
        return false;
      }
    },
    []
  );

  const markAsUsed = useCallback(
    async (id: string, postId?: string): Promise<boolean> => {
      try {
        const response = await ideasApi.markIdeaAsUsed(id, postId);
        setIdeas((prev) =>
          prev.map((idea) =>
            idea.id === id
              ? {
                  ...idea,
                  isUsed: true,
                  usedAt: response.data.usedAt,
                  postId: response.data.postId,
                }
              : idea
          )
        );
        toast.success("Idea marked as used");
        return true;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to mark idea as used";
        toast.error(message);
        return false;
      }
    },
    []
  );

  const setFilters = useCallback((newFilters: IdeaFilters) => {
    setFiltersState((prev) => ({ ...prev, ...newFilters, page: 1 }));
  }, []);

  const nextPage = useCallback(() => {
    if (pagination.currentPage < pagination.totalPages) {
      fetchIdeas({ page: pagination.currentPage + 1 });
    }
  }, [pagination.currentPage, pagination.totalPages, fetchIdeas]);

  const prevPage = useCallback(() => {
    if (pagination.currentPage > 1) {
      fetchIdeas({ page: pagination.currentPage - 1 });
    }
  }, [pagination.currentPage, fetchIdeas]);

  const goToPage = useCallback(
    (page: number) => {
      if (page >= 1 && page <= pagination.totalPages) {
        fetchIdeas({ page });
      }
    },
    [pagination.totalPages, fetchIdeas]
  );

  const resetFilters = useCallback(() => {
    setFiltersState(DEFAULT_FILTERS);
  }, []);

  const toggleSelection = useCallback((id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  }, []);

  const selectAll = useCallback(() => {
    setSelectedIds(ideas.map((idea) => idea.id));
  }, [ideas]);

  const clearSelection = useCallback(() => {
    setSelectedIds([]);
  }, []);

  const refetch = useCallback(async () => {
    await fetchIdeas();
  }, [fetchIdeas]);

  // Fetch ideas when filters change
  useEffect(() => {
    fetchIdeas();
  }, [filters]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    ideas,
    isLoading,
    error,
    pagination,
    filters,
    selectedIds,
    fetchIdeas,
    deleteIdea,
    deleteBulkIdeas,
    markAsUsed,
    setFilters,
    nextPage,
    prevPage,
    goToPage,
    resetFilters,
    toggleSelection,
    selectAll,
    clearSelection,
    refetch,
  };
}

// ============================================================================
// useGenerateIdeas - Hook for generating new ideas
// ============================================================================

interface UseGenerateIdeasReturn {
  isGenerating: boolean;
  error: string | null;
  generatedIdeas: PostIdea[];
  context: GenerateIdeasResponse["data"]["context"] | null;
  usage: GenerateIdeasResponse["data"]["usage"] | null;
  generate: (request: GenerateIdeasRequest) => Promise<boolean>;
  reset: () => void;
}

export function useGenerateIdeas(): UseGenerateIdeasReturn {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedIdeas, setGeneratedIdeas] = useState<PostIdea[]>([]);
  const [context, setContext] = useState<
    GenerateIdeasResponse["data"]["context"] | null
  >(null);
  const [usage, setUsage] = useState<
    GenerateIdeasResponse["data"]["usage"] | null
  >(null);

  const generate = useCallback(
    async (request: GenerateIdeasRequest): Promise<boolean> => {
      setIsGenerating(true);
      setError(null);

      try {
        const response = await ideasApi.generateIdeas(request);
        setGeneratedIdeas(response.data.ideas);
        setContext(response.data.context);
        setUsage(response.data.usage);
        toast.success(
          `${response.data.ideas.length} idea(s) generated successfully`
        );
        return true;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to generate ideas";
        setError(message);
        toast.error(message);
        return false;
      } finally {
        setIsGenerating(false);
      }
    },
    []
  );

  const reset = useCallback(() => {
    setGeneratedIdeas([]);
    setContext(null);
    setUsage(null);
    setError(null);
  }, []);

  return {
    isGenerating,
    error,
    generatedIdeas,
    context,
    usage,
    generate,
    reset,
  };
}

// ============================================================================
// usePostIdea - Hook for fetching a single idea
// ============================================================================

interface UsePostIdeaReturn {
  idea: PostIdea | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function usePostIdea(id: string | null): UsePostIdeaReturn {
  const [idea, setIdea] = useState<PostIdea | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchIdea = useCallback(async () => {
    if (!id) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const data = await ideasApi.fetchIdeaById(id);
      setIdea(data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load idea";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchIdea();
  }, [fetchIdea]);

  return {
    idea,
    isLoading,
    error,
    refetch: fetchIdea,
  };
}
