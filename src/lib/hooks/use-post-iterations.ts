"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import * as iterationsApi from "@/lib/api/iterations";
import type {
  PostVersion,
  IterateRequest,
  IterateResponse,
} from "@/types";

interface UsePostIterationsReturn {
  /** All versions of the post */
  versions: PostVersion[];
  /** The currently selected version */
  currentVersion: PostVersion | null;
  /** Total number of versions */
  totalVersions: number;
  /** Loading state for creating iteration */
  isIterating: boolean;
  /** Loading state for fetching versions */
  isFetchingVersions: boolean;
  /** Loading state for selecting version */
  isSelectingVersion: boolean;
  /** Error message if any */
  error: string | null;
  /** Create a new iteration of the post */
  iterate: (postId: string, request: IterateRequest) => Promise<IterateResponse | null>;
  /** Fetch all versions of a post */
  fetchVersions: (postId: string) => Promise<void>;
  /** Select a version as current */
  selectVersion: (postId: string, versionId: string) => Promise<void>;
  /** Clear all version data */
  clearVersions: () => void;
  /** Update the content of the current version locally (for optimistic updates) */
  updateCurrentVersionContent: (content: string) => void;
}

export function usePostIterations(): UsePostIterationsReturn {
  const [versions, setVersions] = useState<PostVersion[]>([]);
  const [isIterating, setIsIterating] = useState(false);
  const [isFetchingVersions, setIsFetchingVersions] = useState(false);
  const [isSelectingVersion, setIsSelectingVersion] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Computed values
  const currentVersion = versions.find((v) => v.isSelected) || null;
  const totalVersions = versions.length;

  /**
   * Fetch all versions of a post
   */
  const fetchVersions = useCallback(async (postId: string) => {
    setIsFetchingVersions(true);
    setError(null);

    try {
      const response = await iterationsApi.fetchVersions(postId);
      setVersions(response.versions);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch versions";
      setError(message);
      console.error("Failed to fetch versions:", err);
    } finally {
      setIsFetchingVersions(false);
    }
  }, []);

  /**
   * Create a new iteration of the post
   */
  const iterate = useCallback(
    async (postId: string, request: IterateRequest): Promise<IterateResponse | null> => {
      setIsIterating(true);
      setError(null);

      try {
        const response = await iterationsApi.iteratePost(postId, request);

        // Refresh versions list to get the new version
        await fetchVersions(postId);

        toast.success(`Version ${response.versionNumber} created!`);
        return response;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to create iteration";
        setError(message);

        // Handle specific error cases
        if (message.toLowerCase().includes("rate limit")) {
          toast.error("Rate limit exceeded. Please wait before iterating again.");
        } else {
          toast.error(message);
        }

        return null;
      } finally {
        setIsIterating(false);
      }
    },
    [fetchVersions]
  );

  /**
   * Select a version as the current one
   */
  const selectVersion = useCallback(
    async (postId: string, versionId: string) => {
      // Don't select if already selected
      const targetVersion = versions.find((v) => v.id === versionId);
      if (targetVersion?.isSelected) {
        return;
      }

      setIsSelectingVersion(true);
      setError(null);

      try {
        await iterationsApi.selectVersion(postId, versionId);

        // Optimistically update local state
        setVersions((prev) =>
          prev.map((v) => ({
            ...v,
            isSelected: v.id === versionId,
          }))
        );

        toast.success(`Version ${targetVersion?.versionNumber || ""} selected!`);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to select version";
        setError(message);
        toast.error(message);

        // Refresh versions to ensure consistency
        await fetchVersions(postId);
      } finally {
        setIsSelectingVersion(false);
      }
    },
    [versions, fetchVersions]
  );

  /**
   * Clear all version data
   */
  const clearVersions = useCallback(() => {
    setVersions([]);
    setError(null);
  }, []);

  /**
   * Update the content of the current version locally
   * Useful for optimistic updates when receiving iteration response
   */
  const updateCurrentVersionContent = useCallback((content: string) => {
    setVersions((prev) =>
      prev.map((v) =>
        v.isSelected ? { ...v, generatedText: content } : v
      )
    );
  }, []);

  return {
    versions,
    currentVersion,
    totalVersions,
    isIterating,
    isFetchingVersions,
    isSelectingVersion,
    error,
    iterate,
    fetchVersions,
    selectVersion,
    clearVersions,
    updateCurrentVersionContent,
  };
}
