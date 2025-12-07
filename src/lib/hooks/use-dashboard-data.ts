"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import * as profilesApi from "@/lib/api/profiles";
import * as projectsApi from "@/lib/api/projects";
import * as platformsApi from "@/lib/api/platforms";
import * as postsApi from "@/lib/api/posts";
import * as ideasApi from "@/lib/api/ideas";
import type {
  Profile,
  Project,
  Platform,
  Post,
  PaginationInfo,
  IdeaPaginationInfo,
} from "@/types";

interface DashboardData {
  profiles: Profile[];
  projects: Project[];
  platforms: Platform[];
  posts: Post[];
  postsPagination: PaginationInfo;
  ideasPagination: IdeaPaginationInfo;
}

interface UseDashboardDataReturn {
  data: DashboardData;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const DEFAULT_DATA: DashboardData = {
  profiles: [],
  projects: [],
  platforms: [],
  posts: [],
  postsPagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  },
  ideasPagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20,
  },
};

/**
 * Consolidated hook for dashboard data.
 * Fetches all required data in parallel with a single loading state.
 * Reduces 5 separate API calls to 5 parallel calls with unified state management.
 */
export function useDashboardData(): UseDashboardDataReturn {
  const [data, setData] = useState<DashboardData>(DEFAULT_DATA);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasFetched = useRef(false);

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch all data in parallel using Promise.allSettled
      // to handle partial failures gracefully
      const [
        profilesResult,
        projectsResult,
        platformsResult,
        postsResult,
        ideasResult,
      ] = await Promise.allSettled([
        profilesApi.getProfiles(),
        projectsApi.getProjects(),
        platformsApi.getPlatforms(),
        postsApi.fetchPosts({ page: 1, limit: 3 }), // Only fetch 3 recent posts
        ideasApi.fetchIdeas({ page: 1, limit: 1 }), // Only need pagination info
      ]);

      setData({
        profiles:
          profilesResult.status === "fulfilled" ? profilesResult.value : [],
        projects:
          projectsResult.status === "fulfilled" ? projectsResult.value : [],
        platforms:
          platformsResult.status === "fulfilled" ? platformsResult.value : [],
        posts:
          postsResult.status === "fulfilled"
            ? postsResult.value?.posts ?? []
            : [],
        postsPagination:
          postsResult.status === "fulfilled"
            ? postsResult.value?.pagination ?? DEFAULT_DATA.postsPagination
            : DEFAULT_DATA.postsPagination,
        ideasPagination:
          ideasResult.status === "fulfilled"
            ? ideasResult.value?.pagination ?? DEFAULT_DATA.ideasPagination
            : DEFAULT_DATA.ideasPagination,
      });

      // Check if any requests failed
      const failures = [
        profilesResult,
        projectsResult,
        platformsResult,
        postsResult,
        ideasResult,
      ].filter((r) => r.status === "rejected");

      if (failures.length > 0) {
        console.error("Some dashboard data failed to load:", failures);
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load dashboard data";
      setError(message);
      console.error("Dashboard data fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Only fetch once on mount
    if (!hasFetched.current) {
      hasFetched.current = true;
      fetchDashboardData();
    }
  }, [fetchDashboardData]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchDashboardData,
  };
}
