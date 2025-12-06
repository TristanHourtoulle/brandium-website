"use client";

import { X, Target, Calendar, User, Briefcase, Share2, Clock, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import type { PostIdea } from "@/types";

interface IdeaDetailsSidebarProps {
  idea: PostIdea | null;
  isLoading: boolean;
  isOpen: boolean;
  onClose: () => void;
  onUse: (id: string) => void;
  onDelete: (id: string) => void;
}

export function IdeaDetailsSidebar({
  idea,
  isLoading,
  isOpen,
  onClose,
  onUse,
  onDelete,
}: IdeaDetailsSidebarProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <SheetTitle>Idea Details</SheetTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <SheetDescription>
            View complete idea information and take action
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-180px)] mt-6 pr-4">
          {isLoading ? (
            <IdeaDetailsSkeleton />
          ) : idea ? (
            <div className="space-y-6">
              {/* Title */}
              <div>
                <h3 className="text-lg font-semibold">{idea.title}</h3>
                {idea.isUsed && (
                  <Badge variant="secondary" className="mt-2">
                    Used
                  </Badge>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">
                  Description
                </h4>
                <p className="text-sm">{idea.description}</p>
              </div>

              {/* Suggested Goal */}
              {idea.suggestedGoal && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Target className="h-4 w-4" />
                    Suggested Goal
                  </div>
                  <p className="text-sm">{idea.suggestedGoal}</p>
                </div>
              )}

              {/* Relevance Score */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-muted-foreground">
                    Relevance Score
                  </span>
                  <span className="font-semibold">
                    {Math.round(idea.relevanceScore * 100)}%
                  </span>
                </div>
                <Progress value={idea.relevanceScore * 100} className="h-2" />
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">
                  Tags
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {idea.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Context Info */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-muted-foreground">
                  Context
                </h4>

                {idea.profile && (
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Profile:</span>
                    <span>{idea.profile.name}</span>
                  </div>
                )}

                {idea.project && (
                  <div className="flex items-center gap-2 text-sm">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Project:</span>
                    <span>{idea.project.name}</span>
                  </div>
                )}

                {idea.platform && (
                  <div className="flex items-center gap-2 text-sm">
                    <Share2 className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Platform:</span>
                    <span>{idea.platform.name}</span>
                  </div>
                )}
              </div>

              {/* Generation Context */}
              {idea.generationContext && (
                <>
                  <Separator />
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-muted-foreground">
                      Generation Details
                    </h4>

                    <div className="flex items-center gap-2 text-sm">
                      <Sparkles className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Mode:</span>
                      <Badge variant="outline" className="capitalize">
                        {idea.generationContext.mode}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">
                        Historical posts analyzed:
                      </span>
                      <span>{idea.generationContext.historicalPostsCount}</span>
                    </div>

                    {idea.generationContext.customContext && (
                      <div className="space-y-1">
                        <span className="text-sm text-muted-foreground">
                          Custom context:
                        </span>
                        <p className="text-sm bg-muted/50 p-2 rounded">
                          {idea.generationContext.customContext}
                        </p>
                      </div>
                    )}

                    {idea.generationContext.recentTopicsExcluded.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-sm text-muted-foreground">
                          Topics excluded:
                        </span>
                        <div className="flex flex-wrap gap-1">
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
                  </div>
                </>
              )}

              <Separator />

              {/* Timestamps */}
              <div className="space-y-2">
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
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4">
                <Button
                  className="flex-1"
                  onClick={() => onUse(idea.id)}
                  disabled={idea.isUsed}
                >
                  Use this idea
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => onDelete(idea.id)}
                >
                  Delete
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No idea selected
            </p>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

function IdeaDetailsSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-6 w-3/4" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-20 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-2 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-16" />
        <div className="flex gap-1.5">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-14" />
        </div>
      </div>
    </div>
  );
}
