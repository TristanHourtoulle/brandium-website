"use client";

import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import * as historicalPostsApi from "@/lib/api/historical-posts";
import type {
  HistoricalPost,
  HistoricalPostsStats,
  HistoricalPostsPagination,
  CreateHistoricalPostDto,
  UpdateHistoricalPostDto,
  BulkImportHistoricalPostsDto,
  BulkImportResponse,
  HistoricalPostsQueryParams,
} from "@/types";

interface UseHistoricalPostsReturn {
  posts: HistoricalPost[];
  pagination: HistoricalPostsPagination | null;
  stats: HistoricalPostsStats | null;
  isLoading: boolean;
  isLoadingStats: boolean;
  error: string | null;
  queryParams: HistoricalPostsQueryParams;
  setQueryParams: (params: HistoricalPostsQueryParams) => void;
  fetchPosts: () => Promise<void>;
  fetchStats: () => Promise<void>;
  createPost: (data: CreateHistoricalPostDto) => Promise<HistoricalPost | null>;
  updatePost: (
    postId: string,
    data: UpdateHistoricalPostDto
  ) => Promise<HistoricalPost | null>;
  deletePost: (postId: string) => Promise<boolean>;
  bulkImport: (
    data: BulkImportHistoricalPostsDto
  ) => Promise<BulkImportResponse | null>;
  goToPage: (page: number) => void;
}

const DEFAULT_QUERY_PARAMS: HistoricalPostsQueryParams = {
  page: 1,
  limit: 10,
  sortBy: "publishedAt",
  order: "DESC",
};

export function useHistoricalPosts(profileId: string): UseHistoricalPostsReturn {
  const [posts, setPosts] = useState<HistoricalPost[]>([]);
  const [pagination, setPagination] = useState<HistoricalPostsPagination | null>(null);
  const [stats, setStats] = useState<HistoricalPostsStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [queryParams, setQueryParams] =
    useState<HistoricalPostsQueryParams>(DEFAULT_QUERY_PARAMS);

  const fetchPosts = useCallback(async () => {
    if (!profileId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await historicalPostsApi.getHistoricalPosts(
        profileId,
        queryParams
      );
      setPosts(response.data);
      setPagination(response.pagination);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load historical posts";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [profileId, queryParams]);

  const fetchStats = useCallback(async () => {
    if (!profileId) {
      setIsLoadingStats(false);
      return;
    }

    setIsLoadingStats(true);

    try {
      const data = await historicalPostsApi.getHistoricalPostsStats(profileId);
      setStats(data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load statistics";
      console.error(message);
    } finally {
      setIsLoadingStats(false);
    }
  }, [profileId]);

  const createPost = useCallback(
    async (data: CreateHistoricalPostDto): Promise<HistoricalPost | null> => {
      try {
        const newPost = await historicalPostsApi.createHistoricalPost(
          profileId,
          data
        );
        // Refresh posts and stats after creation
        await Promise.all([fetchPosts(), fetchStats()]);
        toast.success("Historical post created successfully");
        return newPost;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to create historical post";
        toast.error(message);
        return null;
      }
    },
    [profileId, fetchPosts, fetchStats]
  );

  const updatePost = useCallback(
    async (
      postId: string,
      data: UpdateHistoricalPostDto
    ): Promise<HistoricalPost | null> => {
      try {
        const updatedPost = await historicalPostsApi.updateHistoricalPost(
          profileId,
          postId,
          data
        );
        setPosts((prev) =>
          prev.map((p) => (p.id === postId ? updatedPost : p))
        );
        toast.success("Historical post updated successfully");
        return updatedPost;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to update historical post";
        toast.error(message);
        return null;
      }
    },
    [profileId]
  );

  const deletePost = useCallback(
    async (postId: string): Promise<boolean> => {
      try {
        await historicalPostsApi.deleteHistoricalPost(profileId, postId);
        // Refresh posts and stats after deletion
        await Promise.all([fetchPosts(), fetchStats()]);
        toast.success("Historical post deleted successfully");
        return true;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to delete historical post";
        toast.error(message);
        return false;
      }
    },
    [profileId, fetchPosts, fetchStats]
  );

  const bulkImport = useCallback(
    async (
      data: BulkImportHistoricalPostsDto
    ): Promise<BulkImportResponse | null> => {
      try {
        const response = await historicalPostsApi.bulkImportHistoricalPosts(
          profileId,
          data
        );

        // Refresh posts and stats after bulk import
        await Promise.all([fetchPosts(), fetchStats()]);

        if (response.failed > 0) {
          toast.warning(
            `Import completed: ${response.created} created, ${response.failed} failed`
          );
        } else {
          toast.success(`Successfully imported ${response.created} posts`);
        }

        return response;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to import posts";
        toast.error(message);
        return null;
      }
    },
    [profileId, fetchPosts, fetchStats]
  );

  const goToPage = useCallback((page: number) => {
    setQueryParams((prev) => ({ ...prev, page }));
  }, []);

  // Fetch posts when profileId or queryParams change
  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Fetch stats when profileId changes
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    posts,
    pagination,
    stats,
    isLoading,
    isLoadingStats,
    error,
    queryParams,
    setQueryParams,
    fetchPosts,
    fetchStats,
    createPost,
    updatePost,
    deletePost,
    bulkImport,
    goToPage,
  };
}

// Hook for fetching a single historical post
interface UseHistoricalPostReturn {
  post: HistoricalPost | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useHistoricalPost(
  profileId: string,
  postId: string | null
): UseHistoricalPostReturn {
  const [post, setPost] = useState<HistoricalPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPost = useCallback(async () => {
    if (!profileId || !postId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await historicalPostsApi.getHistoricalPost(profileId, postId);
      setPost(data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load historical post";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [profileId, postId]);

  useEffect(() => {
    fetchPost();
  }, [fetchPost]);

  return {
    post,
    isLoading,
    error,
    refetch: fetchPost,
  };
}
