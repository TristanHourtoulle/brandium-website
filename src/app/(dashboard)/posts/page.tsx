"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Sparkles } from "lucide-react";
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
import { PostList, PostFiltersComponent } from "@/components/features/posts";
import { usePosts } from "@/lib/hooks/use-posts";
import { usePostsPageData } from "@/lib/hooks/use-posts-page-data";
import { ROUTES } from "@/config/constants";
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
import { useState, useCallback } from "react";

export default function PostsPage() {
  const {
    posts,
    isLoading,
    pagination,
    filters,
    deletePost,
    setFilters,
    nextPage,
    prevPage,
    goToPage,
    resetFilters,
  } = usePosts();

  // Consolidated hook for filter options - fetched once in parallel
  const { filterOptions } = usePostsPageData();
  const { profiles, projects, platforms } = filterOptions;

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);

  const handleDeleteClick = useCallback((id: string) => {
    setPostToDelete(id);
    setDeleteDialogOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (postToDelete) {
      await deletePost(postToDelete);
      setPostToDelete(null);
      setDeleteDialogOpen(false);
    }
  }, [postToDelete, deletePost]);

  const handleCancelDelete = useCallback(() => {
    setPostToDelete(null);
    setDeleteDialogOpen(false);
  }, []);

  // Memoized pagination items to avoid recalculation on every render
  const paginationItems = useMemo(() => {
    const items: (number | string)[] = [];
    const { currentPage, totalPages } = pagination;

    // Always show first page
    items.push(1);

    // Show ellipsis if needed
    if (currentPage > 3) {
      items.push("ellipsis-start");
    }

    // Show pages around current
    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    ) {
      if (!items.includes(i)) {
        items.push(i);
      }
    }

    // Show ellipsis if needed
    if (currentPage < totalPages - 2) {
      items.push("ellipsis-end");
    }

    // Always show last page if more than 1 page
    if (totalPages > 1 && !items.includes(totalPages)) {
      items.push(totalPages);
    }

    return items;
  }, [pagination]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Posts"
        description="View and manage your generated posts."
      >
        <Button asChild>
          <Link href={ROUTES.GENERATE}>
            <Sparkles className="mr-2 h-4 w-4" aria-hidden="true" />
            Generate New
          </Link>
        </Button>
      </PageHeader>

      <PostFiltersComponent
        filters={filters}
        onFiltersChange={setFilters}
        onClearFilters={resetFilters}
        profiles={profiles}
        projects={projects}
        platforms={platforms}
      />

      <PostList
        posts={posts}
        isLoading={isLoading}
        onDelete={handleDeleteClick}
        filters={filters}
        onClearFilters={resetFilters}
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

            {paginationItems.map((item, index) => {
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
          Showing {posts.length} of {pagination.totalItems} posts
        </p>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Post</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this post? This action cannot be
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
    </div>
  );
}
