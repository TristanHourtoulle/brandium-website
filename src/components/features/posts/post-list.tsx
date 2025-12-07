"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { memo, useState, useEffect } from "react";
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

// Skeleton count for loading state
const SKELETON_COUNT = 6;

function PostListComponent({
  posts,
  isLoading,
  onDelete,
  filters,
  onClearFilters,
}: PostListProps) {
  // Track animation state
  const [animationState, setAnimationState] = useState({
    hasShownContent: false,
    previousPostIds: "",
    shouldAnimate: true,
  });

  // Update animation state when posts change
  useEffect(() => {
    if (!isLoading && posts.length > 0) {
      const currentIds = posts.map((p) => p.id).join(",");

      setAnimationState((prev) => {
        // If we've shown content before and IDs are the same, don't animate
        if (prev.hasShownContent && currentIds === prev.previousPostIds) {
          return { ...prev, shouldAnimate: false };
        }
        // Otherwise, animate and update state
        return {
          hasShownContent: true,
          previousPostIds: currentIds,
          shouldAnimate: true,
        };
      });
    }
  }, [posts, isLoading]);

  // Show skeleton only on initial load
  if (isLoading && !animationState.hasShownContent) {
    return (
      <div
        className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3"
        aria-busy="true"
        aria-label="Loading posts"
      >
        {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
          <div
            key={`skeleton-${index}`}
            className="animate-fade-in-up opacity-0"
            style={{
              animationDelay: `${index * 50}ms`,
              animationFillMode: "forwards",
            }}
          >
            <PostCardSkeleton />
          </div>
        ))}
      </div>
    );
  }

  if (posts.length === 0 && !isLoading) {
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
          className={animationState.shouldAnimate ? "animate-fade-in-up opacity-0" : ""}
          style={
            animationState.shouldAnimate
              ? {
                  animationDelay: `${index * 50}ms`,
                  animationFillMode: "forwards",
                }
              : undefined
          }
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

export const PostList = memo(PostListComponent);
