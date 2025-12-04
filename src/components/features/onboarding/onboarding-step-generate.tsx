"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Sparkles, Copy, Check, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import confetti from "canvas-confetti";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useGenerate } from "@/lib/hooks/use-generate";
import { useOnboardingContext } from "@/lib/providers/onboarding-provider";
import { copyToClipboard } from "@/lib/utils/format";

const generateFormSchema = z.object({
  rawIdea: z
    .string()
    .min(10, "Your idea must be at least 10 characters")
    .max(2000, "Your idea must be less than 2000 characters"),
});

type GenerateFormData = z.infer<typeof generateFormSchema>;

interface OnboardingStepGenerateProps {
  onComplete: () => void;
}

export function OnboardingStepGenerate({ onComplete }: OnboardingStepGenerateProps) {
  const { generate, regenerate, generatedPost, isGenerating, rateLimitStatus, isRateLimited } = useGenerate();
  const { data, setPostData, completeOnboarding, prevStep } = useOnboardingContext();
  const [copied, setCopied] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  // Trigger confetti when post is generated
  const triggerCelebration = useCallback(() => {
    setShowCelebration(true);

    // Fire confetti
    const count = 200;
    const defaults = {
      origin: { y: 0.7 },
      zIndex: 9999,
    };

    function fire(particleRatio: number, opts: confetti.Options) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      });
    }

    fire(0.25, {
      spread: 26,
      startVelocity: 55,
    });
    fire(0.2, {
      spread: 60,
    });
    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2,
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 45,
    });
  }, []);

  // Show celebration when post is generated for the first time
  useEffect(() => {
    if (generatedPost && !showCelebration) {
      triggerCelebration();
    }
  }, [generatedPost, showCelebration, triggerCelebration]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<GenerateFormData>({
    resolver: zodResolver(generateFormSchema),
    defaultValues: {
      rawIdea: "",
    },
  });

  const watchedIdea = watch("rawIdea");

  const onSubmit = async (formData: GenerateFormData) => {
    if (!data.profile?.id) {
      toast.error("Profile not found. Please go back and create one.");
      return;
    }

    const post = await generate({
      profileId: data.profile.id,
      projectId: data.project?.id,
      platformId: data.platform?.id,
      rawIdea: formData.rawIdea,
    });

    if (post) {
      setPostData(post);
    }
  };

  const handleRegenerate = async () => {
    const post = await regenerate();
    if (post) {
      setPostData(post);
    }
  };

  const handleCopy = async () => {
    if (generatedPost?.content) {
      const success = await copyToClipboard(generatedPost.content);
      if (success) {
        setCopied(true);
        toast.success("Copied to clipboard!");
        setTimeout(() => setCopied(false), 2000);
      }
    }
  };

  const handleFinish = () => {
    completeOnboarding();
    onComplete();
  };

  const handleBack = () => {
    prevStep();
  };

  return (
    <div className="space-y-6">
      {/* Context info */}
      <div className="rounded-lg border bg-muted/30 p-4">
        <h4 className="text-sm font-medium mb-2">Your Setup</h4>
        <div className="flex flex-wrap gap-2">
          {data.profile && (
            <Badge variant="secondary">
              Profile: {data.profile.name}
            </Badge>
          )}
          {data.project && (
            <Badge variant="secondary">
              Project: {data.project.name}
            </Badge>
          )}
          {data.platform && (
            <Badge variant="secondary">
              Platform: {data.platform.name}
            </Badge>
          )}
        </div>
      </div>

      {!generatedPost ? (
        /* Generation form */
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="rawIdea">What do you want to post about?</Label>
              <span className="text-xs text-muted-foreground">
                {watchedIdea?.length || 0}/2000
              </span>
            </div>
            <Textarea
              id="rawIdea"
              placeholder="Share your idea, topic, or key message. The AI will transform it into an engaging post..."
              className="min-h-[150px] resize-none"
              {...register("rawIdea")}
              disabled={isGenerating}
            />
            {errors.rawIdea && (
              <p className="text-sm text-destructive">{errors.rawIdea.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Tips: Be specific about your topic. Include key points you want to mention.
            </p>
          </div>

          {/* Rate limit info */}
          {rateLimitStatus && (
            <div className="text-xs text-muted-foreground">
              {isRateLimited ? (
                <span className="text-destructive">
                  Rate limit reached. Resets at {new Date(rateLimitStatus.resetAt).toLocaleTimeString()}
                </span>
              ) : (
                <span>
                  {rateLimitStatus.remaining}/{rateLimitStatus.total} generations remaining
                </span>
              )}
            </div>
          )}

          <div className="flex justify-between pt-4">
            <Button type="button" variant="outline" onClick={handleBack} disabled={isGenerating}>
              Back
            </Button>
            <Button type="submit" disabled={isGenerating || isRateLimited}>
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Post
                </>
              )}
            </Button>
          </div>
        </form>
      ) : (
        /* Generated result */
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Your Generated Post</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  disabled={copied}
                >
                  {copied ? (
                    <>
                      <Check className="mr-1 h-3 w-3" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="mr-1 h-3 w-3" />
                      Copy
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleRegenerate}
                  disabled={isGenerating}
                >
                  <RefreshCw className={`mr-1 h-3 w-3 ${isGenerating ? "animate-spin" : ""}`} />
                  Regenerate
                </Button>
              </div>
            </div>
            <div className="whitespace-pre-wrap rounded-lg border bg-muted/30 p-4 text-sm">
              {generatedPost.content}
            </div>
            <p className="text-xs text-muted-foreground text-right">
              {generatedPost.content.length} characters
            </p>
          </div>

          <div className="rounded-lg border border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/30 p-4">
            <h4 className="text-sm font-medium text-green-800 dark:text-green-200 mb-1">
              Congratulations!
            </h4>
            <p className="text-sm text-green-700 dark:text-green-300">
              You&apos;ve created your first post with Brandium. Your profile, project, and platform are all set up.
              Click &quot;Finish&quot; to go to your dashboard and start creating more content!
            </p>
          </div>

          <div className="flex justify-between pt-4">
            <Button type="button" variant="outline" onClick={handleBack}>
              Back
            </Button>
            <Button onClick={handleFinish}>
              Finish & Go to Dashboard
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
