"use client";

import { useState, useCallback } from "react";
import type { Profile, Project, Platform, GeneratedPost } from "@/types";
import type { ProfileFormData, ProjectFormData, PlatformFormData } from "@/lib/utils/validation";

export type OnboardingStep = 1 | 2 | 3 | 4;

export interface OnboardingData {
  profile?: Profile;
  project?: Project;
  platform?: Platform;
  post?: GeneratedPost;
  // Form data for each step (kept separate from created entities)
  profileFormData?: ProfileFormData;
  projectFormData?: ProjectFormData;
  platformFormData?: PlatformFormData;
}

interface UseOnboardingReturn {
  currentStep: OnboardingStep;
  completedSteps: OnboardingStep[];
  data: OnboardingData;
  isLoading: boolean;
  error: string | null;
  // Navigation
  goToStep: (step: OnboardingStep) => void;
  nextStep: () => void;
  prevStep: () => void;
  canGoNext: () => boolean;
  canGoPrev: () => boolean;
  // Data management
  setProfileData: (profile: Profile, formData?: ProfileFormData) => void;
  setProjectData: (project: Project, formData?: ProjectFormData) => void;
  setPlatformData: (platform: Platform, formData?: PlatformFormData) => void;
  setPostData: (post: GeneratedPost) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  // State
  isStepCompleted: (step: OnboardingStep) => boolean;
  getStepStatus: (step: OnboardingStep) => "completed" | "current" | "upcoming";
  reset: () => void;
}

export function useOnboarding(): UseOnboardingReturn {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>(1);
  const [completedSteps, setCompletedSteps] = useState<OnboardingStep[]>([]);
  const [data, setData] = useState<OnboardingData>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isStepCompleted = useCallback(
    (step: OnboardingStep): boolean => {
      return completedSteps.includes(step);
    },
    [completedSteps]
  );

  const getStepStatus = useCallback(
    (step: OnboardingStep): "completed" | "current" | "upcoming" => {
      if (completedSteps.includes(step)) return "completed";
      if (step === currentStep) return "current";
      return "upcoming";
    },
    [completedSteps, currentStep]
  );

  const canGoNext = useCallback((): boolean => {
    // Can go next if current step is completed and not on last step
    return isStepCompleted(currentStep) && currentStep < 4;
  }, [currentStep, isStepCompleted]);

  const canGoPrev = useCallback((): boolean => {
    return currentStep > 1;
  }, [currentStep]);

  const goToStep = useCallback(
    (step: OnboardingStep) => {
      // Can only go to completed steps or the next uncompleted step
      if (step <= currentStep || completedSteps.includes((step - 1) as OnboardingStep)) {
        setCurrentStep(step);
        setError(null);
      }
    },
    [currentStep, completedSteps]
  );

  const nextStep = useCallback(() => {
    if (currentStep < 4) {
      setCurrentStep((prev) => (prev + 1) as OnboardingStep);
      setError(null);
    }
  }, [currentStep]);

  const prevStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as OnboardingStep);
      setError(null);
    }
  }, [currentStep]);

  const markStepCompleted = useCallback((step: OnboardingStep) => {
    setCompletedSteps((prev) => {
      if (prev.includes(step)) return prev;
      return [...prev, step];
    });
  }, []);

  const setProfileData = useCallback(
    (profile: Profile, formData?: ProfileFormData) => {
      setData((prev) => ({ ...prev, profile, profileFormData: formData }));
      markStepCompleted(1);
    },
    [markStepCompleted]
  );

  const setProjectData = useCallback(
    (project: Project, formData?: ProjectFormData) => {
      setData((prev) => ({ ...prev, project, projectFormData: formData }));
      markStepCompleted(2);
    },
    [markStepCompleted]
  );

  const setPlatformData = useCallback(
    (platform: Platform, formData?: PlatformFormData) => {
      setData((prev) => ({ ...prev, platform, platformFormData: formData }));
      markStepCompleted(3);
    },
    [markStepCompleted]
  );

  const setPostData = useCallback(
    (post: GeneratedPost) => {
      setData((prev) => ({ ...prev, post }));
      markStepCompleted(4);
    },
    [markStepCompleted]
  );

  const reset = useCallback(() => {
    setCurrentStep(1);
    setCompletedSteps([]);
    setData({});
    setIsLoading(false);
    setError(null);
  }, []);

  return {
    currentStep,
    completedSteps,
    data,
    isLoading,
    error,
    goToStep,
    nextStep,
    prevStep,
    canGoNext,
    canGoPrev,
    setProfileData,
    setProjectData,
    setPlatformData,
    setPostData,
    setLoading: setIsLoading,
    setError,
    isStepCompleted,
    getStepStatus,
    reset,
  };
}
