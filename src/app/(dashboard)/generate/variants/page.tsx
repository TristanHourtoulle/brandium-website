"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Layers, Sparkles, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  VariantGenerator,
  VariantComparison,
  type VariantGeneratorConfig,
} from "@/components/features/variants";
import { RateLimitStatusDisplay } from "@/components/features/generate";
import { useProfiles } from "@/lib/hooks/use-profiles";
import { useProjects } from "@/lib/hooks/use-projects";
import { usePlatforms } from "@/lib/hooks/use-platforms";
import { useVariants } from "@/lib/hooks/use-variants";
import { ROUTES } from "@/config/constants";
import type { VariantData } from "@/types";

function VariantsPageSkeleton() {
  return (
    <div className="container mx-auto py-6 px-4 md:py-8 space-y-6">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <div className="grid gap-4 md:grid-cols-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-32" />
          </CardHeader>
          <CardContent className="flex items-center justify-center h-64">
            <Skeleton className="h-16 w-16 rounded-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function VariantsPage() {
  const router = useRouter();
  const { profiles, isLoading: profilesLoading } = useProfiles();
  const { projects, isLoading: projectsLoading } = useProjects();
  const { platforms, isLoading: platformsLoading } = usePlatforms();
  const {
    variants,
    selectedVariant,
    isGenerating,
    rateLimitStatus,
    isRateLimited,
    context,
    generateVariants,
    selectVariant,
  } = useVariants();

  const [hasGenerated, setHasGenerated] = useState(false);

  const handleGenerate = useCallback(
    async (config: VariantGeneratorConfig) => {
      const result = await generateVariants({
        rawIdea: config.rawIdea,
        profileId: config.profileId,
        projectId: config.projectId,
        platformId: config.platformId,
        goal: config.goal,
        variants: config.variantCount,
      });

      if (result) {
        setHasGenerated(true);
      }
    },
    [generateVariants]
  );

  const handleViewPost = useCallback(
    (variant: VariantData) => {
      router.push(`${ROUTES.POSTS}/${variant.postId}`);
    },
    [router]
  );

  const handleBackToGenerate = useCallback(() => {
    router.push(ROUTES.GENERATE);
  }, [router]);

  if (profilesLoading) {
    return <VariantsPageSkeleton />;
  }

  return (
    <div className="container mx-auto py-6 px-4 md:py-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBackToGenerate}
            className="shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10">
            <Layers className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">A/B Variant Generator</h1>
            <p className="text-muted-foreground">
              Generate multiple post variations with different approaches
            </p>
          </div>
        </div>
        <RateLimitStatusDisplay status={rateLimitStatus} />
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left: Generator Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Generate Variants
            </CardTitle>
            <CardDescription>
              Enter your idea and configure the generation settings. The AI will create
              multiple versions using different writing approaches.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <VariantGenerator
              profiles={profiles}
              projects={projects}
              platforms={platforms}
              isLoadingProfiles={profilesLoading}
              isLoadingProjects={projectsLoading}
              isLoadingPlatforms={platformsLoading}
              isGenerating={isGenerating}
              isRateLimited={isRateLimited}
              onGenerate={handleGenerate}
            />
          </CardContent>
        </Card>

        {/* Right: Results */}
        <div className="space-y-6">
          {!hasGenerated && !isGenerating ? (
            <Card className="h-full flex items-center justify-center min-h-[400px]">
              <CardContent className="text-center space-y-4 py-12">
                <div className="relative mx-auto w-fit">
                  <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary/10">
                    <Layers className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Ready to Generate</h3>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    Fill in your post idea and click generate. You&apos;ll receive multiple
                    variations to compare and choose from.
                  </p>
                </div>
                <div className="flex flex-wrap justify-center gap-2 pt-2">
                  <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                    Direct
                  </span>
                  <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                    Storytelling
                  </span>
                  <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                    Data-Driven
                  </span>
                  <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">
                    Emotional
                  </span>
                </div>
              </CardContent>
            </Card>
          ) : isGenerating ? (
            <Card className="h-full flex items-center justify-center min-h-[400px]">
              <CardContent className="text-center space-y-4 py-12">
                <div className="relative mx-auto w-fit">
                  <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 animate-pulse">
                    <Sparkles className="h-8 w-8 text-primary animate-spin" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Generating Variants...</h3>
                  <p className="text-sm text-muted-foreground">
                    Creating multiple post variations with different approaches
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layers className="h-5 w-5 text-primary" />
                  Compare Variants
                </CardTitle>
                <CardDescription>
                  Click on a variant to select it, then copy or view the full post.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <VariantComparison
                  variants={variants}
                  selectedVariant={selectedVariant}
                  onSelectVariant={selectVariant}
                  onViewPost={handleViewPost}
                  context={context}
                />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
