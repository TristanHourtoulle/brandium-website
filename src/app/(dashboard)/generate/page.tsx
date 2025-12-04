"use client";

import { useProfiles } from "@/lib/hooks/use-profiles";
import { useProjects } from "@/lib/hooks/use-projects";
import { usePlatforms } from "@/lib/hooks/use-platforms";
import { useGenerate } from "@/lib/hooks/use-generate";
import { GenerateForm } from "@/components/forms/generate-form";
import {
  RateLimitStatusDisplay,
  GenerationResult,
} from "@/components/features/generate";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles } from "lucide-react";
import type { GenerateFormData } from "@/lib/utils/validation";

export default function GeneratePage() {
  const { profiles, isLoading: profilesLoading } = useProfiles();
  const { projects, isLoading: projectsLoading } = useProjects();
  const { platforms, isLoading: platformsLoading } = usePlatforms();

  const {
    generatedPost,
    isGenerating,
    rateLimitStatus,
    isRateLimited,
    generate,
    regenerate,
    clear,
  } = useGenerate();

  const handleSubmit = async (data: GenerateFormData) => {
    await generate({
      profileId: data.profileId,
      projectId: data.projectId,
      platformId: data.platformId,
      goal: data.goal,
      rawIdea: data.rawIdea,
    });
  };

  const handleRegenerate = async () => {
    await regenerate();
  };

  // Find selected entities for the result display
  const selectedProfile = generatedPost
    ? profiles.find((p) => p.id === generatedPost.profileId)
    : null;
  const selectedProject = generatedPost?.projectId
    ? projects.find((p) => p.id === generatedPost.projectId)
    : null;
  const selectedPlatform = generatedPost?.platformId
    ? platforms.find((p) => p.id === generatedPost.platformId)
    : null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Generate Content"
        description="Create personalized social media posts using AI"
      >
        <RateLimitStatusDisplay status={rateLimitStatus} />
      </PageHeader>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Form Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              New Generation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <GenerateForm
              profiles={profiles}
              projects={projects}
              platforms={platforms}
              isLoadingProfiles={profilesLoading}
              isLoadingProjects={projectsLoading}
              isLoadingPlatforms={platformsLoading}
              onSubmit={handleSubmit}
              isSubmitting={isGenerating}
              isRateLimited={isRateLimited}
            />
          </CardContent>
        </Card>

        {/* Result Section */}
        <div className="space-y-4">
          {isGenerating && !generatedPost && (
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-32 w-full" />
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-8 w-16" />
                </div>
              </CardContent>
            </Card>
          )}

          {generatedPost && (
            <GenerationResult
              post={generatedPost}
              profile={selectedProfile}
              project={selectedProject}
              platform={selectedPlatform}
              onRegenerate={handleRegenerate}
              onDismiss={clear}
              isRegenerating={isGenerating}
            />
          )}

          {!isGenerating && !generatedPost && (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Sparkles className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground text-center">
                  Fill out the form and click &quot;Generate Content&quot; to create your
                  personalized post.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
