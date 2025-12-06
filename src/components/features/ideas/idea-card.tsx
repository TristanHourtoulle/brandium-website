"use client";

import { memo } from "react";
import { useRouter } from "next/navigation";
import {
  MoreHorizontal,
  Trash2,
  ArrowRight,
  CheckCircle2,
  Calendar,
  Target,
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { ROUTES } from "@/config/constants";
import type { PostIdea } from "@/types";

interface IdeaCardProps {
  idea: PostIdea;
  onDelete: (id: string) => void;
  onUse: (id: string) => void;
  isSelected?: boolean;
  onToggleSelect?: (id: string) => void;
  showCheckbox?: boolean;
}

function IdeaCardComponent({
  idea,
  onDelete,
  onUse,
  isSelected = false,
  onToggleSelect,
  showCheckbox = false,
}: IdeaCardProps) {
  const router = useRouter();

  const handleCardClick = () => {
    router.push(`${ROUTES.IDEAS}/${idea.id}`);
  };

  const handleUseClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onUse(idea.id);
  };

  const relevancePercent = Math.round(idea.relevanceScore * 100);
  const formattedDate = new Date(idea.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <Card
      className="group relative cursor-pointer transition-shadow hover:shadow-md"
      onClick={handleCardClick}
      role="article"
      aria-label={`Idea: ${idea.title}`}
    >
      {showCheckbox && (
        <div
          className="absolute top-4 left-4 z-10"
          onClick={(e) => e.stopPropagation()}
        >
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => onToggleSelect?.(idea.id)}
            aria-label={`Select idea: ${idea.title}`}
          />
        </div>
      )}

      <CardHeader className={`pb-3 ${showCheckbox ? "pl-12" : ""}`}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
              <time dateTime={idea.createdAt}>{formattedDate}</time>
              {idea.isUsed && (
                <Badge variant="secondary" className="text-xs gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Used
                </Badge>
              )}
            </div>
            <CardTitle className="text-base line-clamp-2">{idea.title}</CardTitle>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                onClick={(e) => e.stopPropagation()}
                aria-label="Idea options"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`${ROUTES.IDEAS}/${idea.id}`);
                }}
              >
                View details
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleUseClick}
                disabled={idea.isUsed}
              >
                <ArrowRight className="mr-2 h-4 w-4" />
                Use this idea
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(idea.id);
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

      <CardContent className={`space-y-4 ${showCheckbox ? "pl-12" : ""}`}>
        <CardDescription className="line-clamp-3 text-sm">
          {idea.description}
        </CardDescription>

        {idea.suggestedGoal && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Target className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{idea.suggestedGoal}</span>
          </div>
        )}

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Relevance</span>
            <span className="font-medium">{relevancePercent}%</span>
          </div>
          <Progress value={relevancePercent} className="h-1.5" />
        </div>

        <div className="flex flex-wrap gap-1.5">
          {idea.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
          {idea.tags.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{idea.tags.length - 3}
            </Badge>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5 pt-1">
          {idea.profile && (
            <Badge variant="default" className="text-xs">
              {idea.profile.name}
            </Badge>
          )}
          {idea.platform && (
            <Badge variant="secondary" className="text-xs">
              {idea.platform.name}
            </Badge>
          )}
          {idea.project && (
            <Badge variant="secondary" className="text-xs">
              {idea.project.name}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export const IdeaCard = memo(IdeaCardComponent);

// Loading skeleton variant
export function IdeaCardSkeleton() {
  return (
    <Card className="group relative">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-5 w-3/4" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-1.5 w-full" />
        </div>
        <div className="flex gap-1.5">
          <Skeleton className="h-5 w-12" />
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-14" />
        </div>
        <div className="flex gap-1.5">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-16" />
        </div>
      </CardContent>
    </Card>
  );
}
