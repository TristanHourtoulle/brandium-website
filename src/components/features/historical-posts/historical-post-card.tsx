"use client";

import { memo } from "react";
import {
  MoreHorizontal,
  Trash2,
  Edit,
  Calendar,
  ExternalLink,
  ThumbsUp,
  MessageCircle,
  Share2,
  Eye,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow, format } from "date-fns";
import type { HistoricalPost } from "@/types";

interface HistoricalPostCardProps {
  post: HistoricalPost;
  onEdit: (post: HistoricalPost) => void;
  onDelete: (id: string) => void;
}

function HistoricalPostCardComponent({
  post,
  onEdit,
  onDelete,
}: HistoricalPostCardProps) {
  const formattedDate = post.publishedAt
    ? formatDistanceToNow(new Date(post.publishedAt), { addSuffix: true })
    : "No date";

  const fullDate = post.publishedAt
    ? format(new Date(post.publishedAt), "PPP")
    : undefined;

  const preview =
    post.content.length > 200
      ? `${post.content.substring(0, 200)}...`
      : post.content;

  const hasEngagement =
    post.engagement &&
    (post.engagement.likes ||
      post.engagement.comments ||
      post.engagement.shares ||
      post.engagement.views);

  return (
    <Card className="group relative transition-shadow hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
              <time dateTime={post.publishedAt} title={fullDate}>
                {formattedDate}
              </time>
              {post.platform && (
                <Badge variant="secondary" className="text-xs">
                  {post.platform.name}
                </Badge>
              )}
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Post options"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(post)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit post
              </DropdownMenuItem>
              {post.externalUrl && (
                <DropdownMenuItem asChild>
                  <a
                    href={post.externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View original
                  </a>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(post.id)}
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
        <CardDescription className="text-sm whitespace-pre-wrap line-clamp-4">
          {preview}
        </CardDescription>

        {hasEngagement && (
          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground pt-2 border-t">
            {post.engagement?.likes !== undefined && post.engagement.likes > 0 && (
              <div className="flex items-center gap-1">
                <ThumbsUp className="h-3.5 w-3.5" />
                <span>{post.engagement.likes.toLocaleString()}</span>
              </div>
            )}
            {post.engagement?.comments !== undefined &&
              post.engagement.comments > 0 && (
                <div className="flex items-center gap-1">
                  <MessageCircle className="h-3.5 w-3.5" />
                  <span>{post.engagement.comments.toLocaleString()}</span>
                </div>
              )}
            {post.engagement?.shares !== undefined && post.engagement.shares > 0 && (
              <div className="flex items-center gap-1">
                <Share2 className="h-3.5 w-3.5" />
                <span>{post.engagement.shares.toLocaleString()}</span>
              </div>
            )}
            {post.engagement?.views !== undefined && post.engagement.views > 0 && (
              <div className="flex items-center gap-1">
                <Eye className="h-3.5 w-3.5" />
                <span>{post.engagement.views.toLocaleString()}</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export const HistoricalPostCard = memo(HistoricalPostCardComponent);

export function HistoricalPostCardSkeleton() {
  return (
    <Card className="group relative">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-5 w-16" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <div className="flex gap-3 pt-2 border-t">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-12" />
        </div>
      </CardContent>
    </Card>
  );
}
