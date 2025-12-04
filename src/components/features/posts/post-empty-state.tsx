"use client";

import Link from "next/link";
import { FileText, Sparkles } from "lucide-react";
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
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <FileText className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
        </div>
        <h3 className="mt-4 text-lg font-semibold">No posts found</h3>
        <p className="mt-2 text-sm text-muted-foreground max-w-sm">
          No posts match your current filters. Try adjusting your search or
          clearing the filters.
        </p>
        <Button variant="outline" className="mt-4" onClick={onClearFilters}>
          Clear filters
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        <FileText className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
      </div>
      <h3 className="mt-4 text-lg font-semibold">No posts yet</h3>
      <p className="mt-2 text-sm text-muted-foreground max-w-sm">
        You haven&apos;t generated any posts yet. Start by creating your first
        AI-generated post.
      </p>
      <Button asChild className="mt-4">
        <Link href={ROUTES.GENERATE}>
          <Sparkles className="mr-2 h-4 w-4" aria-hidden="true" />
          Generate your first post
        </Link>
      </Button>
    </div>
  );
}
