"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Sparkles, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Profile, Project, Platform, GenerateIdeasRequest } from "@/types";

const NONE_VALUE = "none";

const generateIdeasSchema = z.object({
  profileId: z.string().optional(),
  projectId: z.string().optional(),
  platformId: z.string().optional(),
  auto: z.boolean().default(false),
  customContext: z
    .string()
    .max(2000, "Custom context must be 2000 characters or less")
    .optional(),
  count: z.number().min(1).max(20).default(10),
  excludeRecentTopics: z.boolean().default(true),
});

type GenerateIdeasFormData = z.infer<typeof generateIdeasSchema>;

interface GenerateIdeasFormProps {
  profiles: Profile[];
  projects: Project[];
  platforms: Platform[];
  onSubmit: (data: GenerateIdeasRequest) => Promise<boolean>;
  isLoading: boolean;
}

export function GenerateIdeasForm({
  profiles,
  projects,
  platforms,
  onSubmit,
  isLoading,
}: GenerateIdeasFormProps) {
  const [autoMode, setAutoMode] = useState(false);

  const form = useForm<GenerateIdeasFormData>({
    resolver: zodResolver(generateIdeasSchema),
    defaultValues: {
      auto: false,
      count: 10,
      excludeRecentTopics: true,
    },
  });

  const handleSubmit = async (data: GenerateIdeasFormData) => {
    const request: GenerateIdeasRequest = {
      count: data.count,
      excludeRecentTopics: data.excludeRecentTopics,
    };

    if (autoMode) {
      request.auto = true;
    } else {
      if (data.profileId && data.profileId !== NONE_VALUE) {
        request.profileId = data.profileId;
      }
      if (data.projectId && data.projectId !== NONE_VALUE) {
        request.projectId = data.projectId;
      }
      if (data.platformId && data.platformId !== NONE_VALUE) {
        request.platformId = data.platformId;
      }
      if (data.customContext?.trim()) {
        request.customContext = data.customContext.trim();
      }
    }

    await onSubmit(request);
  };

  const customContext = form.watch("customContext") || "";
  const characterCount = customContext.length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <Wand2 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle>Generate Ideas</CardTitle>
            <CardDescription>
              Create AI-powered post ideas based on your context
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Auto Mode Toggle */}
          <div className="flex items-center space-x-2 p-4 rounded-lg bg-muted/50">
            <Checkbox
              id="auto-mode"
              checked={autoMode}
              onCheckedChange={(checked) => setAutoMode(checked === true)}
            />
            <div className="space-y-1">
              <Label htmlFor="auto-mode" className="font-medium cursor-pointer">
                Auto Mode
              </Label>
              <p className="text-sm text-muted-foreground">
                Automatically select the best context from your profiles,
                projects, and platforms
              </p>
            </div>
          </div>

          {!autoMode && (
            <>
              {/* Context Selectors */}
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="profile">Profile</Label>
                  <Select
                    value={form.watch("profileId") || NONE_VALUE}
                    onValueChange={(value) =>
                      form.setValue(
                        "profileId",
                        value === NONE_VALUE ? undefined : value
                      )
                    }
                    disabled={profiles.length === 0}
                  >
                    <SelectTrigger id="profile">
                      <SelectValue placeholder="Select profile" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NONE_VALUE}>No profile</SelectItem>
                      {profiles.map((profile) => (
                        <SelectItem key={profile.id} value={profile.id}>
                          {profile.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="project">Project</Label>
                  <Select
                    value={form.watch("projectId") || NONE_VALUE}
                    onValueChange={(value) =>
                      form.setValue(
                        "projectId",
                        value === NONE_VALUE ? undefined : value
                      )
                    }
                    disabled={projects.length === 0}
                  >
                    <SelectTrigger id="project">
                      <SelectValue placeholder="Select project" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NONE_VALUE}>No project</SelectItem>
                      {projects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="platform">Platform</Label>
                  <Select
                    value={form.watch("platformId") || NONE_VALUE}
                    onValueChange={(value) =>
                      form.setValue(
                        "platformId",
                        value === NONE_VALUE ? undefined : value
                      )
                    }
                    disabled={platforms.length === 0}
                  >
                    <SelectTrigger id="platform">
                      <SelectValue placeholder="Select platform" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NONE_VALUE}>No platform</SelectItem>
                      {platforms.map((platform) => (
                        <SelectItem key={platform.id} value={platform.id}>
                          {platform.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Custom Context */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="custom-context">Custom Context</Label>
                  <span className="text-xs text-muted-foreground">
                    {characterCount}/2000
                  </span>
                </div>
                <Textarea
                  id="custom-context"
                  placeholder="Add additional context for idea generation (e.g., 'Focus on AI and tech leadership')"
                  {...form.register("customContext")}
                  rows={3}
                  className="resize-none"
                />
                {form.formState.errors.customContext && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.customContext.message}
                  </p>
                )}
              </div>
            </>
          )}

          {/* Generation Options */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="count">Number of Ideas</Label>
              <Input
                id="count"
                type="number"
                min={1}
                max={20}
                {...form.register("count", { valueAsNumber: true })}
              />
              {form.formState.errors.count && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.count.message}
                </p>
              )}
            </div>

            <div className="flex items-end pb-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="exclude-recent"
                  checked={form.watch("excludeRecentTopics")}
                  onCheckedChange={(checked) =>
                    form.setValue("excludeRecentTopics", checked === true)
                  }
                />
                <Label
                  htmlFor="exclude-recent"
                  className="text-sm cursor-pointer"
                >
                  Avoid recent topics
                </Label>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full gap-2"
            size="lg"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating Ideas...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Generate Ideas
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
