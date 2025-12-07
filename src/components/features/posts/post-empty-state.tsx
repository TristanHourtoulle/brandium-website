"use client";

import Link from "next/link";
import { FileText, Sparkles, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/config/constants";

interface PostEmptyStateProps {
  hasFilters?: boolean;
  onClearFilters?: () => void;
}

export function PostEmptyState({
  hasFilters = false,
  onClearFilters,
}: PostEmptyStateProps) {
  if (hasFilters) {
    return (
      <div className="flex flex-col items-center justify-center py-12 sm:py-16 px-4 text-center">
        <div className="relative mb-4">
          <div className="absolute inset-0 rounded-full bg-muted/50 blur-xl" />
          <div className="relative mx-auto flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-muted">
            <Search className="h-7 w-7 sm:h-8 sm:w-8 text-muted-foreground/70" aria-hidden="true" />
          </div>
        </div>
        <h3 className="text-lg sm:text-xl font-semibold">No posts found</h3>
        <p className="mt-2 text-sm text-muted-foreground/90 max-w-sm">
          No posts match your current filters. Try adjusting your search or
          clearing the filters.
        </p>
        <Button
          variant="outline"
          className="mt-6 transition-all duration-200 hover:bg-muted"
          onClick={onClearFilters}
        >
          Clear filters
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-12 sm:py-16 px-4 text-center rounded-xl border border-dashed border-muted-foreground/25 bg-muted/10">
      <div className="relative mb-4">
        <div className="absolute inset-0 rounded-full bg-primary/10 blur-xl" />
        <div className="relative mx-auto flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-primary/10">
          <FileText className="h-8 w-8 sm:h-10 sm:w-10 text-primary/60" aria-hidden="true" />
        </div>
      </div>
      <h3 className="text-lg sm:text-xl font-semibold">No posts yet</h3>
      <p className="mt-2 text-sm text-muted-foreground/90 max-w-sm">
        You haven&apos;t generated any posts yet. Start by creating your first
        AI-generated post.
      </p>
      <Button asChild size="lg" className="mt-6 gap-2 shadow-lg shadow-primary/20 transition-all duration-200 hover:shadow-xl hover:shadow-primary/25">
        <Link href={ROUTES.GENERATE}>
          <Sparkles className="h-4 w-4" aria-hidden="true" />
          Generate your first post
        </Link>
      </Button>
    </div>
  );
}
