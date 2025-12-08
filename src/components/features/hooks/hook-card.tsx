"use client";

import { memo } from "react";
import { Check, Copy, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils/cn";
import type { Hook } from "@/types";
import { getHookTypeInfo, formatEngagementScore } from "@/lib/api/hooks";

interface HookCardProps {
  hook: Hook;
  isSelected?: boolean;
  onSelect?: (hook: Hook) => void;
  onCopy?: (text: string) => void;
  showSelectButton?: boolean;
  compact?: boolean;
}

function HookCardComponent({
  hook,
  isSelected = false,
  onSelect,
  onCopy,
  showSelectButton = true,
  compact = false,
}: HookCardProps) {
  const typeInfo = getHookTypeInfo(hook.type);
  const engagementInfo = formatEngagementScore(hook.estimatedEngagement);

  const handleSelect = () => {
    onSelect?.(hook);
  };

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    onCopy?.(hook.text);
  };

  return (
    <Card
      className={cn(
        "group relative transition-all duration-200",
        isSelected
          ? "ring-2 ring-primary shadow-md"
          : "hover:shadow-md hover:-translate-y-0.5",
        onSelect && "cursor-pointer"
      )}
      onClick={onSelect ? handleSelect : undefined}
      role="article"
      aria-label={`${typeInfo.label} hook`}
      aria-selected={isSelected}
    >
      <CardHeader className={cn("pb-2", compact && "py-3")}>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Badge
              variant="secondary"
              className={cn(
                "text-xs font-medium gap-1",
                typeInfo.bgColor,
                typeInfo.color
              )}
            >
              <span aria-hidden="true">{typeInfo.icon}</span>
              {typeInfo.label}
            </Badge>
            {isSelected && (
              <Badge variant="default" className="text-xs gap-1">
                <Check className="h-3 w-3" />
                Selected
              </Badge>
            )}
          </div>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "h-3 w-3",
                        i < Math.round(hook.estimatedEngagement / 2)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      )}
                    />
                  ))}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  Engagement: {hook.estimatedEngagement}/10 ({engagementInfo.label})
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>

      <CardContent className={cn("space-y-3", compact && "pb-3")}>
        <CardDescription
          className={cn(
            "text-foreground font-medium leading-relaxed",
            compact ? "text-sm line-clamp-3" : "text-base"
          )}
        >
          &ldquo;{hook.text}&rdquo;
        </CardDescription>

        {!compact && (
          <p className="text-xs text-muted-foreground">{typeInfo.description}</p>
        )}

        <div className="flex items-center justify-between gap-2 pt-1">
          <div className={cn("text-xs font-medium", engagementInfo.color)}>
            {engagementInfo.label} engagement
          </div>

          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            {onCopy && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2"
                onClick={handleCopy}
              >
                <Copy className="h-3 w-3 mr-1" />
                Copy
              </Button>
            )}
            {showSelectButton && onSelect && !isSelected && (
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-2"
                onClick={handleSelect}
              >
                <Check className="h-3 w-3 mr-1" />
                Use
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export const HookCard = memo(HookCardComponent);

// Loading skeleton
export function HookCardSkeleton({ compact = false }: { compact?: boolean }) {
  return (
    <Card className="group relative">
      <CardHeader className={cn("pb-2", compact && "py-3")}>
        <div className="flex items-center justify-between gap-2">
          <Skeleton className="h-5 w-24 rounded-full" />
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-3 w-3 rounded-full" />
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className={cn("space-y-3", compact && "pb-3")}>
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          {!compact && <Skeleton className="h-4 w-3/4" />}
        </div>
        {!compact && <Skeleton className="h-3 w-2/3" />}
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-7 w-16" />
        </div>
      </CardContent>
    </Card>
  );
}

// Grid layout for multiple hook cards
export function HookCardGrid({
  hooks,
  selectedHook,
  onSelect,
  onCopy,
  isLoading = false,
  compact = false,
}: {
  hooks: Hook[];
  selectedHook?: Hook | null;
  onSelect?: (hook: Hook) => void;
  onCopy?: (text: string) => void;
  isLoading?: boolean;
  compact?: boolean;
}) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {[...Array(4)].map((_, i) => (
          <HookCardSkeleton key={i} compact={compact} />
        ))}
      </div>
    );
  }

  if (hooks.length === 0) {
    return null;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {hooks.map((hook, index) => (
        <HookCard
          key={`${hook.type}-${index}`}
          hook={hook}
          isSelected={selectedHook?.type === hook.type && selectedHook?.text === hook.text}
          onSelect={onSelect}
          onCopy={onCopy}
          compact={compact}
        />
      ))}
    </div>
  );
}
