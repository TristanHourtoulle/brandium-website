"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { profileSchema, type ProfileFormData } from "@/lib/utils/validation";
import { TONE_SUGGESTIONS } from "@/types";
import { useProfiles } from "@/lib/hooks/use-profiles";
import { useOnboardingContext } from "@/lib/providers/onboarding-provider";

interface OnboardingStepProfileProps {
  onComplete: () => void;
}

export function OnboardingStepProfile({ onComplete }: OnboardingStepProfileProps) {
  const { createProfile } = useProfiles();
  const { setProfileData, data, setLoading } = useOnboardingContext();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: data.profileFormData?.name ?? "",
      bio: data.profileFormData?.bio ?? "",
      tone: data.profileFormData?.tone ?? [],
      doRules: data.profileFormData?.doRules ?? [],
      dontRules: data.profileFormData?.dontRules ?? [],
    },
  });

  const watchedTone = watch("tone");
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

  const onSubmit = async (formData: ProfileFormData) => {
    setIsSubmitting(true);
    setLoading(true);

    try {
      const profile = await createProfile({
        name: formData.name,
        bio: formData.bio,
        tone: formData.tone,
        doRules: formData.doRules || [],
        dontRules: formData.dontRules || [],
      });

      if (profile) {
        setProfileData(profile, formData);
        onComplete();
      }
    } catch {
      toast.error("Failed to create profile. Please try again.");
    } finally {
      setIsSubmitting(false);
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        {/* Profile Name */}
        <div className="space-y-2">
          <Label htmlFor="name">Profile Name</Label>
          <Input
            id="name"
            placeholder="e.g., My Personal Brand"
            {...register("name")}
            disabled={isSubmitting}
          />
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name.message}</p>
          )}
          <p className="text-xs text-muted-foreground">
            Give your profile a memorable name
          </p>
        </div>

        {/* Bio */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="bio">Bio / Description</Label>
            <span className="text-xs text-muted-foreground">
              {watchedBio?.length || 0}/500
            </span>
          </div>
          <Textarea
            id="bio"
            placeholder="Describe your brand's personality and voice..."
            className="min-h-[100px] resize-none"
            {...register("bio")}
            disabled={isSubmitting}
          />
          {errors.bio && (
            <p className="text-sm text-destructive">{errors.bio.message}</p>
          )}
          <p className="text-xs text-muted-foreground">
            This helps the AI understand your brand&apos;s tone
          </p>
        </div>

        {/* Tone Selection */}
        <div className="space-y-2">
          <Label>Tone & Style</Label>
          <p className="text-xs text-muted-foreground mb-2">
            Select up to 5 tones that define your voice
          </p>
          <div className="flex flex-wrap gap-2">
            {TONE_SUGGESTIONS.map((tone) => {
              const isSelected = watchedTone?.includes(tone);
              return (
                <Badge
                  key={tone}
                  variant={isSelected ? "default" : "outline"}
                  className="cursor-pointer capitalize transition-colors hover:bg-primary/80"
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
            <p className="text-xs text-muted-foreground mt-2">
              Selected: {watchedTone.join(", ")}
            </p>
          )}
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Create Profile & Continue
        </Button>
      </div>
    </form>
  );
}
