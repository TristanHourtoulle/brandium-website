"use client";

import { IdeaCard, IdeaCardSkeleton } from "./idea-card";
import { IdeaEmptyState } from "./idea-empty-state";
import type { PostIdea, IdeaFilters } from "@/types";

interface IdeaListProps {
  ideas: PostIdea[];
  isLoading: boolean;
  onDelete: (id: string) => void;
  onUse: (id: string) => void;
  filters?: IdeaFilters;
  onClearFilters?: () => void;
  onGenerate?: () => void;
  selectedIds?: string[];
  onToggleSelect?: (id: string) => void;
  showCheckboxes?: boolean;
}

export function IdeaList({
  ideas,
  isLoading,
  onDelete,
  onUse,
  filters,
  onClearFilters,
  onGenerate,
  selectedIds = [],
  onToggleSelect,
  showCheckboxes = false,
}: IdeaListProps) {
  const hasFilters = Boolean(
    filters?.profileId ||
      filters?.projectId ||
      filters?.platformId ||
      filters?.isUsed !== undefined
  );

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <IdeaCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (ideas.length === 0) {
    return (
      <IdeaEmptyState
        hasFilters={hasFilters}
        onClearFilters={onClearFilters}
        onGenerate={onGenerate}
      />
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {ideas.map((idea) => (
        <IdeaCard
          key={idea.id}
          idea={idea}
          onDelete={onDelete}
          onUse={onUse}
          isSelected={selectedIds.includes(idea.id)}
          onToggleSelect={onToggleSelect}
          showCheckbox={showCheckboxes}
        />
      ))}
    </div>
  );
}
