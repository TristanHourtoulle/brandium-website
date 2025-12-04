import { ONBOARDING_COMPLETED_KEY } from "@/config/constants";

/**
 * Checks if the user should see the onboarding wizard
 * Returns true if:
 * - User hasn't completed onboarding (localStorage flag not set)
 * - AND user has no profiles OR no projects OR no posts
 */
export function shouldShowOnboarding(
  profilesCount: number,
  projectsCount: number,
  postsCount: number
): boolean {
  // Check if running in browser
  if (typeof window === "undefined") {
    return false;
  }

  // Check if user has already completed onboarding
  const hasCompletedOnboarding =
    localStorage.getItem(ONBOARDING_COMPLETED_KEY) === "true";

  if (hasCompletedOnboarding) {
    return false;
  }

  // Show onboarding if user has no content yet
  const hasNoContent =
    profilesCount === 0 || projectsCount === 0 || postsCount === 0;

  return hasNoContent;
}

/**
 * Mark onboarding as completed
 */
export function completeOnboarding(): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(ONBOARDING_COMPLETED_KEY, "true");
  }
}

/**
 * Reset onboarding status (for testing or if user wants to see it again)
 */
export function resetOnboarding(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(ONBOARDING_COMPLETED_KEY);
  }
}

/**
 * Check if onboarding was completed
 */
export function hasCompletedOnboarding(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  return localStorage.getItem(ONBOARDING_COMPLETED_KEY) === "true";
}
