"use client";

import { FileText, Plus, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HistoricalPostEmptyStateProps {
  onAddPost: () => void;
  onBulkImport: () => void;
}

export function HistoricalPostEmptyState({
  onAddPost,
  onBulkImport,
}: HistoricalPostEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        <FileText className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
      </div>
      <h3 className="mt-4 text-lg font-semibold">No historical posts yet</h3>
      <p className="mt-2 text-sm text-muted-foreground max-w-sm">
        Import your past social media posts to help the AI learn your unique
        writing style. You need at least 5 posts to analyze your style.
      </p>
      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <Button onClick={onAddPost}>
          <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
          Add a post
        </Button>
        <Button variant="outline" onClick={onBulkImport}>
          <Upload className="mr-2 h-4 w-4" aria-hidden="true" />
          Bulk import
        </Button>
      </div>
    </div>
  );
}
