"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface PlatformOption {
  id: string;
  name: string;
  icon: string;
  description: string;
  styleGuidelines: string;
  maxLength?: number;
}

const platformOptions: PlatformOption[] = [
  {
    id: "linkedin",
    name: "LinkedIn",
    icon: "💼",
    description: "Professional networking and B2B content",
    styleGuidelines: "Professional tone, use hashtags sparingly (3-5), include a call-to-action, focus on value and insights",
    maxLength: 3000,
  },
  {
    id: "x",
    name: "X (Twitter)",
    icon: "𝕏",
    description: "Short-form content and conversations",
    styleGuidelines: "Concise and punchy, use threads for longer content, leverage hashtags and mentions, be conversational",
    maxLength: 280,
  },
  {
    id: "instagram",
    name: "Instagram",
    icon: "📸",
    description: "Visual storytelling and lifestyle content",
    styleGuidelines: "Engaging captions, use relevant hashtags (10-15), include emojis, add a clear CTA",
    maxLength: 2200,
  },
  {
    id: "tiktok",
    name: "TikTok",
    icon: "🎵",
    description: "Short-form video and trending content",
    styleGuidelines: "Casual and trendy tone, reference trending sounds, include hashtags, be authentic and relatable",
    maxLength: 2200,
  },
  {
    id: "facebook",
    name: "Facebook",
    icon: "👥",
    description: "Community building and diverse content",
    styleGuidelines: "Conversational tone, encourage engagement through questions, use visuals, moderate hashtag use",
    maxLength: 63206,
  },
  {
    id: "threads",
    name: "Threads",
    icon: "🧵",
    description: "Text-based conversations and discussions",
    styleGuidelines: "Conversational and authentic, similar to Twitter but longer-form, focus on discussions",
    maxLength: 500,
  },
];

interface PlatformSelectorProps {
  selectedPlatform: PlatformOption | null;
  onSelect: (platform: PlatformOption) => void;
  disabled?: boolean;
}

export function PlatformSelector({
  selectedPlatform,
  onSelect,
  disabled = false,
}: PlatformSelectorProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {platformOptions.map((platform) => {
        const isSelected = selectedPlatform?.id === platform.id;

        return (
          <button
            key={platform.id}
            type="button"
            onClick={() => onSelect(platform)}
            disabled={disabled}
            className={cn(
              "relative flex flex-col items-start gap-2 rounded-lg border-2 p-4 text-left transition-all",
              "hover:border-primary/50 hover:bg-accent/50",
              "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
              "disabled:cursor-not-allowed disabled:opacity-50",
              isSelected
                ? "border-primary bg-primary/5"
                : "border-border bg-background"
            )}
          >
            {/* Selected indicator */}
            {isSelected && (
              <div className="absolute top-2 right-2">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                  <Check className="h-3 w-3 text-primary-foreground" />
                </div>
              </div>
            )}

            {/* Platform icon and name */}
            <div className="flex items-center gap-2">
              <span className="text-2xl" role="img" aria-hidden="true">
                {platform.icon}
              </span>
              <span className="font-medium">{platform.name}</span>
            </div>

            {/* Description */}
            <p className="text-sm text-muted-foreground pr-6">
              {platform.description}
            </p>

            {/* Character limit badge */}
            {platform.maxLength && (
              <span className="text-xs text-muted-foreground">
                Max {platform.maxLength.toLocaleString()} characters
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export type { PlatformOption };
export { platformOptions };
