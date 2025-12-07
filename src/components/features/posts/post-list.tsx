"use client";

import { PostCard, PostCardSkeleton } from "./post-card";
import { PostEmptyState } from "./post-empty-state";
import type { Post, PostFilters } from "@/types";

interface PostListProps {
  posts: Post[];
  isLoading: boolean;
  onDelete: (id: string) => void;
  filters: PostFilters;
  onClearFilters: () => void;
}

export function PostList({
  posts,
  isLoading,
  onDelete,
  filters,
  onClearFilters,
}: PostListProps) {
  if (isLoading) {
    return (
      <div
        className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3"
        aria-busy="true"
        aria-label="Loading posts"
      >
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="animate-fade-in-up"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <PostCardSkeleton />
          </div>
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    const hasFilters =
      Boolean(filters.search) ||
      Boolean(filters.platformId) ||
      Boolean(filters.profileId) ||
      Boolean(filters.projectId);

    return (
      <div className="animate-fade-in">
        <PostEmptyState hasFilters={hasFilters} onClearFilters={onClearFilters} />
      </div>
    );
  }

  return (
    <div
      className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3"
      role="feed"
      aria-label="Posts list"
    >
      {posts.map((post, index) => (
        <div
          key={post.id}
          className="animate-fade-in-up"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <PostCard
            post={post}
            onDelete={onDelete}
            searchTerm={filters.search}
          />
        </div>
      ))}
    </div>
  );
}
