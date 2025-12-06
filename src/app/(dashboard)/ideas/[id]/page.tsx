"use client";

import { useParams, useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Clock,
  Target,
  User,
  Briefcase,
  Share2,
  Sparkles,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
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
import { PageHeader } from "@/components/layout/page-header";
import { usePostIdea } from "@/lib/hooks/use-post-ideas";
import { deleteIdea } from "@/lib/api/ideas";
import { ROUTES } from "@/config/constants";
import { toast } from "sonner";

export default function IdeaDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { idea, isLoading, error } = usePostIdea(id);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleUseIdea = useCallback(() => {
    router.push(`${ROUTES.GENERATE}?ideaId=${id}`);
  }, [router, id]);

  const handleDelete = useCallback(async () => {
    setIsDeleting(true);
    try {
      await deleteIdea(id);
      toast.success("Idea deleted successfully");
      router.push(ROUTES.IDEAS);
    } catch {
      toast.error("Failed to delete idea");
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  }, [id, router]);

  if (isLoading) {
    return <IdeaDetailsSkeleton />;
  }

  if (error || !idea) {
    return (
      <div className="space-y-6">
        <PageHeader title="Idea Not Found">
          <Button variant="outline" asChild>
            <Link href={ROUTES.IDEAS}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Ideas
            </Link>
          </Button>
        </PageHeader>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              {error || "This idea could not be found."}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const relevancePercent = Math.round(idea.relevanceScore * 100);

  return (
    <div className="space-y-6">
      <PageHeader title="Idea Details">
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={ROUTES.IDEAS}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Ideas
            </Link>
          </Button>
          <Button onClick={handleUseIdea} disabled={idea.isUsed}>
            <ArrowRight className="mr-2 h-4 w-4" />
            Use This Idea
          </Button>
        </div>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <CardTitle className="text-xl">{idea.title}</CardTitle>
                  {idea.isUsed && (
                    <Badge variant="secondary">Used</Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">
                  Description
                </h4>
                <p className="text-sm leading-relaxed">{idea.description}</p>
              </div>

              {idea.suggestedGoal && (
                <div>
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                    <Target className="h-4 w-4" />
                    Suggested Goal
                  </div>
                  <p className="text-sm">{idea.suggestedGoal}</p>
                </div>
              )}

              <Separator />

              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-3">
                  Tags
                </h4>
                <div className="flex flex-wrap gap-2">
                  {idea.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Generation Context */}
          {idea.generationContext && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  Generation Details
                </CardTitle>
                <CardDescription>
                  How this idea was generated
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <span className="text-sm text-muted-foreground">Mode</span>
                    <p className="font-medium capitalize">
                      {idea.generationContext.mode}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">
                      Historical Posts Analyzed
                    </span>
                    <p className="font-medium">
                      {idea.generationContext.historicalPostsCount}
                    </p>
                  </div>
                </div>

                {idea.generationContext.customContext && (
                  <div>
                    <span className="text-sm text-muted-foreground">
                      Custom Context
                    </span>
                    <p className="mt-1 text-sm bg-muted/50 p-3 rounded-lg">
                      {idea.generationContext.customContext}
                    </p>
                  </div>
                )}

                {idea.generationContext.recentTopicsExcluded.length > 0 && (
                  <div>
                    <span className="text-sm text-muted-foreground">
                      Topics Excluded
                    </span>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {idea.generationContext.recentTopicsExcluded.map(
                        (topic) => (
                          <Badge
                            key={topic}
                            variant="secondary"
                            className="text-xs"
                          >
                            {topic}
                          </Badge>
                        )
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Relevance Score */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Relevance Score</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold">{relevancePercent}%</span>
              </div>
              <Progress value={relevancePercent} className="h-2" />
              <p className="text-sm text-muted-foreground">
                {relevancePercent >= 80
                  ? "High relevance to your content"
                  : relevancePercent >= 50
                  ? "Moderate relevance"
                  : "Consider refining your context"}
              </p>
            </CardContent>
          </Card>

          {/* Context */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Context</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {idea.profile && (
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Profile:</span>
                  <span className="font-medium">{idea.profile.name}</span>
                </div>
              )}
              {idea.project && (
                <div className="flex items-center gap-2 text-sm">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Project:</span>
                  <span className="font-medium">{idea.project.name}</span>
                </div>
              )}
              {idea.platform && (
                <div className="flex items-center gap-2 text-sm">
                  <Share2 className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Platform:</span>
                  <span className="font-medium">{idea.platform.name}</span>
                </div>
              )}
              {!idea.profile && !idea.project && !idea.platform && (
                <p className="text-sm text-muted-foreground">
                  No specific context
                </p>
              )}
            </CardContent>
          </Card>

          {/* Timestamps */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Created:</span>
                <span>{formatDate(idea.createdAt)}</span>
              </div>
              {idea.usedAt && (
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Used:</span>
                  <span>{formatDate(idea.usedAt)}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardContent className="pt-6 space-y-3">
              <Button
                className="w-full"
                onClick={handleUseIdea}
                disabled={idea.isUsed}
              >
                <ArrowRight className="mr-2 h-4 w-4" />
                Use This Idea
              </Button>
              <Button
                variant="destructive"
                className="w-full"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Idea
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

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
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function IdeaDetailsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-36" />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-4 w-16" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-14" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-2 w-full mt-3" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
