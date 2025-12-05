"use client";

import { Check, Clock, MessageSquare, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";
import { formatRelativeTime, truncateText } from "@/lib/utils/format";
import type { PostVersion } from "@/types";

interface VersionCardProps {
  version: PostVersion;
  onSelect: () => void;
  isSelecting?: boolean;
  showFullContent?: boolean;
}

export function VersionCard({
  version,
  onSelect,
  isSelecting = false,
  showFullContent = false,
}: VersionCardProps) {
  const isInitialVersion = version.versionNumber === 1;

  return (
    <Card
      className={cn(
        "transition-all duration-200",
        version.isSelected
          ? "border-primary bg-primary/5 ring-1 ring-primary"
          : "hover:border-muted-foreground/30"
      )}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Badge
              variant={version.isSelected ? "default" : "secondary"}
              className="font-mono"
            >
              v{version.versionNumber}
            </Badge>
            {version.isSelected && (
              <Badge variant="outline" className="text-xs">
                <Check className="mr-1 h-3 w-3" />
                Current
              </Badge>
            )}
          </div>
          {!version.isSelected && (
            <Button
              variant="outline"
              size="sm"
              onClick={onSelect}
              disabled={isSelecting}
            >
              {isSelecting ? "Selecting..." : "Use this version"}
            </Button>
          )}
        </div>
        <CardDescription className="flex items-center gap-2 text-xs">
          <Clock className="h-3 w-3" />
          {formatRelativeTime(version.createdAt)}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Content preview */}
        <div className="rounded-md border bg-muted/30 p-3">
          <p className="text-sm whitespace-pre-wrap">
            {showFullContent
              ? version.generatedText
              : truncateText(version.generatedText, 200)}
          </p>
        </div>

        {/* Iteration prompt (if not initial version) */}
        {!isInitialVersion && version.iterationPrompt && (
          <div className="flex items-start gap-2 text-sm">
            <MessageSquare className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
            <div>
              <span className="font-medium text-muted-foreground">
                Refinement:
              </span>{" "}
              <span className="text-muted-foreground italic">
                &quot;{version.iterationPrompt}&quot;
              </span>
            </div>
          </div>
        )}

        {/* Token usage */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Zap className="h-3 w-3" />
          <span>
            {version.usage.totalTokens.toLocaleString()} tokens used
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
