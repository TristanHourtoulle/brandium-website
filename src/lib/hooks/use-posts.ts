"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";
import * as postsApi from "@/lib/api/posts";
import type { Post, PostFilters, PaginationInfo } from "@/types";

interface UsePostsReturn {
  posts: Post[];
  isLoading: boolean;
  error: string | null;
  pagination: PaginationInfo;
  filters: PostFilters;
  fetchPosts: (newFilters?: PostFilters) => Promise<void>;
  deletePost: (id: string) => Promise<boolean>;
  setFilters: (newFilters: PostFilters) => void;
  nextPage: () => void;
  prevPage: () => void;
  goToPage: (page: number) => void;
  resetFilters: () => void;
}

const DEFAULT_PAGINATION: PaginationInfo = {
  currentPage: 1,
  totalPages: 1,
  totalItems: 0,
  itemsPerPage: 10,
};

const DEFAULT_FILTERS: PostFilters = {
  page: 1,
  limit: 10,
};

export function usePosts(): UsePostsReturn {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] =
    useState<PaginationInfo>(DEFAULT_PAGINATION);
  const [filters, setFiltersState] = useState<PostFilters>(DEFAULT_FILTERS);

  // Prevent race conditions and double fetches
  const fetchIdRef = useRef(0);
  const hasFetchedRef = useRef(false);

  const fetchPosts = useCallback(
    async (newFilters?: PostFilters) => {
      const fetchId = ++fetchIdRef.current;

      // Only show loading on initial load, not on filter changes
      if (!hasFetchedRef.current) {
        setIsLoading(true);
      }
      setError(null);

      const currentFilters = newFilters
        ? { ...filters, ...newFilters }
        : filters;

      try {
        const response = await postsApi.fetchPosts(currentFilters);

        // Ignore stale responses
        if (fetchId !== fetchIdRef.current) return;

        setPosts(response?.posts ?? []);
        setPagination(response?.pagination ?? DEFAULT_PAGINATION);
        hasFetchedRef.current = true;

        if (newFilters) {
          setFiltersState(currentFilters);
        }
      } catch (err) {
        // Ignore errors from stale requests
        if (fetchId !== fetchIdRef.current) return;

        const message =
          err instanceof Error ? err.message : "Failed to load posts";
        setError(message);
        setPosts([]);
        setPagination(DEFAULT_PAGINATION);
        toast.error(message);
      } finally {
        // Only update loading state for current request
        if (fetchId === fetchIdRef.current) {
          setIsLoading(false);
        }
      }
    },
    [filters]
  );

  const deletePost = useCallback(async (id: string): Promise<boolean> => {
    try {
      await postsApi.deletePost(id);
      setPosts((prev) => prev.filter((p) => p.id !== id));
      setPagination((prev) => ({
        ...prev,
        totalItems: prev.totalItems - 1,
      }));
      toast.success("Post deleted successfully");
      return true;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to delete post";
      toast.error(message);
      return false;
    }
  }, []);

  const setFilters = useCallback((newFilters: PostFilters) => {
    setFiltersState((prev) => ({ ...prev, ...newFilters, page: 1 }));
  }, []);

  const nextPage = useCallback(() => {
    if (pagination.currentPage < pagination.totalPages) {
      setFiltersState((prev) => ({ ...prev, page: pagination.currentPage + 1 }));
    }
  }, [pagination.currentPage, pagination.totalPages]);

  const prevPage = useCallback(() => {
    if (pagination.currentPage > 1) {
      setFiltersState((prev) => ({ ...prev, page: pagination.currentPage - 1 }));
    }
  }, [pagination.currentPage]);

  const goToPage = useCallback(
    (page: number) => {
      if (page >= 1 && page <= pagination.totalPages) {
        setFiltersState((prev) => ({ ...prev, page }));
      }
    },
    [pagination.totalPages]
  );

  const resetFilters = useCallback(() => {
    setFiltersState(DEFAULT_FILTERS);
  }, []);

  // Fetch posts when filters change - single effect
  useEffect(() => {
    fetchPosts();
  }, [filters]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    posts,
    isLoading,
    error,
    pagination,
    filters,
    fetchPosts,
    deletePost,
    setFilters,
    nextPage,
    prevPage,
    goToPage,
    resetFilters,
  };
}

// Hook for fetching a single post
interface UsePostReturn {
  post: Post | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function usePost(id: string | null): UsePostReturn {
  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPost = useCallback(async () => {
    if (!id) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const data = await postsApi.fetchPostById(id);
      setPost(data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load post";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

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
