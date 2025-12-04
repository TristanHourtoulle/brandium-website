"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useOnboardingContext } from "@/lib/providers/onboarding-provider";
import { OnboardingProgress } from "./onboarding-progress";
import { OnboardingStepProfile } from "./onboarding-step-profile";
import { OnboardingStepProject } from "./onboarding-step-project";
import { OnboardingStepPlatform } from "./onboarding-step-platform";
import { OnboardingStepGenerate } from "./onboarding-step-generate";

const stepTitles = {
  1: "Create Your Profile",
  2: "Define Your Project",
  3: "Choose Your Platform",
  4: "Generate Your First Post",
};

const stepDescriptions = {
  1: "Set up your brand voice and tone to personalize your content.",
  2: "Create a project to organize your content around specific themes or goals.",
  3: "Select the social media platform you want to create content for.",
  4: "Transform your ideas into engaging posts with AI.",
};

export function OnboardingWizard() {
  const {
    isOpen,
    closeOnboarding,
    skipOnboarding,
    currentStep,
    getStepStatus,
    goToStep,
    nextStep,
    isLoading,
  } = useOnboardingContext();

  const handleStepComplete = () => {
    if (currentStep < 4) {
      nextStep();
    }
  };

  const handleFinish = () => {
    closeOnboarding();
  };

  const handleSkip = () => {
    skipOnboarding();
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return <OnboardingStepProfile onComplete={handleStepComplete} />;
      case 2:
        return <OnboardingStepProject onComplete={handleStepComplete} />;
      case 3:
        return <OnboardingStepPlatform onComplete={handleStepComplete} />;
      case 4:
        return <OnboardingStepGenerate onComplete={handleFinish} />;
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleSkip()}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0 gap-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="text-xl">
            {stepTitles[currentStep]}
          </DialogTitle>
          <DialogDescription className="mt-1">
            {stepDescriptions[currentStep]}
          </DialogDescription>
        </DialogHeader>

        {/* Progress indicator */}
        <div className="px-6 py-4 border-b bg-muted/30">
          <OnboardingProgress
            currentStep={currentStep}
            getStepStatus={getStepStatus}
            onStepClick={goToStep}
          />
        </div>

        {/* Content */}
        <ScrollArea className="flex-1 max-h-[calc(90vh-200px)]">
          <div className="px-6 py-6">{renderCurrentStep()}</div>
        </ScrollArea>

        {/* Footer with skip option */}
        <div className="px-6 py-4 border-t bg-muted/30">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkip}
              disabled={isLoading}
              className="text-muted-foreground hover:text-foreground"
            >
              Skip for now
            </Button>
            <p className="text-xs text-muted-foreground">
              You can always access this setup later from settings
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
