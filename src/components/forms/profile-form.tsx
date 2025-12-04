"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, X, Loader2 } from "lucide-react";
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
import { profileSchema, type ProfileFormData } from "@/lib/utils/validation";
import { TONE_SUGGESTIONS } from "@/types";

interface ProfileFormProps {
  defaultValues?: Partial<ProfileFormData>;
  onSubmit: (data: ProfileFormData) => Promise<void>;
  isLoading?: boolean;
  submitLabel?: string;
}

export function ProfileForm({
  defaultValues,
  onSubmit,
  isLoading = false,
  submitLabel = "Create Profile",
}: ProfileFormProps) {
  const [newDoRule, setNewDoRule] = useState("");
  const [newDontRule, setNewDontRule] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: defaultValues?.name ?? "",
      bio: defaultValues?.bio ?? "",
      tone: defaultValues?.tone ?? [],
      doRules: defaultValues?.doRules ?? [],
      dontRules: defaultValues?.dontRules ?? [],
    },
  });

  const watchedTone = watch("tone");
  const watchedDoRules = watch("doRules");
  const watchedDontRules = watch("dontRules");
  const watchedBio = watch("bio");

  const toggleTone = (tone: string) => {
    const current = watchedTone || [];
    if (current.includes(tone)) {
      setValue(
        "tone",
        current.filter((t) => t !== tone),
        { shouldValidate: true }
      );
    } else if (current.length < 5) {
      setValue("tone", [...current, tone], { shouldValidate: true });
    }
  };

  const addDoRule = () => {
    if (newDoRule.trim()) {
      const current = watchedDoRules || [];
      setValue("doRules", [...current, newDoRule.trim()]);
      setNewDoRule("");
    }
  };

  const removeDoRule = (index: number) => {
    const current = watchedDoRules || [];
    setValue(
      "doRules",
      current.filter((_, i) => i !== index)
    );
  };

  const addDontRule = () => {
    if (newDontRule.trim()) {
      const current = watchedDontRules || [];
      setValue("dontRules", [...current, newDontRule.trim()]);
      setNewDontRule("");
    }
  };

  const removeDontRule = (index: number) => {
    const current = watchedDontRules || [];
    setValue(
      "dontRules",
      current.filter((_, i) => i !== index)
    );
  };

  const handleKeyDown = (
    e: React.KeyboardEvent,
    action: () => void
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      action();
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>
            Define the name and description for this profile.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Profile Name</Label>
            <Input
              id="name"
              placeholder="e.g., Professional LinkedIn"
              {...register("name")}
              disabled={isLoading}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="bio">Bio / Description</Label>
              <span className="text-xs text-muted-foreground">
                {watchedBio?.length || 0}/500
              </span>
            </div>
            <Textarea
              id="bio"
              placeholder="Describe this profile's personality and voice..."
              className="min-h-[100px]"
              {...register("bio")}
              disabled={isLoading}
            />
            {errors.bio && (
              <p className="text-sm text-destructive">{errors.bio.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tone */}
      <Card>
        <CardHeader>
          <CardTitle>Tone & Style</CardTitle>
          <CardDescription>
            Select up to 5 tones that define this profile&apos;s voice.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {TONE_SUGGESTIONS.map((tone) => {
              const isSelected = watchedTone?.includes(tone);
              return (
                <Badge
                  key={tone}
                  variant={isSelected ? "default" : "outline"}
                  className="cursor-pointer capitalize transition-colors"
                  onClick={() => toggleTone(tone)}
                >
                  {tone}
                </Badge>
              );
            })}
          </div>
          {errors.tone && (
            <p className="text-sm text-destructive">{errors.tone.message}</p>
          )}
          {watchedTone && watchedTone.length > 0 && (
            <div className="pt-2">
              <p className="text-sm text-muted-foreground">
                Selected: {watchedTone.join(", ")}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Do Rules */}
      <Card>
        <CardHeader>
          <CardTitle>Do Rules</CardTitle>
          <CardDescription>
            Guidelines for what this profile should do in content.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="e.g., Use emojis sparingly"
              value={newDoRule}
              onChange={(e) => setNewDoRule(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, addDoRule)}
              disabled={isLoading}
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={addDoRule}
              disabled={isLoading || !newDoRule.trim()}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {watchedDoRules && watchedDoRules.length > 0 && (
            <ul className="space-y-2">
              {watchedDoRules.map((rule, index) => (
                <li
                  key={index}
                  className="flex items-center justify-between rounded-md border bg-muted/50 px-3 py-2"
                >
                  <span className="text-sm">{rule}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => removeDoRule(index)}
                    disabled={isLoading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Don't Rules */}
      <Card>
        <CardHeader>
          <CardTitle>Don&apos;t Rules</CardTitle>
          <CardDescription>
            Guidelines for what this profile should avoid in content.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="e.g., Avoid technical jargon"
              value={newDontRule}
              onChange={(e) => setNewDontRule(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, addDontRule)}
              disabled={isLoading}
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={addDontRule}
              disabled={isLoading || !newDontRule.trim()}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {watchedDontRules && watchedDontRules.length > 0 && (
            <ul className="space-y-2">
              {watchedDontRules.map((rule, index) => (
                <li
                  key={index}
                  className="flex items-center justify-between rounded-md border bg-muted/50 px-3 py-2"
                >
                  <span className="text-sm">{rule}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => removeDontRule(index)}
                    disabled={isLoading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
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
