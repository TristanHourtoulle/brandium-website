"use client";

import { useState } from "react";
import { Check, Copy, RefreshCw, Save, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  formatCharacterCount,
  getCharacterCountStatus,
  copyToClipboard,
  formatRelativeTime,
} from "@/lib/utils/format";
import type { GeneratedPost, Profile, Project, Platform } from "@/types";

interface GenerationResultProps {
  post: GeneratedPost;
  profile?: Profile | null;
  project?: Project | null;
  platform?: Platform | null;
  onRegenerate: () => void;
  onSave?: () => void;
  onDismiss: () => void;
  isRegenerating?: boolean;
  isSaving?: boolean;
}

export function GenerationResult({
  post,
  profile,
  project,
  platform,
  onRegenerate,
  onSave,
  onDismiss,
  isRegenerating = false,
  isSaving = false,
}: GenerationResultProps) {
  const [copied, setCopied] = useState(false);

  const characterCount = post.content.length;
  const maxLength = platform?.maxLength;
  const countStatus = getCharacterCountStatus(characterCount, maxLength);

  const handleCopy = async () => {
    const success = await copyToClipboard(post.content);
    if (success) {
      setCopied(true);
      toast.success("Copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } else {
      toast.error("Failed to copy to clipboard");
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">Generated Content</CardTitle>
            <CardDescription>
              Created {formatRelativeTime(post.createdAt)}
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onDismiss}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Dismiss</span>
          </Button>
        </div>

        {/* Metadata badges */}
        <div className="flex flex-wrap gap-2 pt-2">
          {profile && (
            <Badge variant="secondary">
              Profile: {profile.name}
            </Badge>
          )}
          {project && (
            <Badge variant="secondary">
              Project: {project.name}
            </Badge>
          )}
          {platform && (
            <Badge variant="secondary">
              Platform: {platform.name}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {/* Generated content */}
        <div className="relative">
          <div className="whitespace-pre-wrap rounded-md border bg-muted/30 p-4 text-sm">
            {post.content}
          </div>

          {/* Character count */}
          <div className="mt-2 flex justify-end">
            <span
              className={`text-sm ${
                countStatus === "error"
                  ? "text-destructive font-medium"
                  : countStatus === "warning"
                  ? "text-yellow-600 dark:text-yellow-500"
                  : "text-muted-foreground"
              }`}
            >
              {formatCharacterCount(characterCount, maxLength)}
              {countStatus === "error" && " (over limit)"}
            </span>
          </div>
        </div>

        {/* Original idea (collapsed) */}
        {post.rawIdea && (
          <div className="mt-4">
            <p className="text-sm font-medium text-muted-foreground mb-1">
              Original Idea:
            </p>
            <p className="text-sm text-muted-foreground italic">
              &quot;{post.rawIdea}&quot;
            </p>
          </div>
        )}

        {/* Goal if provided */}
        {post.goal && (
          <div className="mt-2">
            <p className="text-sm font-medium text-muted-foreground mb-1">
              Goal:
            </p>
            <p className="text-sm text-muted-foreground">{post.goal}</p>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopy}
          disabled={copied}
        >
          {copied ? (
            <>
              <Check className="mr-2 h-4 w-4" />
              Copied
            </>
          ) : (
            <>
              <Copy className="mr-2 h-4 w-4" />
              Copy
            </>
          )}
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onRegenerate}
          disabled={isRegenerating}
        >
          <RefreshCw
            className={`mr-2 h-4 w-4 ${isRegenerating ? "animate-spin" : ""}`}
          />
          Regenerate
        </Button>

        {onSave && (
          <Button
            size="sm"
            onClick={onSave}
            disabled={isSaving}
          >
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? "Saving..." : "Save"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
