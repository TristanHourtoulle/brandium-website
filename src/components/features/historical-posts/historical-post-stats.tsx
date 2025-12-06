"use client";

import {
  FileText,
  ThumbsUp,
  MessageCircle,
  Calendar,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import type { HistoricalPostsStats } from "@/types";

interface HistoricalPostStatsProps {
  stats: HistoricalPostsStats | null;
  isLoading: boolean;
}

export function HistoricalPostStats({
  stats,
  isLoading,
}: HistoricalPostStatsProps) {
  if (isLoading) {
    return <HistoricalPostStatsSkeleton />;
  }

  if (!stats) {
    return null;
  }

  const dateRange =
    stats.dateRange.oldest && stats.dateRange.newest
      ? `${format(new Date(stats.dateRange.oldest), "MMM yyyy")} - ${format(
          new Date(stats.dateRange.newest),
          "MMM yyyy"
        )}`
      : "No posts yet";

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total Posts
              </p>
              <p className="text-2xl font-bold">{stats.totalPosts}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/10">
              <ThumbsUp className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Avg. Likes
              </p>
              <p className="text-2xl font-bold">
                {stats.engagement.averageLikes.toLocaleString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10">
              <MessageCircle className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Avg. Comments
              </p>
              <p className="text-2xl font-bold">
                {stats.engagement.averageComments.toLocaleString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500/10">
              <Calendar className="h-5 w-5 text-orange-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Date Range
              </p>
              <p className="text-sm font-bold">{dateRange}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function HistoricalPostStatsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <Card key={i}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-16" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
