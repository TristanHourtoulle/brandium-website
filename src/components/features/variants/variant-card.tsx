"use client";

import { memo } from "react";
import { Check, Copy, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils/cn";
import type { VariantData, VariantApproach, LinkedInFormat } from "@/types";
import { getApproachInfo } from "@/lib/hooks/use-variants";

interface VariantCardProps {
  variant: VariantData;
  index: number;
  isSelected?: boolean;
  onSelect?: (variant: VariantData) => void;
  onCopy?: (variant: VariantData) => void;
  onViewPost?: (variant: VariantData) => void;
  isCopied?: boolean;
  compact?: boolean;
}

function getFormatLabel(format: LinkedInFormat): string {
  switch (format) {
    case "story":
      return "Story";
    case "opinion":
      return "Opinion";
    case "debate":
      return "Debate";
    default:
      return format;
  }
}

function VariantCardComponent({
  variant,
  index,
  isSelected = false,
  onSelect,
  onCopy,
  onViewPost,
  isCopied = false,
  compact = false,
}: VariantCardProps) {
  const approachInfo = getApproachInfo(variant.approach);

  const handleSelect = () => {
    onSelect?.(variant);
  };

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    onCopy?.(variant);
  };

  const handleViewPost = (e: React.MouseEvent) => {
    e.stopPropagation();
    onViewPost?.(variant);
  };

  return (
    <Card
      className={cn(
        "group relative transition-all duration-200 cursor-pointer",
        isSelected
          ? "ring-2 ring-primary shadow-md bg-primary/5"
          : "hover:shadow-md hover:-translate-y-0.5",
      )}
      onClick={handleSelect}
      role="article"
      aria-label={`Variant ${index + 1}: ${approachInfo.label}`}
      aria-selected={isSelected}
    >
      <CardHeader className={cn("pb-2", compact && "py-3")}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge
                variant="secondary"
                className={cn("text-xs font-medium", approachInfo.color)}
              >
                <span className="mr-1">{approachInfo.icon}</span>
                {approachInfo.label}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {getFormatLabel(variant.format)}
              </Badge>
            </div>
            <CardTitle className={cn("line-clamp-1", compact ? "text-base" : "text-lg")}>
              Variant {index + 1}
            </CardTitle>
          </div>

          {isSelected && (
            <div className="flex items-center justify-center h-6 w-6 rounded-full bg-primary text-primary-foreground">
              <Check className="h-4 w-4" />
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className={cn("space-y-3", compact && "pb-3")}>
        <CardDescription className="text-xs">
          {approachInfo.description}
        </CardDescription>

        {/* Content preview */}
        <div className="text-sm text-muted-foreground bg-muted/50 rounded-md p-3 max-h-32 overflow-y-auto">
          <p className="whitespace-pre-line line-clamp-5">{variant.generatedText}</p>
        </div>

        {/* Footer stats */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
          <span>{variant.generatedText.length} characters</span>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={handleCopy}
              disabled={isCopied}
            >
              {isCopied ? (
                <>
                  <Check className="h-3 w-3 mr-1 text-green-500" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3 mr-1" />
                  Copy
                </>
              )}
            </Button>

            {onViewPost && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={handleViewPost}
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                View
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export const VariantCard = memo(VariantCardComponent);

// Loading skeleton
export function VariantCardSkeleton({ compact = false }: { compact?: boolean }) {
  return (
    <Card className="group relative">
      <CardHeader className={cn("pb-2", compact && "py-3")}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <Skeleton className="h-5 w-24" />
          </div>
        </div>
      </CardHeader>
      <CardContent className={cn("space-y-3", compact && "pb-3")}>
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-24 w-full rounded-md" />
        <div className="flex items-center justify-between pt-1">
          <Skeleton className="h-4 w-20" />
          <div className="flex gap-2">
            <Skeleton className="h-7 w-16" />
            <Skeleton className="h-7 w-14" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Grid layout for variants
interface VariantCardGridProps {
  variants: VariantData[];
  selectedVariant?: VariantData | null;
  onSelect?: (variant: VariantData) => void;
  onCopy?: (variant: VariantData) => void;
  onViewPost?: (variant: VariantData) => void;
  copiedId?: string | null;
  isLoading?: boolean;
  loadingCount?: number;
  compact?: boolean;
}

export function VariantCardGrid({
  variants,
  selectedVariant,
  onSelect,
  onCopy,
  onViewPost,
  copiedId,
  isLoading = false,
  loadingCount = 3,
  compact = false,
}: VariantCardGridProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {[...Array(loadingCount)].map((_, i) => (
          <VariantCardSkeleton key={i} compact={compact} />
        ))}
      </div>
    );
  }

  if (variants.length === 0) {
    return null;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {variants.map((variant, index) => (
        <VariantCard
          key={variant.versionId}
          variant={variant}
          index={index}
          isSelected={selectedVariant?.versionId === variant.versionId}
          onSelect={onSelect}
          onCopy={onCopy}
          onViewPost={onViewPost}
          isCopied={copiedId === variant.versionId}
          compact={compact}
        />
      ))}
    </div>
  );
}
