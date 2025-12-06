"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, Trash2, CheckSquare, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { IdeaList, IdeaFiltersComponent } from "@/components/features/ideas";
import { usePostIdeas } from "@/lib/hooks/use-post-ideas";
import { useProfiles } from "@/lib/hooks/use-profiles";
import { useProjects } from "@/lib/hooks/use-projects";
import { usePlatforms } from "@/lib/hooks/use-platforms";
import { ROUTES } from "@/config/constants";

export default function IdeasPage() {
  const router = useRouter();
  const {
    ideas,
    isLoading,
    pagination,
    filters,
    selectedIds,
    deleteIdea,
    deleteBulkIdeas,
    setFilters,
    nextPage,
    prevPage,
    goToPage,
    resetFilters,
    toggleSelection,
    selectAll,
    clearSelection,
  } = usePostIdeas();

  const { profiles } = useProfiles();
  const { projects } = useProjects();
  const { platforms } = usePlatforms();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [ideaToDelete, setIdeaToDelete] = useState<string | null>(null);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [showCheckboxes, setShowCheckboxes] = useState(false);

  const handleDeleteClick = useCallback((id: string) => {
    setIdeaToDelete(id);
    setDeleteDialogOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (ideaToDelete) {
      await deleteIdea(ideaToDelete);
      setIdeaToDelete(null);
      setDeleteDialogOpen(false);
    }
  }, [ideaToDelete, deleteIdea]);

  const handleCancelDelete = useCallback(() => {
    setIdeaToDelete(null);
    setDeleteDialogOpen(false);
  }, []);

  const handleBulkDeleteClick = useCallback(() => {
    if (selectedIds.length > 0) {
      setBulkDeleteDialogOpen(true);
    }
  }, [selectedIds.length]);

  const handleConfirmBulkDelete = useCallback(async () => {
    await deleteBulkIdeas(selectedIds);
    setBulkDeleteDialogOpen(false);
    setShowCheckboxes(false);
  }, [selectedIds, deleteBulkIdeas]);

  const handleCancelBulkDelete = useCallback(() => {
    setBulkDeleteDialogOpen(false);
  }, []);

  const handleUseIdea = useCallback(
    (id: string) => {
      // Navigate to generate page with idea context
      router.push(`${ROUTES.GENERATE}?ideaId=${id}`);
    },
    [router]
  );

  const toggleSelectionMode = useCallback(() => {
    if (showCheckboxes) {
      clearSelection();
    }
    setShowCheckboxes(!showCheckboxes);
  }, [showCheckboxes, clearSelection]);

  // Generate pagination items
  const paginationItems = () => {
    const items = [];
    const { currentPage, totalPages } = pagination;

    items.push(1);

    if (currentPage > 3) {
      items.push("ellipsis-start");
    }

    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    ) {
      if (!items.includes(i)) {
        items.push(i);
      }
    }

    if (currentPage < totalPages - 2) {
      items.push("ellipsis-end");
    }

    if (totalPages > 1 && !items.includes(totalPages)) {
      items.push(totalPages);
    }

    return items;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Post Ideas"
        description="Generate and manage AI-powered post ideas for your content."
      >
        <div className="flex gap-2">
          {ideas.length > 0 && (
            <Button variant="outline" onClick={toggleSelectionMode}>
              {showCheckboxes ? (
                <>
                  <Square className="mr-2 h-4 w-4" />
                  Cancel
                </>
              ) : (
                <>
                  <CheckSquare className="mr-2 h-4 w-4" />
                  Select
                </>
              )}
            </Button>
          )}
          <Button asChild>
            <Link href={`${ROUTES.IDEAS}/new`}>
              <Sparkles className="mr-2 h-4 w-4" aria-hidden="true" />
              Generate Ideas
            </Link>
          </Button>
        </div>
      </PageHeader>

      {/* Bulk Actions */}
      {showCheckboxes && (
        <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
          <span className="text-sm text-muted-foreground">
            {selectedIds.length} selected
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={selectAll}>
              Select All
            </Button>
            <Button variant="outline" size="sm" onClick={clearSelection}>
              Clear
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleBulkDeleteClick}
              disabled={selectedIds.length === 0}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Selected
            </Button>
          </div>
        </div>
      )}

      <IdeaFiltersComponent
        filters={filters}
        onFiltersChange={setFilters}
        onClearFilters={resetFilters}
        profiles={profiles}
        projects={projects}
        platforms={platforms}
      />

      <IdeaList
        ideas={ideas}
        isLoading={isLoading}
        onDelete={handleDeleteClick}
        onUse={handleUseIdea}
        filters={filters}
        onClearFilters={resetFilters}
        selectedIds={selectedIds}
        onToggleSelect={toggleSelection}
        showCheckboxes={showCheckboxes}
      />

      {/* Pagination */}
      {pagination.totalPages > 1 && !isLoading && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  prevPage();
                }}
                aria-disabled={pagination.currentPage === 1}
                className={
                  pagination.currentPage === 1
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer"
                }
              />
            </PaginationItem>

            {paginationItems().map((item, index) => {
              if (item === "ellipsis-start" || item === "ellipsis-end") {
                return (
                  <PaginationItem key={`ellipsis-${index}`}>
                    <PaginationEllipsis />
                  </PaginationItem>
                );
              }

              const page = item as number;
              return (
                <PaginationItem key={page}>
                  <PaginationLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      goToPage(page);
                    }}
                    isActive={page === pagination.currentPage}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              );
            })}

            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  nextPage();
                }}
                aria-disabled={pagination.currentPage === pagination.totalPages}
                className={
                  pagination.currentPage === pagination.totalPages
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer"
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      {/* Results count */}
      {!isLoading && pagination.totalItems > 0 && (
        <p className="text-center text-sm text-muted-foreground">
          Showing {ideas.length} of {pagination.totalItems} ideas
        </p>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Idea</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this idea? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelDelete}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog
        open={bulkDeleteDialogOpen}
        onOpenChange={setBulkDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedIds.length} Ideas</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedIds.length} selected
              ideas? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelBulkDelete}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmBulkDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete {selectedIds.length} Ideas
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
