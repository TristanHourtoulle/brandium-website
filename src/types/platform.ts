export interface Platform {
  id: string;
  userId: string;
  name: string;
  styleGuidelines: string;
  maxLength?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePlatformDto {
  name: string;
  styleGuidelines: string;
  maxLength?: number;
}

export interface UpdatePlatformDto {
  name?: string;
  styleGuidelines?: string;
  maxLength?: number;
}

export const PLATFORM_SUGGESTIONS = [
  "LinkedIn",
  "X (Twitter)",
  "Instagram",
  "TikTok",
  "Facebook",
  "YouTube",
  "Threads",
  "Bluesky",
] as const;

export type PlatformSuggestion = (typeof PLATFORM_SUGGESTIONS)[number];
