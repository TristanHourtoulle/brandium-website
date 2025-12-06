"use client";

import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import * as profileAnalysisApi from "@/lib/api/profile-analysis";
import type {
  AnalysisStats,
  AnalysisResult,
  ApplyAnalysisDto,
  AnalyzeFromPostsParams,
  Profile,
} from "@/types";

interface UseProfileAnalysisReturn {
  analysisStats: AnalysisStats | null;
  analysisResult: AnalysisResult | null;
  isLoadingStats: boolean;
  isAnalyzing: boolean;
  isApplying: boolean;
  error: string | null;
  canAnalyze: boolean;
  fetchAnalysisStats: () => Promise<void>;
  analyzeProfile: (params?: AnalyzeFromPostsParams) => Promise<AnalysisResult | null>;
  applySuggestions: (data: ApplyAnalysisDto) => Promise<Profile | null>;
  clearAnalysisResult: () => void;
}

export function useProfileAnalysis(profileId: string): UseProfileAnalysisReturn {
  const [analysisStats, setAnalysisStats] = useState<AnalysisStats | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canAnalyze = analysisStats?.readyForAnalysis ?? false;

  const fetchAnalysisStats = useCallback(async () => {
    if (!profileId) {
      setIsLoadingStats(false);
      return;
    }

    setIsLoadingStats(true);
    setError(null);

    try {
      const data = await profileAnalysisApi.getAnalysisStats(profileId);
      setAnalysisStats(data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load analysis stats";
      setError(message);
    } finally {
      setIsLoadingStats(false);
    }
  }, [profileId]);

  const analyzeProfile = useCallback(
    async (params?: AnalyzeFromPostsParams): Promise<AnalysisResult | null> => {
      if (!canAnalyze) {
        toast.error(
          `You need at least ${analysisStats?.minimumRequired ?? 5} historical posts to analyze your style`
        );
        return null;
      }

      setIsAnalyzing(true);
      setError(null);

      try {
        const response = await profileAnalysisApi.analyzeProfileFromPosts(
          profileId,
          params
        );
        setAnalysisResult(response.data);
        toast.success("Analysis complete! Review the suggestions below.");
        return response.data;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to analyze profile";
        setError(message);
        toast.error(message);
        return null;
      } finally {
        setIsAnalyzing(false);
      }
    },
    [profileId, canAnalyze, analysisStats?.minimumRequired]
  );

  const applySuggestions = useCallback(
    async (data: ApplyAnalysisDto): Promise<Profile | null> => {
      setIsApplying(true);
      setError(null);

      try {
        const updatedProfile = await profileAnalysisApi.applyAnalysis(
          profileId,
          data
        );
        setAnalysisResult(null);
        toast.success("Analysis applied to your profile successfully!");
        return updatedProfile;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to apply analysis";
        setError(message);
        toast.error(message);
        return null;
      } finally {
        setIsApplying(false);
      }
    },
    [profileId]
  );

  const clearAnalysisResult = useCallback(() => {
    setAnalysisResult(null);
  }, []);

  // Fetch analysis stats when profileId changes
  useEffect(() => {
    fetchAnalysisStats();
  }, [fetchAnalysisStats]);

  return {
    analysisStats,
    analysisResult,
    isLoadingStats,
    isAnalyzing,
    isApplying,
    error,
    canAnalyze,
    fetchAnalysisStats,
    analyzeProfile,
    applySuggestions,
    clearAnalysisResult,
  };
}
