"use client";

import { History, Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { VersionCard } from "./version-card";
import type { PostVersion } from "@/types";

interface VersionHistoryProps {
  versions: PostVersion[];
  onSelectVersion: (versionId: string) => void;
  isLoading?: boolean;
  isSelectingVersion?: boolean;
}

export function VersionHistory({
  versions,
  onSelectVersion,
  isLoading = false,
  isSelectingVersion = false,
}: VersionHistoryProps) {
  // Sort versions by version number (newest first)
  const sortedVersions = [...versions].sort(
    (a, b) => b.versionNumber - a.versionNumber
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading version history...
        </div>
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-24 w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (versions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <History className="h-12 w-12 text-muted-foreground/50 mb-4" />
        <p className="text-muted-foreground">No versions yet</p>
        <p className="text-sm text-muted-foreground/70">
          Generate content to see version history
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 font-medium">
          <History className="h-4 w-4" />
          Version History
        </h3>
        <span className="text-sm text-muted-foreground">
          {versions.length} version{versions.length !== 1 ? "s" : ""}
        </span>
      </div>

      <ScrollArea className="h-[400px] pr-4">
        <div className="space-y-3">
          {sortedVersions.map((version) => (
            <VersionCard
              key={version.id}
              version={version}
              onSelect={() => onSelectVersion(version.id)}
              isSelecting={isSelectingVersion}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
