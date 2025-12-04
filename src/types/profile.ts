export interface Profile {
  id: string;
  userId: string;
  name: string;
  bio: string;
  tone: string[];
  doRules: string[];
  dontRules: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateProfileDto {
  name: string;
  bio: string;
  tone: string[];
  doRules: string[];
  dontRules: string[];
}

export interface UpdateProfileDto {
  name?: string;
  bio?: string;
  tone?: string[];
  doRules?: string[];
  dontRules?: string[];
}

export const TONE_SUGGESTIONS = [
  "professional",
  "friendly",
  "casual",
  "authoritative",
  "humorous",
  "inspirational",
  "educational",
  "conversational",
] as const;

export type ToneSuggestion = (typeof TONE_SUGGESTIONS)[number];
