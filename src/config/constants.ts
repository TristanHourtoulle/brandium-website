export const APP_NAME = "Brandium";
export const APP_DESCRIPTION =
  "Personal branding tool that generates personalized social media posts using AI";

export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  DASHBOARD: "/dashboard",
  PROFILES: "/profiles",
  PROJECTS: "/projects",
  PLATFORMS: "/platforms",
  GENERATE: "/generate",
  GENERATE_HOOKS: "/generate/hooks",
  GENERATE_VARIANTS: "/generate/variants",
  TEMPLATES: "/templates",
  POSTS: "/posts",
  IDEAS: "/ideas",
} as const;

export const AUTH_TOKEN_KEY = "brandium_auth_token";
export const ONBOARDING_COMPLETED_KEY = "brandium_onboarding_completed";
