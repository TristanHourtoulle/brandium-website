"use client";

import { useState, useCallback } from "react";
import { Loader2, Sparkles, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils/cn";
import type { Profile, Project, Platform } from "@/types";

interface VariantGeneratorProps {
  profiles: Profile[];
  projects: Project[];
  platforms: Platform[];
  isLoadingProfiles?: boolean;
  isLoadingProjects?: boolean;
  isLoadingPlatforms?: boolean;
  isGenerating?: boolean;
  isRateLimited?: boolean;
  onGenerate: (config: VariantGeneratorConfig) => void;
  className?: string;
}

export interface VariantGeneratorConfig {
  rawIdea: string;
  profileId: string;
  projectId?: string;
  platformId?: string;
  goal?: string;
  variantCount: number;
}

export function VariantGenerator({
  profiles,
  projects,
  platforms,
  isLoadingProfiles = false,
  isLoadingProjects = false,
  isLoadingPlatforms = false,
  isGenerating = false,
  isRateLimited = false,
  onGenerate,
  className,
}: VariantGeneratorProps) {
  const [rawIdea, setRawIdea] = useState("");
  const [selectedProfileId, setSelectedProfileId] = useState<string>("");
  const [selectedProjectId, setSelectedProjectId] = useState<string | undefined>();
  const [selectedPlatformId, setSelectedPlatformId] = useState<string | undefined>();
  const [goal, setGoal] = useState("");
  const [variantCount, setVariantCount] = useState(3);

  // Auto-select first profile
  if (!selectedProfileId && profiles.length > 0) {
    setSelectedProfileId(profiles[0].id);
  }

  const canGenerate = rawIdea.trim() && selectedProfileId && !isGenerating && !isRateLimited;

  const handleGenerate = useCallback(() => {
    if (!canGenerate) return;

    onGenerate({
      rawIdea: rawIdea.trim(),
      profileId: selectedProfileId,
      projectId: selectedProjectId,
      platformId: selectedPlatformId,
      goal: goal.trim() || undefined,
      variantCount,
    });
  }, [
    canGenerate,
    rawIdea,
    selectedProfileId,
    selectedProjectId,
    selectedPlatformId,
    goal,
    variantCount,
    onGenerate,
  ]);

  return (
    <div className={cn("space-y-6", className)}>
      {/* Idea Input */}
      <div className="space-y-2">
        <Label htmlFor="raw-idea" className="text-sm font-medium">
          What do you want to post about? <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="raw-idea"
          value={rawIdea}
          onChange={(e) => setRawIdea(e.target.value)}
          placeholder="Describe your post idea... e.g., Share insights about how AI is transforming personal branding"
          rows={4}
          disabled={isGenerating}
          className="resize-none"
        />
        <p className="text-xs text-muted-foreground">
          Be specific about your topic. The AI will generate multiple variations with different approaches.
        </p>
      </div>

      {/* Configuration Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Profile Selector */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">
            Profile <span className="text-destructive">*</span>
          </Label>
          {isLoadingProfiles ? (
            <Skeleton className="h-10 w-full" />
          ) : (
            <Select
              value={selectedProfileId}
              onValueChange={setSelectedProfileId}
              disabled={isGenerating}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a profile" />
              </SelectTrigger>
              <SelectContent>
                {profiles.map((profile) => (
                  <SelectItem key={profile.id} value={profile.id}>
                    {profile.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Platform Selector */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Platform</Label>
          {isLoadingPlatforms ? (
            <Skeleton className="h-10 w-full" />
          ) : (
            <Select
              value={selectedPlatformId ?? "none"}
              onValueChange={(v) => setSelectedPlatformId(v === "none" ? undefined : v)}
              disabled={isGenerating}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Any platform</SelectItem>
                {platforms.map((platform) => (
                  <SelectItem key={platform.id} value={platform.id}>
                    {platform.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Project Selector */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Project</Label>
          {isLoadingProjects ? (
            <Skeleton className="h-10 w-full" />
          ) : (
            <Select
              value={selectedProjectId ?? "none"}
              onValueChange={(v) => setSelectedProjectId(v === "none" ? undefined : v)}
              disabled={isGenerating}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a project" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No project</SelectItem>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Goal Input */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Goal</Label>
          <input
            type="text"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="e.g., Drive traffic to blog"
            disabled={isGenerating}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
      </div>

      {/* Variant Count Slider */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Layers className="h-4 w-4" />
            Number of Variants
          </Label>
          <span className="text-sm font-medium text-primary">{variantCount}</span>
        </div>
        <Slider
          value={[variantCount]}
          onValueChange={([value]) => setVariantCount(value)}
          min={2}
          max={4}
          step={1}
          disabled={isGenerating}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>2 variants</span>
          <span>3 variants</span>
          <span>4 variants</span>
        </div>
        <p className="text-xs text-muted-foreground">
          Each variant uses a different approach: Direct, Storytelling, Data-Driven, or Emotional.
        </p>
      </div>

      {/* Generate Button */}
      <Button
        onClick={handleGenerate}
        disabled={!canGenerate}
        className="w-full"
        size="lg"
      >
        {isGenerating ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Generating {variantCount} variants...
          </>
        ) : isRateLimited ? (
          "Rate limit reached"
        ) : (
          <>
            <Sparkles className="h-4 w-4 mr-2" />
            Generate {variantCount} Variants
          </>
        )}
      </Button>
    </div>
  );
}
