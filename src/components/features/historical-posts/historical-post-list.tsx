"use client";

import { useState } from "react";
import { Plus, Upload, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  HistoricalPostCard,
  HistoricalPostCardSkeleton,
} from "./historical-post-card";
import { HistoricalPostStats } from "./historical-post-stats";
import { HistoricalPostEmptyState } from "./historical-post-empty-state";
import { HistoricalPostForm } from "./historical-post-form";
import { BulkImportDialog } from "./bulk-import-dialog";
import { useHistoricalPosts } from "@/lib/hooks/use-historical-posts";
import { usePlatforms } from "@/lib/hooks/use-platforms";
import type {
  HistoricalPost,
  CreateHistoricalPostDto,
  UpdateHistoricalPostDto,
} from "@/types";
import type { HistoricalPostFormData } from "@/lib/utils/validation";

interface HistoricalPostListProps {
  profileId: string;
  onAnalyzeClick: () => void;
  canAnalyze: boolean;
  isAnalyzing: boolean;
}

export function HistoricalPostList({
  profileId,
  onAnalyzeClick,
  canAnalyze,
  isAnalyzing,
}: HistoricalPostListProps) {
  const {
    posts,
    pagination,
    stats,
    isLoading,
    isLoadingStats,
    createPost,
    updatePost,
    deletePost,
    bulkImport,
    goToPage,
  } = useHistoricalPosts(profileId);

  const { platforms } = usePlatforms();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<HistoricalPost | null>(null);
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isBulkImporting, setIsBulkImporting] = useState(false);

  const handleAddPost = () => {
    setEditingPost(null);
    setIsFormOpen(true);
  };

  const handleEditPost = (post: HistoricalPost) => {
    setEditingPost(post);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (data: HistoricalPostFormData) => {
    setIsSubmitting(true);

    const postData: CreateHistoricalPostDto | UpdateHistoricalPostDto = {
      content: data.content,
      platformId: data.platformId || undefined,
      publishedAt: data.publishedAt || undefined,
      externalUrl: data.externalUrl || undefined,
      engagement: data.engagement || undefined,
    };

    if (editingPost) {
      await updatePost(editingPost.id, postData);
    } else {
      await createPost(postData as CreateHistoricalPostDto);
    }

    setIsSubmitting(false);
    setIsFormOpen(false);
    setEditingPost(null);
  };

  const handleDeleteClick = (postId: string) => {
    setDeletingPostId(postId);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingPostId) return;

    setIsDeleting(true);
    await deletePost(deletingPostId);
    setIsDeleting(false);
    setDeletingPostId(null);
  };

  const handleBulkImport = async (data: { posts: CreateHistoricalPostDto[] }) => {
    setIsBulkImporting(true);
    const result = await bulkImport(data);
    setIsBulkImporting(false);
    return result;
  };

  // Generate pagination items
  const getPaginationItems = () => {
    if (!pagination) return [];

    const items: (number | "ellipsis")[] = [];
    const { page, totalPages } = pagination;

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        items.push(i);
      }
    } else {
      items.push(1);

      if (page > 3) {
        items.push("ellipsis");
      }

      for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
        if (!items.includes(i)) {
          items.push(i);
        }
      }

      if (page < totalPages - 2) {
        items.push("ellipsis");
      }

      if (!items.includes(totalPages)) {
        items.push(totalPages);
      }
    }

    return items;
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <HistoricalPostStats stats={stats} isLoading={isLoadingStats} />

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={handleAddPost}>
          <Plus className="mr-2 h-4 w-4" />
          Add Post
        </Button>
        <Button variant="outline" onClick={() => setIsBulkImportOpen(true)}>
          <Upload className="mr-2 h-4 w-4" />
          Bulk Import
        </Button>
        <Button
          variant={canAnalyze ? "default" : "secondary"}
          onClick={onAnalyzeClick}
          disabled={!canAnalyze || isAnalyzing}
          className={canAnalyze && !isAnalyzing ? "bg-amber-500 hover:bg-amber-600 text-white" : ""}
        >
          {isAnalyzing ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="mr-2 h-4 w-4" />
          )}
          Analyze Style
        </Button>
        {!canAnalyze && stats && stats.totalPosts < 5 ? (
          <span className="text-sm text-muted-foreground">
            {5 - stats.totalPosts} more post{5 - stats.totalPosts !== 1 ? "s" : ""} needed
          </span>
        ) : canAnalyze && (
          <span className="text-sm text-muted-foreground">
            Uses your {stats && stats.totalPosts > 20 ? "20 most recent" : stats?.totalPosts} posts
          </span>
        )}
      </div>

      {/* Posts List */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <HistoricalPostCardSkeleton key={i} />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <HistoricalPostEmptyState
          onAddPost={handleAddPost}
          onBulkImport={() => setIsBulkImportOpen(true)}
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <HistoricalPostCard
                key={post.id}
                post={post}
                onEdit={handleEditPost}
                onDelete={handleDeleteClick}
              />
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => goToPage(pagination.page - 1)}
                    aria-disabled={!pagination.hasPrev}
                    className={
                      !pagination.hasPrev
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>

                {getPaginationItems().map((item, index) =>
                  item === "ellipsis" ? (
                    <PaginationItem key={`ellipsis-${index}`}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  ) : (
                    <PaginationItem key={item}>
                      <PaginationLink
                        onClick={() => goToPage(item)}
                        isActive={pagination.page === item}
                        className="cursor-pointer"
                      >
                        {item}
                      </PaginationLink>
                    </PaginationItem>
                  )
                )}

                <PaginationItem>
                  <PaginationNext
                    onClick={() => goToPage(pagination.page + 1)}
                    aria-disabled={!pagination.hasNext}
                    className={
                      !pagination.hasNext
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      )}

      {/* Add/Edit Form Dialog */}
      <HistoricalPostForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleFormSubmit}
        platforms={platforms}
        defaultValues={editingPost || undefined}
        isLoading={isSubmitting}
        mode={editingPost ? "edit" : "create"}
      />

      {/* Bulk Import Dialog */}
      <BulkImportDialog
        open={isBulkImportOpen}
        onOpenChange={setIsBulkImportOpen}
        onImport={handleBulkImport}
        platforms={platforms}
        isLoading={isBulkImporting}
      />

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deletingPostId}
        onOpenChange={(open) => !open && setDeletingPostId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Historical Post</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this historical post? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
