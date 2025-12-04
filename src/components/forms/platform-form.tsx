"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { platformSchema, type PlatformFormData } from "@/lib/utils/validation";
import { PLATFORM_SUGGESTIONS } from "@/types";

interface PlatformFormProps {
  defaultValues?: Partial<PlatformFormData>;
  onSubmit: (data: PlatformFormData) => Promise<void>;
  isLoading?: boolean;
  submitLabel?: string;
}

export function PlatformForm({
  defaultValues,
  onSubmit,
  isLoading = false,
  submitLabel = "Add Platform",
}: PlatformFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PlatformFormData>({
    resolver: zodResolver(platformSchema),
    defaultValues: {
      name: defaultValues?.name ?? "",
      styleGuidelines: defaultValues?.styleGuidelines ?? "",
      maxLength: defaultValues?.maxLength ?? undefined,
    },
  });

  const watchedName = watch("name");
  const watchedStyleGuidelines = watch("styleGuidelines");

  const selectPlatformSuggestion = (suggestion: string) => {
    setValue("name", suggestion, { shouldValidate: true });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Platform Name */}
      <Card>
        <CardHeader>
          <CardTitle>Platform</CardTitle>
          <CardDescription>
            Choose or enter the social media platform name.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Platform Name</Label>
            <Input
              id="name"
              placeholder="e.g., LinkedIn"
              {...register("name")}
              disabled={isLoading}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Quick select:</p>
            <div className="flex flex-wrap gap-2">
              {PLATFORM_SUGGESTIONS.map((suggestion) => {
                const isSelected = watchedName === suggestion;
                return (
                  <Badge
                    key={suggestion}
                    variant={isSelected ? "default" : "outline"}
                    className="cursor-pointer transition-colors"
                    onClick={() => selectPlatformSuggestion(suggestion)}
                  >
                    {suggestion}
                  </Badge>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Style Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle>Style Guidelines</CardTitle>
          <CardDescription>
            Define the style, tone, and formatting preferences for this
            platform.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="styleGuidelines">Guidelines</Label>
              <span className="text-xs text-muted-foreground">
                {watchedStyleGuidelines?.length || 0}/1000
              </span>
            </div>
            <Textarea
              id="styleGuidelines"
              placeholder="e.g., Professional tone, use hashtags sparingly, include a call-to-action..."
              className="min-h-[150px]"
              {...register("styleGuidelines")}
              disabled={isLoading}
            />
            {errors.styleGuidelines && (
              <p className="text-sm text-destructive">
                {errors.styleGuidelines.message}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Character Limit */}
      <Card>
        <CardHeader>
          <CardTitle>Character Limit</CardTitle>
          <CardDescription>
            Optional: Set a maximum character count for posts on this platform.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="maxLength">Max Characters (optional)</Label>
            <Input
              id="maxLength"
              type="number"
              placeholder="e.g., 280 for X/Twitter"
              {...register("maxLength", {
                setValueAs: (v) => (v === "" ? undefined : parseInt(v, 10)),
              })}
              disabled={isLoading}
            />
            {errors.maxLength && (
              <p className="text-sm text-destructive">
                {errors.maxLength.message}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Common limits: X/Twitter (280), LinkedIn (3000), Instagram (2200)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Submit */}
      <div className="flex justify-end gap-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
