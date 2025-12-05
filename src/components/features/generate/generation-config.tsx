"use client";

import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  User,
  Briefcase,
  Monitor,
  Target,
  ChevronDown,
  ChevronUp,
  Settings2,
} from "lucide-react";
import { useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import type { Profile, Project, Platform } from "@/types";

interface GenerationConfigProps {
  profiles: Profile[];
  projects: Project[];
  platforms: Platform[];
  selectedProfileId: string;
  selectedProjectId?: string;
  selectedPlatformId?: string;
  goal: string;
  isLoadingProfiles?: boolean;
  isLoadingProjects?: boolean;
  isLoadingPlatforms?: boolean;
  onProfileChange: (id: string) => void;
  onProjectChange: (id: string | undefined) => void;
  onPlatformChange: (id: string | undefined) => void;
  onGoalChange: (goal: string) => void;
  disabled?: boolean;
  className?: string;
}

export function GenerationConfig({
  profiles,
  projects,
  platforms,
  selectedProfileId,
  selectedProjectId,
  selectedPlatformId,
  goal,
  isLoadingProfiles = false,
  isLoadingProjects = false,
  isLoadingPlatforms = false,
  onProfileChange,
  onProjectChange,
  onPlatformChange,
  onGoalChange,
  disabled = false,
  className,
}: GenerationConfigProps) {
  const [isOpen, setIsOpen] = useState(true);

  const selectedProfile = profiles.find((p) => p.id === selectedProfileId);
  const selectedProject = projects.find((p) => p.id === selectedProjectId);
  const selectedPlatform = platforms.find((p) => p.id === selectedPlatformId);

  return (
    <div className={cn("space-y-4", className)}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="w-full justify-between h-auto py-3 px-4 hover:bg-muted/50"
          >
            <span className="flex items-center gap-2 text-sm font-medium">
              <Settings2 className="h-4 w-4 text-blue-600" />
              Generation Settings
            </span>
            <div className="flex items-center gap-2">
              {selectedProfile && (
                <Badge variant="secondary" className="text-xs">
                  {selectedProfile.name}
                </Badge>
              )}
              {isOpen ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </div>
          </Button>
        </CollapsibleTrigger>

        <CollapsibleContent className="pt-4 space-y-4 px-4 max-w-full">
          {/* Profile Selector - Required */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              Profile <span className="text-destructive">*</span>
            </Label>
            {isLoadingProfiles ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <Select
                value={selectedProfileId}
                onValueChange={onProfileChange}
                disabled={disabled}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a profile" />
                </SelectTrigger>
                <SelectContent>
                  {profiles.map((profile) => (
                    <SelectItem key={profile.id} value={profile.id}>
                      <div className="flex items-center gap-2">
                        <span>{profile.name}</span>
                        <span className="text-xs text-muted-foreground">
                          ({profile.tone.slice(0, 2).join(", ")})
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {selectedProfile && (
              <p className="text-xs text-muted-foreground line-clamp-2">
                {selectedProfile.bio}
              </p>
            )}
          </div>

          {/* Project Selector - Optional */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm">
              <Briefcase className="h-4 w-4 text-muted-foreground" />
              Project <span className="text-xs text-muted-foreground">(optional)</span>
            </Label>
            {isLoadingProjects ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <Select
                value={selectedProjectId || "none"}
                onValueChange={(value) =>
                  onProjectChange(value === "none" ? undefined : value)
                }
                disabled={disabled}
              >
                <SelectTrigger className="w-full">
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
            {selectedProject && (
              <p className="text-xs text-muted-foreground line-clamp-2">
                {selectedProject.description}
              </p>
            )}
          </div>

          {/* Platform Selector - Optional */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm">
              <Monitor className="h-4 w-4 text-muted-foreground" />
              Platform <span className="text-xs text-muted-foreground">(optional)</span>
            </Label>
            {isLoadingPlatforms ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <Select
                value={selectedPlatformId || "none"}
                onValueChange={(value) =>
                  onPlatformChange(value === "none" ? undefined : value)
                }
                disabled={disabled}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No platform</SelectItem>
                  {platforms.map((platform) => (
                    <SelectItem key={platform.id} value={platform.id}>
                      <div className="flex items-center gap-2">
                        <span>{platform.name}</span>
                        {platform.maxLength && (
                          <span className="text-xs text-muted-foreground">
                            ({platform.maxLength} chars)
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {selectedPlatform?.styleGuidelines && (
              <p className="text-xs text-muted-foreground line-clamp-2">
                {selectedPlatform.styleGuidelines}
              </p>
            )}
          </div>

          {/* Goal Input - Optional */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm">
              <Target className="h-4 w-4 text-muted-foreground" />
              Goal <span className="text-xs text-muted-foreground">(optional)</span>
            </Label>
            <Input
              value={goal}
              onChange={(e) => onGoalChange(e.target.value)}
              placeholder="e.g., Drive traffic to my blog"
              disabled={disabled}
              className="h-9"
            />
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Quick summary when collapsed */}
      {!isOpen && (selectedProject || selectedPlatform || goal) && (
        <div className="flex flex-wrap gap-1 px-4">
          {selectedProject && (
            <Badge variant="outline" className="text-xs">
              <Briefcase className="h-3 w-3 mr-1" />
              {selectedProject.name}
            </Badge>
          )}
          {selectedPlatform && (
            <Badge variant="outline" className="text-xs">
              <Monitor className="h-3 w-3 mr-1" />
              {selectedPlatform.name}
            </Badge>
          )}
          {goal && (
            <Badge variant="outline" className="text-xs">
              <Target className="h-3 w-3 mr-1" />
              Goal set
            </Badge>
          )}
        </div>
      )}

      {/* No profile warning */}
      {profiles.length === 0 && !isLoadingProfiles && (
        <div className="px-4">
          <p className="text-sm text-amber-600 dark:text-amber-500">
            Create a profile first to start generating content.
          </p>
        </div>
      )}
    </div>
  );
}
