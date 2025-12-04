"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { EntitySelector } from "@/components/features/generate";
import { Badge } from "@/components/ui/badge";
import {
  generateRequestSchema,
  type GenerateFormData,
} from "@/lib/utils/validation";
import { truncateText } from "@/lib/utils/format";
import type { Profile, Project, Platform } from "@/types";

interface GenerateFormProps {
  profiles: Profile[];
  projects: Project[];
  platforms: Platform[];
  isLoadingProfiles?: boolean;
  isLoadingProjects?: boolean;
  isLoadingPlatforms?: boolean;
  onSubmit: (data: GenerateFormData) => Promise<void>;
  isSubmitting?: boolean;
  isRateLimited?: boolean;
}

export function GenerateForm({
  profiles,
  projects,
  platforms,
  isLoadingProfiles = false,
  isLoadingProjects = false,
  isLoadingPlatforms = false,
  onSubmit,
  isSubmitting = false,
  isRateLimited = false,
}: GenerateFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<GenerateFormData>({
    resolver: zodResolver(generateRequestSchema),
    defaultValues: {
      profileId: "",
      projectId: undefined,
      platformId: undefined,
      goal: "",
      rawIdea: "",
    },
  });

  const watchedProfileId = watch("profileId");
  const watchedProjectId = watch("projectId");
  const watchedPlatformId = watch("platformId");
  const watchedRawIdea = watch("rawIdea") || "";

  // selectedPlatform could be used in future for character limit display
  const _selectedPlatform = platforms.find((p) => p.id === watchedPlatformId);
  void _selectedPlatform; // Suppress unused variable warning

  const handleFormSubmit = async (data: GenerateFormData) => {
    await onSubmit(data);
  };

  const renderProfilePreview = (profile: Profile) => (
    <div className="space-y-1 text-sm">
      <p className="text-muted-foreground line-clamp-2">{profile.bio}</p>
      <div className="flex flex-wrap gap-1">
        {profile.tone.slice(0, 3).map((t) => (
          <Badge key={t} variant="outline" className="text-xs">
            {t}
          </Badge>
        ))}
        {profile.tone.length > 3 && (
          <Badge variant="outline" className="text-xs">
            +{profile.tone.length - 3}
          </Badge>
        )}
      </div>
    </div>
  );

  const renderProjectPreview = (project: Project) => (
    <div className="space-y-1 text-sm">
      <p className="text-muted-foreground line-clamp-2">{project.description}</p>
      <p className="text-xs">
        <span className="font-medium">Audience:</span> {truncateText(project.audience, 50)}
      </p>
    </div>
  );

  const renderPlatformPreview = (platform: Platform) => (
    <div className="space-y-1 text-sm">
      <p className="text-muted-foreground line-clamp-2">
        {platform.styleGuidelines}
      </p>
      {platform.maxLength && (
        <p className="text-xs">
          <span className="font-medium">Max length:</span> {platform.maxLength} characters
        </p>
      )}
    </div>
  );

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Profile Selector (required) */}
      <EntitySelector
        label="Profile"
        placeholder="Select a profile..."
        entities={profiles}
        value={watchedProfileId}
        onChange={(value) => setValue("profileId", value || "")}
        isLoading={isLoadingProfiles}
        required
        description="Choose the personal branding profile to use"
        emptyMessage="No profiles yet. Create one first!"
        renderPreview={renderProfilePreview}
        disabled={isSubmitting}
      />
      {errors.profileId && (
        <p className="text-sm text-destructive -mt-4">
          {errors.profileId.message}
        </p>
      )}

      {/* Project Selector (optional) */}
      <EntitySelector
        label="Project"
        placeholder="Select a project (optional)..."
        entities={projects}
        value={watchedProjectId}
        onChange={(value) => setValue("projectId", value)}
        isLoading={isLoadingProjects}
        description="Optionally focus content on a specific project"
        emptyMessage="No projects yet"
        renderPreview={renderProjectPreview}
        disabled={isSubmitting}
      />

      {/* Platform Selector (optional) */}
      <EntitySelector
        label="Platform"
        placeholder="Select a platform (optional)..."
        entities={platforms}
        value={watchedPlatformId}
        onChange={(value) => setValue("platformId", value)}
        isLoading={isLoadingPlatforms}
        description="Optionally tailor content for a specific platform"
        emptyMessage="No platforms yet"
        renderPreview={renderPlatformPreview}
        disabled={isSubmitting}
      />

      {/* Goal Input (optional) */}
      <div className="space-y-2">
        <Label htmlFor="goal">Goal (optional)</Label>
        <p className="text-sm text-muted-foreground">
          What do you want to achieve with this post?
        </p>
        <Input
          id="goal"
          placeholder="e.g., Drive traffic to my new blog post, Build authority in my niche..."
          {...register("goal")}
          disabled={isSubmitting}
        />
        {errors.goal && (
          <p className="text-sm text-destructive">{errors.goal.message}</p>
        )}
      </div>

      {/* Raw Idea (required) */}
      <div className="space-y-2">
        <Label htmlFor="rawIdea">
          Your Idea <span className="text-destructive">*</span>
        </Label>
        <p className="text-sm text-muted-foreground">
          Describe what you want to post about
        </p>
        <Textarea
          id="rawIdea"
          placeholder="e.g., I just finished a challenging project and learned a lot about time management. I want to share my top 3 lessons with my network..."
          rows={5}
          {...register("rawIdea")}
          disabled={isSubmitting}
        />
        <div className="flex justify-between">
          {errors.rawIdea ? (
            <p className="text-sm text-destructive">{errors.rawIdea.message}</p>
          ) : (
            <span />
          )}
          <span className="text-sm text-muted-foreground">
            {watchedRawIdea.length} / 2000
          </span>
        </div>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full"
        size="lg"
        disabled={
          isSubmitting ||
          isRateLimited ||
          !watchedProfileId ||
          profiles.length === 0
        }
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Generating...
          </>
        ) : isRateLimited ? (
          <>
            <Sparkles className="mr-2 h-5 w-5" />
            Rate Limited
          </>
        ) : (
          <>
            <Sparkles className="mr-2 h-5 w-5" />
            Generate Content
          </>
        )}
      </Button>

      {profiles.length === 0 && !isLoadingProfiles && (
        <p className="text-sm text-center text-muted-foreground">
          You need to create at least one profile before generating content.
        </p>
      )}
    </form>
  );
}
