"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { usePlatforms } from "@/lib/hooks/use-platforms";
import { useOnboardingContext } from "@/lib/providers/onboarding-provider";
import { PlatformSelector, type PlatformOption } from "./platform-selector";

interface OnboardingStepPlatformProps {
  onComplete: () => void;
}

export function OnboardingStepPlatform({ onComplete }: OnboardingStepPlatformProps) {
  const { createPlatform } = usePlatforms();
  const { setPlatformData, setLoading, prevStep } = useOnboardingContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformOption | null>(null);

  const onSubmit = async () => {
    if (!selectedPlatform) {
      toast.error("Please select a platform");
      return;
    }

    setIsSubmitting(true);
    setLoading(true);

    try {
      const platform = await createPlatform({
        name: selectedPlatform.name,
        styleGuidelines: selectedPlatform.styleGuidelines,
        maxLength: selectedPlatform.maxLength,
      });

      if (platform) {
        setPlatformData(platform, {
          name: selectedPlatform.name,
          styleGuidelines: selectedPlatform.styleGuidelines,
          maxLength: selectedPlatform.maxLength,
        });
        onComplete();
      }
    } catch {
      toast.error("Failed to add platform. Please try again.");
    } finally {
      setIsSubmitting(false);
      setLoading(false);
    }
  };

  const handleBack = () => {
    prevStep();
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Choose Your Primary Platform</h3>
          <p className="text-xs text-muted-foreground">
            Select the platform you want to create content for. You can add more platforms later.
          </p>
        </div>

        <PlatformSelector
          selectedPlatform={selectedPlatform}
          onSelect={setSelectedPlatform}
          disabled={isSubmitting}
        />

        {selectedPlatform && (
          <div className="mt-4 rounded-lg border bg-muted/30 p-4">
            <h4 className="text-sm font-medium mb-2">Platform Settings</h4>
            <p className="text-sm text-muted-foreground">
              <strong>Style:</strong> {selectedPlatform.styleGuidelines}
            </p>
            {selectedPlatform.maxLength && (
              <p className="text-sm text-muted-foreground mt-1">
                <strong>Character limit:</strong> {selectedPlatform.maxLength.toLocaleString()}
              </p>
            )}
          </div>
        )}
      </div>

      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={handleBack} disabled={isSubmitting}>
          Back
        </Button>
        <Button onClick={onSubmit} disabled={isSubmitting || !selectedPlatform}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Add Platform & Continue
        </Button>
      </div>
    </div>
  );
}
