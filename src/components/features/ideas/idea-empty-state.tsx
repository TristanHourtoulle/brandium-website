"use client";

import Link from "next/link";
import { Lightbulb, Sparkles, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/config/constants";

interface IdeaEmptyStateProps {
  hasFilters?: boolean;
  onClearFilters?: () => void;
  onGenerate?: () => void;
}

export function IdeaEmptyState({
  hasFilters = false,
  onClearFilters,
  onGenerate,
}: IdeaEmptyStateProps) {
  if (hasFilters) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-muted-foreground/25 bg-muted/20 py-16 px-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
          <Filter className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="font-semibold text-lg text-foreground mb-2">
          No ideas match your filters
        </h3>
        <p className="text-sm text-muted-foreground mb-6 max-w-sm">
          Try adjusting your filter settings or clear them to see all your
          ideas.
        </p>
        {onClearFilters && (
          <Button variant="outline" onClick={onClearFilters}>
            Clear filters
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-muted-foreground/25 bg-muted/20 py-16 px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
        <Lightbulb className="h-8 w-8 text-primary/50" />
      </div>
      <h3 className="font-semibold text-lg text-foreground mb-2">
        No ideas yet
      </h3>
      <p className="text-sm text-muted-foreground mb-6 max-w-sm">
        Get started by generating AI-powered post ideas tailored to your
        profiles, projects, and platforms.
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        {onGenerate ? (
          <Button onClick={onGenerate} className="gap-2">
            <Sparkles className="h-4 w-4" />
            Generate Ideas
          </Button>
        ) : (
          <Button asChild className="gap-2">
            <Link href={`${ROUTES.IDEAS}/new`}>
              <Sparkles className="h-4 w-4" />
              Generate Ideas
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}
