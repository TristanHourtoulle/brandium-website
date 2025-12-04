"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";
import * as generateApi from "@/lib/api/generate";
import type {
  GenerateRequest,
  GeneratedPost,
  RateLimitStatus,
} from "@/types";

interface UseGenerateReturn {
  generatedPost: GeneratedPost | null;
  isGenerating: boolean;
  error: string | null;
  rateLimitStatus: RateLimitStatus | null;
  isRateLimited: boolean;
  generate: (request: GenerateRequest) => Promise<GeneratedPost | null>;
  regenerate: () => Promise<GeneratedPost | null>;
  clear: () => void;
  checkRateLimit: () => Promise<void>;
}

export function useGenerate(): UseGenerateReturn {
  const [generatedPost, setGeneratedPost] = useState<GeneratedPost | null>(
    null
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rateLimitStatus, setRateLimitStatus] =
    useState<RateLimitStatus | null>(null);

  // Store the last request for regeneration
  const lastRequestRef = useRef<GenerateRequest | null>(null);

  // Calculate if rate limited
  const isRateLimited = rateLimitStatus
    ? rateLimitStatus.remaining <= 0
    : false;

  const checkRateLimit = useCallback(async () => {
    try {
      const status = await generateApi.getRateLimitStatus();
      setRateLimitStatus(status);
    } catch (err) {
      console.error("Failed to check rate limit:", err);
    }
  }, []);

  const generate = useCallback(
    async (request: GenerateRequest): Promise<GeneratedPost | null> => {
      if (isRateLimited) {
        toast.error("Rate limit exceeded. Please wait before generating again.");
        return null;
      }

      setIsGenerating(true);
      setError(null);

      try {
        const response = await generateApi.generatePost(request);
        setGeneratedPost(response.post);
        setRateLimitStatus(response.rateLimit);
        lastRequestRef.current = request;
        toast.success("Content generated successfully!");
        return response.post;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to generate content";

        // Check for rate limit error
        if (message.toLowerCase().includes("rate limit")) {
          setError("Rate limit exceeded. Please wait before generating again.");
          toast.error("Rate limit exceeded");
          // Refresh rate limit status
          await checkRateLimit();
        } else {
          setError(message);
          toast.error(message);
        }

        return null;
      } finally {
        setIsGenerating(false);
      }
    },
    [isRateLimited, checkRateLimit]
  );

  const regenerate = useCallback(async (): Promise<GeneratedPost | null> => {
    if (!lastRequestRef.current) {
      toast.error("No previous request to regenerate");
      return null;
    }

    return generate(lastRequestRef.current);
  }, [generate]);

  const clear = useCallback(() => {
    setGeneratedPost(null);
    setError(null);
    lastRequestRef.current = null;
  }, []);

  // Check rate limit on mount
  useEffect(() => {
    checkRateLimit();
  }, [checkRateLimit]);

  // Periodically refresh rate limit status when rate limited
  useEffect(() => {
    if (!isRateLimited || !rateLimitStatus) {
      return;
    }

    const resetTime = new Date(rateLimitStatus.resetAt).getTime();
    const now = Date.now();
    const timeUntilReset = resetTime - now;

    if (timeUntilReset <= 0) {
      // Already reset, refresh now
      checkRateLimit();
      return;
    }

    // Set a timer to refresh when the rate limit resets
    const timer = setTimeout(() => {
      checkRateLimit();
    }, Math.min(timeUntilReset + 1000, 60000)); // Add 1 second buffer, max 60 seconds

    return () => clearTimeout(timer);
  }, [isRateLimited, rateLimitStatus, checkRateLimit]);

  return {
    generatedPost,
    isGenerating,
    error,
    rateLimitStatus,
    isRateLimited,
    generate,
    regenerate,
    clear,
    checkRateLimit,
  };
}
