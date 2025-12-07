"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import * as profilesApi from "@/lib/api/profiles";
import * as projectsApi from "@/lib/api/projects";
import * as platformsApi from "@/lib/api/platforms";
import type { Profile, Project, Platform } from "@/types";

interface FilterOptions {
  profiles: Profile[];
  projects: Project[];
  platforms: Platform[];
}

interface UsePostsPageDataReturn {
  filterOptions: FilterOptions;
  isLoading: boolean;
}

const DEFAULT_FILTER_OPTIONS: FilterOptions = {
  profiles: [],
  projects: [],
  platforms: [],
};

/**
 * Hook to fetch filter options for the posts page.
 * Fetches profiles, projects, and platforms in parallel.
 * Only fetches once on mount.
 */
export function usePostsPageData(): UsePostsPageDataReturn {
  const [filterOptions, setFilterOptions] =
    useState<FilterOptions>(DEFAULT_FILTER_OPTIONS);
  const [isLoading, setIsLoading] = useState(true);
  const hasFetched = useRef(false);

  const fetchFilterOptions = useCallback(async () => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    try {
      const [profiles, projects, platforms] = await Promise.all([
        profilesApi.getProfiles(),
        projectsApi.getProjects(),
        platformsApi.getPlatforms(),
      ]);

      setFilterOptions({
        profiles: profiles ?? [],
        projects: projects ?? [],
        platforms: platforms ?? [],
      });
    } catch (error) {
      console.error("Failed to fetch filter options:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFilterOptions();
  }, [fetchFilterOptions]);

  return {
    filterOptions,
    isLoading,
  };
}
