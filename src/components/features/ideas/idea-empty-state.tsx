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
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-muted-foreground/25 bg-muted/10 py-12 sm:py-16 px-4 sm:px-6 text-center">
        <div className="relative mb-4">
          <div className="absolute inset-0 rounded-full bg-muted/50 blur-xl" />
          <div className="relative flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-muted">
            <Filter className="h-7 w-7 sm:h-8 sm:w-8 text-muted-foreground/70" />
          </div>
        </div>
        <h3 className="font-semibold text-lg sm:text-xl text-foreground mb-2">
          No ideas match your filters
        </h3>
        <p className="text-sm text-muted-foreground/90 mb-6 max-w-sm">
          Try adjusting your filter settings or clear them to see all your
          ideas.
        </p>
        {onClearFilters && (
          <Button
            variant="outline"
            onClick={onClearFilters}
            className="transition-all duration-200 hover:bg-muted"
          >
            Clear filters
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-muted-foreground/25 bg-muted/10 py-12 sm:py-16 px-4 sm:px-6 text-center">
      <div className="relative mb-4">
        <div className="absolute inset-0 rounded-full bg-primary/10 blur-xl" />
        <div className="relative flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-primary/10">
          <Lightbulb className="h-8 w-8 sm:h-10 sm:w-10 text-primary/60" />
        </div>
      </div>
      <h3 className="font-semibold text-lg sm:text-xl text-foreground mb-2">
        No ideas yet
      </h3>
      <p className="text-sm text-muted-foreground/90 mb-6 max-w-sm">
        Get started by generating AI-powered post ideas tailored to your
        profiles, projects, and platforms.
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        {onGenerate ? (
          <Button
            onClick={onGenerate}
            size="lg"
            className="gap-2 shadow-lg shadow-primary/20 transition-all duration-200 hover:shadow-xl hover:shadow-primary/25"
          >
            <Sparkles className="h-4 w-4" />
            Generate Ideas
          </Button>
        ) : (
          <Button
            asChild
            size="lg"
            className="gap-2 shadow-lg shadow-primary/20 transition-all duration-200 hover:shadow-xl hover:shadow-primary/25"
          >
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
