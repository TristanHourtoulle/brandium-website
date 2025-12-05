"use client";

import { useState, useEffect } from "react";
import {
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  History,
  RefreshCw,
  Save,
  Wand2,
  X,
} from "lucide-react";
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
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  formatCharacterCount,
  getCharacterCountStatus,
  copyToClipboard,
  formatRelativeTime,
} from "@/lib/utils/format";
import { usePostIterations } from "@/lib/hooks/use-post-iterations";
import {
  IterationDialog,
  VersionHistory,
} from "@/components/features/iterations";
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
  onContentUpdate?: (content: string) => void;
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
  onContentUpdate,
}: GenerationResultProps) {
  const [copied, setCopied] = useState(false);
  const [isIterationDialogOpen, setIsIterationDialogOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const {
    versions,
    currentVersion,
    totalVersions,
    isIterating,
    isFetchingVersions,
    isSelectingVersion,
    iterate,
    fetchVersions,
    selectVersion,
  } = usePostIterations();

  // Fetch versions when post changes
  useEffect(() => {
    if (post.id) {
      fetchVersions(post.id);
    }
  }, [post.id, fetchVersions]);

  // Get the display content - prefer current version if available
  const displayContent = currentVersion?.generatedText || post.content;
  const displayVersionNumber = currentVersion?.versionNumber || post.versionNumber || 1;

  const characterCount = displayContent.length;
  const maxLength = platform?.maxLength;
  const countStatus = getCharacterCountStatus(characterCount, maxLength);

  const handleCopy = async () => {
    const success = await copyToClipboard(displayContent);
    if (success) {
      setCopied(true);
      toast.success("Copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } else {
      toast.error("Failed to copy to clipboard");
    }
  };

  const handleIterate = async (prompt: string) => {
    const result = await iterate(post.id, { iterationPrompt: prompt });
    if (result) {
      setIsIterationDialogOpen(false);
      // Notify parent of content update if callback provided
      if (onContentUpdate) {
        onContentUpdate(result.generatedText);
      }
    }
  };

  const handleSelectVersion = async (versionId: string) => {
    await selectVersion(post.id, versionId);
    // Find the selected version to get its content
    const selectedVersion = versions.find((v) => v.id === versionId);
    if (selectedVersion && onContentUpdate) {
      onContentUpdate(selectedVersion.generatedText);
    }
  };

  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg">Generated Content</CardTitle>
                {totalVersions > 0 && (
                  <Badge variant="outline" className="font-mono text-xs">
                    v{displayVersionNumber}
                    {totalVersions > 1 && ` of ${totalVersions}`}
                  </Badge>
                )}
              </div>
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
              <Badge variant="secondary">Profile: {profile.name}</Badge>
            )}
            {project && (
              <Badge variant="secondary">Project: {project.name}</Badge>
            )}
            {platform && (
              <Badge variant="secondary">Platform: {platform.name}</Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Generated content */}
          <div className="relative">
            <div className="whitespace-pre-wrap rounded-md border bg-muted/30 p-4 text-sm">
              {displayContent}
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
            <div>
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
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                Goal:
              </p>
              <p className="text-sm text-muted-foreground">{post.goal}</p>
            </div>
          )}

          {/* Version History (collapsible) */}
          {totalVersions > 1 && (
            <Collapsible open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-between"
                  size="sm"
                >
                  <span className="flex items-center gap-2">
                    <History className="h-4 w-4" />
                    View all versions ({totalVersions})
                  </span>
                  {isHistoryOpen ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-4">
                <VersionHistory
                  versions={versions}
                  onSelectVersion={handleSelectVersion}
                  isLoading={isFetchingVersions}
                  isSelectingVersion={isSelectingVersion}
                />
              </CollapsibleContent>
            </Collapsible>
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
            onClick={() => setIsIterationDialogOpen(true)}
            disabled={isIterating || isRegenerating}
          >
            <Wand2 className="mr-2 h-4 w-4" />
            Refine
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onRegenerate}
            disabled={isRegenerating || isIterating}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${isRegenerating ? "animate-spin" : ""}`}
            />
            Regenerate
          </Button>

          {onSave && (
            <Button size="sm" onClick={onSave} disabled={isSaving}>
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? "Saving..." : "Save"}
            </Button>
          )}
        </CardFooter>
      </Card>

      {/* Iteration Dialog */}
      <IterationDialog
        open={isIterationDialogOpen}
        onOpenChange={setIsIterationDialogOpen}
        onSubmit={handleIterate}
        isLoading={isIterating}
        currentVersionNumber={displayVersionNumber}
      />
    </>
  );
}
