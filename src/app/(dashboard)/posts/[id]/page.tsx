"use client";

import { use, useState, useCallback, useEffect } from "react";
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
  Wand2,
  History,
  ChevronDown,
  ChevronUp,
  Check,
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
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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
import { usePostIterations } from "@/lib/hooks/use-post-iterations";
import * as postsApi from "@/lib/api/posts";
import {
  formatPostDate,
  copyToClipboard,
  getCharacterCountInfo,
} from "@/lib/services/posts.service";
import { ROUTES } from "@/config/constants";
import {
  IterationDialog,
  VersionHistory,
} from "@/components/features/iterations";

interface PostDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function PostDetailPage({ params }: PostDetailPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { post, isLoading, error, refetch } = usePost(id);
  const [isDeleting, setIsDeleting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isIterationDialogOpen, setIsIterationDialogOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const {
    versions,
    currentVersion,
    totalVersions,
    isIterating,
    isFetchingVersions,
    isSelectingVersion,
    iterate,
    fetchVersions,
    selectVersion,
  } = usePostIterations();

  // Fetch versions when post loads
  useEffect(() => {
    if (post?.id) {
      fetchVersions(post.id);
    }
  }, [post?.id, fetchVersions]);

  // Get display content - prefer current version if available
  const displayContent = currentVersion?.generatedText || post?.content || "";
  const displayVersionNumber =
    currentVersion?.versionNumber || post?.totalVersions || 1;

  const handleCopy = useCallback(async () => {
    if (!displayContent) return;
    const success = await copyToClipboard(displayContent);
    if (success) {
      setCopied(true);
      toast.success("Post copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } else {
      toast.error("Failed to copy post");
    }
  }, [displayContent]);

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

  const handleIterate = async (prompt: string) => {
    if (!post) return;
    const result = await iterate(post.id, { iterationPrompt: prompt });
    if (result) {
      setIsIterationDialogOpen(false);
      // Refetch post to get updated content
      refetch();
    }
  };

  const handleSelectVersion = async (versionId: string) => {
    if (!post) return;
    await selectVersion(post.id, versionId);
    // Refetch post to get updated content
    refetch();
  };

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
            <p className="text-muted-foreground">{error || "Post not found"}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const charInfo = getCharacterCountInfo(displayContent);
  const formattedDate = formatPostDate(post.createdAt);

  return (
    <>
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
            <Button
              variant="outline"
              onClick={handleCopy}
              disabled={copied}
            >
              {copied ? (
                <>
                  <Check className="mr-2 h-4 w-4" aria-hidden="true" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="mr-2 h-4 w-4" aria-hidden="true" />
                  Copy
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsIterationDialogOpen(true)}
              disabled={isIterating}
            >
              <Wand2 className="mr-2 h-4 w-4" aria-hidden="true" />
              Refine
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
                    Are you sure you want to delete this post? This action
                    cannot be undone. All versions will also be deleted.
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
                {totalVersions > 0 && (
                  <Badge variant="outline" className="font-mono text-xs">
                    v{displayVersionNumber}
                    {totalVersions > 1 && ` of ${totalVersions}`}
                  </Badge>
                )}
                {post.platform && (
                  <Badge variant="default">{post.platform.name}</Badge>
                )}
              </div>
            </div>
            <CardTitle className="text-xl">Generated Post</CardTitle>
            <CardDescription>{charInfo.count} characters</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-muted p-4">
              <p className="whitespace-pre-wrap text-sm leading-relaxed">
                {displayContent}
              </p>
            </div>

            {/* Version History (collapsible) */}
            {totalVersions > 1 && (
              <Collapsible open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-between"
                    size="sm"
                  >
                    <span className="flex items-center gap-2">
                      <History className="h-4 w-4" />
                      View all versions ({totalVersions})
                    </span>
                    {isHistoryOpen ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-4">
                  <VersionHistory
                    versions={versions}
                    onSelectVersion={handleSelectVersion}
                    isLoading={isFetchingVersions}
                    isSelectingVersion={isSelectingVersion}
                  />
                </CollapsibleContent>
              </Collapsible>
            )}
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
                <User
                  className="h-5 w-5 text-muted-foreground mt-0.5"
                  aria-hidden="true"
                />
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
                  <Briefcase
                    className="h-5 w-5 text-muted-foreground mt-0.5"
                    aria-hidden="true"
                  />
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
                  <Monitor
                    className="h-5 w-5 text-muted-foreground mt-0.5"
                    aria-hidden="true"
                  />
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
                  <Target
                    className="h-5 w-5 text-muted-foreground mt-0.5"
                    aria-hidden="true"
                  />
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
                  <Lightbulb
                    className="h-5 w-5 text-muted-foreground mt-0.5"
                    aria-hidden="true"
                  />
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

      {/* Iteration Dialog */}
      <IterationDialog
        open={isIterationDialogOpen}
        onOpenChange={setIsIterationDialogOpen}
        onSubmit={handleIterate}
        isLoading={isIterating}
        currentVersionNumber={displayVersionNumber}
      />
    </>
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
