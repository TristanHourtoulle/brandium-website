"use client";

import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import * as generateApi from "@/lib/api/generate";
import type {
  GenerateWithVariantsRequest,
  GenerateVariantsResponse,
  GenerateSingleResponse,
  VariantData,
  RateLimitStatus,
  VariantApproach,
} from "@/types";
import { isVariantsResponse } from "@/types";

interface UseVariantsReturn {
  variants: VariantData[];
  selectedVariant: VariantData | null;
  isGenerating: boolean;
  error: string | null;
  rateLimitStatus: RateLimitStatus | null;
  isRateLimited: boolean;
  context: GenerateVariantsResponse["data"]["context"] | null;
  generateVariants: (request: GenerateWithVariantsRequest) => Promise<VariantData[] | null>;
  selectVariant: (variant: VariantData) => void;
  clear: () => void;
  checkRateLimit: () => Promise<void>;
}

// Helper to get approach display info
export function getApproachInfo(approach: VariantApproach): {
  label: string;
  description: string;
  icon: string;
  color: string;
} {
  switch (approach) {
    case "direct":
      return {
        label: "Direct",
        description: "Clear and straightforward messaging",
        icon: "🎯",
        color: "text-blue-600",
      };
    case "storytelling":
      return {
        label: "Storytelling",
        description: "Narrative-driven engagement",
        icon: "📖",
        color: "text-purple-600",
      };
    case "data-driven":
      return {
        label: "Data-Driven",
        description: "Facts and statistics backed",
        icon: "📊",
        color: "text-green-600",
      };
    case "emotional":
      return {
        label: "Emotional",
        description: "Connects on a personal level",
        icon: "💬",
        color: "text-red-600",
      };
    default:
      return {
        label: approach,
        description: "Custom approach",
        icon: "✨",
        color: "text-gray-600",
      };
  }
}

export function useVariants(): UseVariantsReturn {
  const [variants, setVariants] = useState<VariantData[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<VariantData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rateLimitStatus, setRateLimitStatus] = useState<RateLimitStatus | null>(null);
  const [context, setContext] = useState<GenerateVariantsResponse["data"]["context"] | null>(null);

  const isRateLimited = rateLimitStatus ? rateLimitStatus.remaining <= 0 : false;

  const checkRateLimit = useCallback(async () => {
    try {
      const status = await generateApi.getRateLimitStatus();
      setRateLimitStatus(status);
    } catch (err) {
      console.error("Failed to check rate limit:", err);
    }
  }, []);

  const generateVariants = useCallback(
    async (request: GenerateWithVariantsRequest): Promise<VariantData[] | null> => {
      if (isRateLimited) {
        toast.error("Rate limit exceeded. Please wait before generating again.");
        return null;
      }

      // Ensure at least 2 variants for comparison
      const variantCount = Math.max(2, Math.min(4, request.variants ?? 2));

      setIsGenerating(true);
      setError(null);
      setVariants([]);
      setSelectedVariant(null);
      setContext(null);

      try {
        const response = await generateApi.generateWithVariants({
          ...request,
          variants: variantCount,
        });

        if (response.rateLimit) {
          setRateLimitStatus({
            remaining: response.rateLimit.remaining,
            total: response.rateLimit.total,
            resetAt: response.rateLimit.resetAt,
          });
        }

        if (isVariantsResponse(response)) {
          const variantsData = response.data.variants;
          setVariants(variantsData);
          setContext(response.data.context);

          // Auto-select the first variant
          if (variantsData.length > 0) {
            setSelectedVariant(variantsData[0]);
          }

          toast.success(`Generated ${variantsData.length} variants!`);
          return variantsData;
        } else {
          // Single response - convert to variant format
          const singleResponse = response as GenerateSingleResponse;
          const singleVariant: VariantData = {
            postId: singleResponse.data.post.id,
            versionId: singleResponse.data.version.id,
            versionNumber: singleResponse.data.version.versionNumber,
            generatedText: singleResponse.data.version.generatedText,
            approach: singleResponse.data.version.approach ?? "direct",
            format: singleResponse.data.version.format,
            usage: singleResponse.data.version.usage,
          };

          setVariants([singleVariant]);
          setSelectedVariant(singleVariant);
          toast.success("Generated content!");
          return [singleVariant];
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to generate variants";

        if (message.toLowerCase().includes("rate limit")) {
          setError("Rate limit exceeded. Please wait before generating again.");
          toast.error("Rate limit exceeded");
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

  const selectVariant = useCallback((variant: VariantData) => {
    setSelectedVariant(variant);
  }, []);

  const clear = useCallback(() => {
    setVariants([]);
    setSelectedVariant(null);
    setError(null);
    setContext(null);
  }, []);

  // Check rate limit on mount
  useEffect(() => {
    checkRateLimit();
  }, [checkRateLimit]);

  // Periodically refresh rate limit when rate limited
  useEffect(() => {
    if (!isRateLimited || !rateLimitStatus) {
      return;
    }

    const resetTime = new Date(rateLimitStatus.resetAt).getTime();
    const now = Date.now();
    const timeUntilReset = resetTime - now;

    if (timeUntilReset <= 0) {
      checkRateLimit();
      return;
    }

    const timer = setTimeout(() => {
      checkRateLimit();
    }, Math.min(timeUntilReset + 1000, 60000));

    return () => clearTimeout(timer);
  }, [isRateLimited, rateLimitStatus, checkRateLimit]);

  return {
    variants,
    selectedVariant,
    isGenerating,
    error,
    rateLimitStatus,
    isRateLimited,
    context,
    generateVariants,
    selectVariant,
    clear,
    checkRateLimit,
  };
}
