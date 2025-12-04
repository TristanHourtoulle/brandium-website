"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { useOnboarding, type OnboardingStep, type OnboardingData } from "@/lib/hooks/use-onboarding";
import { completeOnboarding as completeOnboardingStorage } from "@/lib/services/onboarding";
import type { Profile, Project, Platform, GeneratedPost } from "@/types";
import type { ProfileFormData, ProjectFormData, PlatformFormData } from "@/lib/utils/validation";

interface OnboardingContextValue {
  // Wizard visibility
  isOpen: boolean;
  openOnboarding: () => void;
  closeOnboarding: () => void;
  // Step management
  currentStep: OnboardingStep;
  completedSteps: OnboardingStep[];
  goToStep: (step: OnboardingStep) => void;
  nextStep: () => void;
  prevStep: () => void;
  canGoNext: () => boolean;
  canGoPrev: () => boolean;
  // Data
  data: OnboardingData;
  setProfileData: (profile: Profile, formData?: ProfileFormData) => void;
  setProjectData: (project: Project, formData?: ProjectFormData) => void;
  setPlatformData: (platform: Platform, formData?: PlatformFormData) => void;
  setPostData: (post: GeneratedPost) => void;
  // State
  isLoading: boolean;
  error: string | null;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  isStepCompleted: (step: OnboardingStep) => boolean;
  getStepStatus: (step: OnboardingStep) => "completed" | "current" | "upcoming";
  // Actions
  completeOnboarding: () => void;
  skipOnboarding: () => void;
  reset: () => void;
}

const OnboardingContext = createContext<OnboardingContextValue | undefined>(undefined);

interface OnboardingProviderProps {
  children: ReactNode;
}

export function OnboardingProvider({ children }: OnboardingProviderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const onboarding = useOnboarding();
  const { reset } = onboarding;

  const openOnboarding = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeOnboarding = useCallback(() => {
    setIsOpen(false);
  }, []);

  const completeOnboardingHandler = useCallback(() => {
    completeOnboardingStorage();
    setIsOpen(false);
    reset();
  }, [reset]);

  const skipOnboarding = useCallback(() => {
    completeOnboardingStorage();
    setIsOpen(false);
    reset();
  }, [reset]);

  return (
    <OnboardingContext.Provider
      value={{
        isOpen,
        openOnboarding,
        closeOnboarding,
        currentStep: onboarding.currentStep,
        completedSteps: onboarding.completedSteps,
        goToStep: onboarding.goToStep,
        nextStep: onboarding.nextStep,
        prevStep: onboarding.prevStep,
        canGoNext: onboarding.canGoNext,
        canGoPrev: onboarding.canGoPrev,
        data: onboarding.data,
        setProfileData: onboarding.setProfileData,
        setProjectData: onboarding.setProjectData,
        setPlatformData: onboarding.setPlatformData,
        setPostData: onboarding.setPostData,
        isLoading: onboarding.isLoading,
        error: onboarding.error,
        setLoading: onboarding.setLoading,
        setError: onboarding.setError,
        isStepCompleted: onboarding.isStepCompleted,
        getStepStatus: onboarding.getStepStatus,
        completeOnboarding: completeOnboardingHandler,
        skipOnboarding,
        reset: onboarding.reset,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboardingContext() {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error("useOnboardingContext must be used within an OnboardingProvider");
  }
  return context;
}
