"use client";

import { Check, User, Briefcase, Share2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { OnboardingStep } from "@/lib/hooks/use-onboarding";

interface OnboardingProgressProps {
  currentStep: OnboardingStep;
  getStepStatus: (step: OnboardingStep) => "completed" | "current" | "upcoming";
  onStepClick?: (step: OnboardingStep) => void;
}

const steps = [
  {
    step: 1 as OnboardingStep,
    label: "Profile",
    description: "Create your brand voice",
    icon: User,
  },
  {
    step: 2 as OnboardingStep,
    label: "Project",
    description: "Define your content focus",
    icon: Briefcase,
  },
  {
    step: 3 as OnboardingStep,
    label: "Platform",
    description: "Choose your channel",
    icon: Share2,
  },
  {
    step: 4 as OnboardingStep,
    label: "Generate",
    description: "Create your first post",
    icon: Sparkles,
  },
];

export function OnboardingProgress({
  currentStep,
  getStepStatus,
  onStepClick,
}: OnboardingProgressProps) {
  return (
    <div className="w-full">
      {/* Desktop view */}
      <div className="hidden sm:block">
        <nav aria-label="Progress">
          <ol className="flex items-center justify-between">
            {steps.map((step, index) => {
              const status = getStepStatus(step.step);
              const Icon = step.icon;
              const isClickable = status === "completed" || step.step <= currentStep;

              return (
                <li key={step.step} className="relative flex-1">
                  {/* Connector line */}
                  {index < steps.length - 1 && (
                    <div
                      className="absolute top-5 left-[calc(50%+20px)] w-[calc(100%-40px)] h-0.5"
                      aria-hidden="true"
                    >
                      <div
                        className={cn(
                          "h-full transition-colors duration-300",
                          status === "completed"
                            ? "bg-primary"
                            : "bg-muted"
                        )}
                      />
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => isClickable && onStepClick?.(step.step)}
                    disabled={!isClickable}
                    className={cn(
                      "group flex flex-col items-center",
                      isClickable && "cursor-pointer",
                      !isClickable && "cursor-default"
                    )}
                  >
                    {/* Circle with icon */}
                    <span
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300",
                        status === "completed" &&
                          "border-primary bg-primary text-primary-foreground",
                        status === "current" &&
                          "border-primary bg-background text-primary",
                        status === "upcoming" &&
                          "border-muted bg-background text-muted-foreground"
                      )}
                    >
                      {status === "completed" ? (
                        <Check className="h-5 w-5" />
                      ) : (
                        <Icon className="h-5 w-5" />
                      )}
                    </span>

                    {/* Label */}
                    <span
                      className={cn(
                        "mt-2 text-sm font-medium transition-colors",
                        status === "completed" && "text-primary",
                        status === "current" && "text-foreground",
                        status === "upcoming" && "text-muted-foreground"
                      )}
                    >
                      {step.label}
                    </span>

                    {/* Description */}
                    <span className="text-xs text-muted-foreground mt-0.5 hidden md:block">
                      {step.description}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </nav>
      </div>

      {/* Mobile view - compact */}
      <div className="sm:hidden">
        <div className="flex items-center justify-between px-2">
          {steps.map((step) => {
            const status = getStepStatus(step.step);
            const Icon = step.icon;

            return (
              <div
                key={step.step}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full transition-all",
                  status === "completed" &&
                    "bg-primary text-primary-foreground",
                  status === "current" &&
                    "bg-primary/10 text-primary ring-2 ring-primary",
                  status === "upcoming" &&
                    "bg-muted text-muted-foreground"
                )}
              >
                {status === "completed" ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Icon className="h-4 w-4" />
                )}
              </div>
            );
          })}
        </div>
        <div className="mt-2 text-center">
          <p className="text-sm font-medium">
            Step {currentStep} of 4: {steps[currentStep - 1].label}
          </p>
          <p className="text-xs text-muted-foreground">
            {steps[currentStep - 1].description}
          </p>
        </div>
      </div>
    </div>
  );
}
