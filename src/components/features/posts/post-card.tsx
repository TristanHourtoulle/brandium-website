"use client";

import { memo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Trash2, Copy, Calendar } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { ROUTES } from "@/config/constants";
import {
  formatPostPreview,
  formatPostDate,
  copyToClipboard,
} from "@/lib/services/posts.service";
import type { Post } from "@/types";

interface PostCardProps {
  post: Post;
  onDelete: (id: string) => void;
  searchTerm?: string;
}

function PostCardComponent({ post, onDelete, searchTerm }: PostCardProps) {
  const router = useRouter();

  const handleCardClick = () => {
    router.push(`${ROUTES.POSTS}/${post.id}`);
  };

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const success = await copyToClipboard(post.content);
    if (success) {
      toast.success("Post copied to clipboard");
    } else {
      toast.error("Failed to copy post");
    }
  };

  const preview = formatPostPreview(post.content, 150);
  const formattedDate = formatPostDate(post.createdAt);

  return (
    <Card
      className="group relative cursor-pointer hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.99] active:shadow-md"
      onClick={handleCardClick}
      role="article"
      aria-label={`Post created ${formattedDate}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground/90">
              <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
              <time dateTime={post.createdAt}>{formattedDate}</time>
            </div>
            <CardTitle className="text-base line-clamp-1">
              {post.profile?.name || "No profile"}
            </CardTitle>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => e.stopPropagation()}
                aria-label="Post options"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`${ROUTES.POSTS}/${post.id}`}>View details</Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleCopy}>
                <Copy className="mr-2 h-4 w-4" />
                Copy to clipboard
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(post.id);
                }}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <CardDescription className="line-clamp-3 text-sm">
          {searchTerm ? (
            <HighlightedText text={preview} searchTerm={searchTerm} />
          ) : (
            preview
          )}
        </CardDescription>
        <div className="flex flex-wrap gap-1.5">
          {post.platform && (
            <Badge variant="default" className="text-xs">
              {post.platform.name}
            </Badge>
          )}
          {post.project && (
            <Badge variant="secondary" className="text-xs">
              {post.project.name}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface HighlightedTextProps {
  text: string;
  searchTerm: string;
}

function HighlightedText({ text, searchTerm }: HighlightedTextProps) {
  if (!searchTerm) return <>{text}</>;

  const parts = text.split(new RegExp(`(${searchTerm})`, "gi"));

  return (
    <>
      {parts.map((part, index) =>
        part.toLowerCase() === searchTerm.toLowerCase() ? (
          <mark key={index} className="bg-yellow-200 dark:bg-yellow-800 rounded px-0.5">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  );
}

export const PostCard = memo(PostCardComponent);

// Loading skeleton variant with improved animation
export function PostCardSkeleton() {
  return (
    <Card className="group relative">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-3.5 w-3.5 rounded animate-pulse" />
              <Skeleton className="h-4 w-24 animate-pulse" />
            </div>
            <Skeleton className="h-5 w-32 animate-pulse" />
          </div>
          <Skeleton className="h-8 w-8 rounded-full animate-pulse" />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-full animate-pulse" />
          <Skeleton className="h-4 w-full animate-pulse" />
          <Skeleton className="h-4 w-2/3 animate-pulse" />
        </div>
        <div className="flex gap-1.5">
          <Skeleton className="h-5 w-16 rounded-full animate-pulse" />
          <Skeleton className="h-5 w-20 rounded-full animate-pulse" />
        </div>
      </CardContent>
    </Card>
  );
}
