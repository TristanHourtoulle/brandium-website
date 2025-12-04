"use client";

import { use, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Copy,
  Trash2,
  Calendar,
  User,
  Briefcase,
  Monitor,
  Target,
  Lightbulb,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { usePost } from "@/lib/hooks/use-posts";
import * as postsApi from "@/lib/api/posts";
import {
  formatPostDate,
  copyToClipboard,
  getCharacterCountInfo,
} from "@/lib/services/posts.service";
import { ROUTES } from "@/config/constants";

interface PostDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function PostDetailPage({ params }: PostDetailPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { post, isLoading, error } = usePost(id);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleCopy = useCallback(async () => {
    if (!post) return;
    const success = await copyToClipboard(post.content);
    if (success) {
      toast.success("Post copied to clipboard");
    } else {
      toast.error("Failed to copy post");
    }
  }, [post]);

  const handleDelete = useCallback(async () => {
    if (!post) return;
    setIsDeleting(true);
    try {
      await postsApi.deletePost(post.id);
      toast.success("Post deleted successfully");
      router.push(ROUTES.POSTS);
    } catch {
      toast.error("Failed to delete post");
      setIsDeleting(false);
    }
  }, [post, router]);

  if (isLoading) {
    return <PostDetailSkeleton />;
  }

  if (error || !post) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" asChild>
          <Link href={ROUTES.POSTS}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Posts
          </Link>
        </Button>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              {error || "Post not found"}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const charInfo = getCharacterCountInfo(post.content);
  const formattedDate = formatPostDate(post.createdAt);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" asChild>
          <Link href={ROUTES.POSTS}>
            <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
            Back to Posts
          </Link>
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleCopy}>
            <Copy className="mr-2 h-4 w-4" aria-hidden="true" />
            Copy
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={isDeleting}>
                <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" />
                {isDeleting ? "Deleting..." : "Delete"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Post</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this post? This action cannot
                  be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Post Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" aria-hidden="true" />
              <time dateTime={post.createdAt}>{formattedDate}</time>
            </div>
            <div className="flex gap-2">
              {post.platform && (
                <Badge variant="default">{post.platform.name}</Badge>
              )}
            </div>
          </div>
          <CardTitle className="text-xl">Generated Post</CardTitle>
          <CardDescription>
            {charInfo.count} characters
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg bg-muted p-4">
            <p className="whitespace-pre-wrap text-sm leading-relaxed">
              {post.content}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Generation Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Generation Details</CardTitle>
          <CardDescription>
            Information about how this post was generated
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {post.profile && (
            <div className="flex items-start gap-3">
              <User className="h-5 w-5 text-muted-foreground mt-0.5" aria-hidden="true" />
              <div>
                <p className="font-medium">Profile</p>
                <p className="text-sm text-muted-foreground">
                  {post.profile.name}
                </p>
              </div>
            </div>
          )}

          {post.project && (
            <>
              <Separator />
              <div className="flex items-start gap-3">
                <Briefcase className="h-5 w-5 text-muted-foreground mt-0.5" aria-hidden="true" />
                <div>
                  <p className="font-medium">Project</p>
                  <p className="text-sm text-muted-foreground">
                    {post.project.name}
                  </p>
                </div>
              </div>
            </>
          )}

          {post.platform && (
            <>
              <Separator />
              <div className="flex items-start gap-3">
                <Monitor className="h-5 w-5 text-muted-foreground mt-0.5" aria-hidden="true" />
                <div>
                  <p className="font-medium">Platform</p>
                  <p className="text-sm text-muted-foreground">
                    {post.platform.name}
                  </p>
                </div>
              </div>
            </>
          )}

          {post.goal && (
            <>
              <Separator />
              <div className="flex items-start gap-3">
                <Target className="h-5 w-5 text-muted-foreground mt-0.5" aria-hidden="true" />
                <div>
                  <p className="font-medium">Goal</p>
                  <p className="text-sm text-muted-foreground">{post.goal}</p>
                </div>
              </div>
            </>
          )}

          {post.rawIdea && (
            <>
              <Separator />
              <div className="flex items-start gap-3">
                <Lightbulb className="h-5 w-5 text-muted-foreground mt-0.5" aria-hidden="true" />
                <div>
                  <p className="font-medium">Original Idea</p>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {post.rawIdea}
                  </p>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function PostDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-32" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>

      <Card>
        <CardHeader>
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-24" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            <Skeleton className="h-5 w-5" />
            <div className="space-y-1">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
