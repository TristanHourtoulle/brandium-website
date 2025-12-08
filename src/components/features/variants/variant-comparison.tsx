"use client";

import { useState, useCallback } from "react";
import { Check, Copy, ExternalLink, ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils/cn";
import type { VariantData, LinkedInFormat } from "@/types";
import { getApproachInfo } from "@/lib/hooks/use-variants";
import { copyToClipboard } from "@/lib/utils/format";
import { toast } from "sonner";

interface VariantComparisonProps {
  variants: VariantData[];
  selectedVariant: VariantData | null;
  onSelectVariant: (variant: VariantData) => void;
  onViewPost?: (variant: VariantData) => void;
  context?: {
    profile?: { id: string; name: string };
    project?: { id: string; name: string };
    platform?: { id: string; name: string };
    historicalPostsUsed: number;
  } | null;
  className?: string;
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

export function VariantComparison({
  variants,
  selectedVariant,
  onSelectVariant,
  onViewPost,
  context,
  className,
}: VariantComparisonProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedVariant, setExpandedVariant] = useState<VariantData | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleCopy = useCallback(async (variant: VariantData) => {
    const success = await copyToClipboard(variant.generatedText);
    if (success) {
      setCopiedId(variant.versionId);
      toast.success("Copied to clipboard!");
      setTimeout(() => setCopiedId(null), 2000);
    }
  }, []);

  const handlePrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : variants.length - 1));
  }, [variants.length]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev < variants.length - 1 ? prev + 1 : 0));
  }, [variants.length]);

  if (variants.length === 0) {
    return null;
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Context Info */}
      {context && (
        <div className="flex flex-wrap gap-2">
          {context.profile && (
            <Badge variant="secondary" className="text-xs">
              Profile: {context.profile.name}
            </Badge>
          )}
          {context.project && (
            <Badge variant="secondary" className="text-xs">
              Project: {context.project.name}
            </Badge>
          )}
          {context.platform && (
            <Badge variant="secondary" className="text-xs">
              Platform: {context.platform.name}
            </Badge>
          )}
          {context.historicalPostsUsed > 0 && (
            <Badge variant="outline" className="text-xs text-primary border-primary/50">
              Style matched from {context.historicalPostsUsed} post{context.historicalPostsUsed !== 1 ? "s" : ""}
            </Badge>
          )}
        </div>
      )}

      {/* Mobile Carousel View */}
      <div className="md:hidden">
        <div className="flex items-center justify-between mb-4">
          <Button variant="outline" size="icon" onClick={handlePrevious}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">
            {currentIndex + 1} of {variants.length}
          </span>
          <Button variant="outline" size="icon" onClick={handleNext}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <VariantDetailCard
          variant={variants[currentIndex]}
          index={currentIndex}
          isSelected={selectedVariant?.versionId === variants[currentIndex].versionId}
          onSelect={onSelectVariant}
          onCopy={handleCopy}
          onViewPost={onViewPost}
          onExpand={setExpandedVariant}
          isCopied={copiedId === variants[currentIndex].versionId}
        />
      </div>

      {/* Desktop Grid View */}
      <div className="hidden md:grid gap-4 md:grid-cols-2">
        {variants.map((variant, index) => (
          <VariantDetailCard
            key={variant.versionId}
            variant={variant}
            index={index}
            isSelected={selectedVariant?.versionId === variant.versionId}
            onSelect={onSelectVariant}
            onCopy={handleCopy}
            onViewPost={onViewPost}
            onExpand={setExpandedVariant}
            isCopied={copiedId === variant.versionId}
          />
        ))}
      </div>

      {/* Selected Variant Summary */}
      {selectedVariant && (
        <Card className="border-primary/50 bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Check className="h-4 w-4 text-primary" />
              Selected Variant
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className={getApproachInfo(selectedVariant.approach).color}>
                {getApproachInfo(selectedVariant.approach).icon} {getApproachInfo(selectedVariant.approach).label}
              </Badge>
              <Badge variant="outline">{getFormatLabel(selectedVariant.format)}</Badge>
              <span className="text-xs text-muted-foreground">
                {selectedVariant.generatedText.length} characters
              </span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCopy(selectedVariant)}
                disabled={copiedId === selectedVariant.versionId}
              >
                {copiedId === selectedVariant.versionId ? (
                  <>
                    <Check className="h-4 w-4 mr-2 text-green-500" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy to clipboard
                  </>
                )}
              </Button>
              {onViewPost && (
                <Button size="sm" onClick={() => onViewPost(selectedVariant)}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View & refine
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Expanded View Dialog */}
      <Dialog open={!!expandedVariant} onOpenChange={() => setExpandedVariant(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          {expandedVariant && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <span className="mr-2">{getApproachInfo(expandedVariant.approach).icon}</span>
                  {getApproachInfo(expandedVariant.approach).label} Approach
                </DialogTitle>
              </DialogHeader>
              <ScrollArea className="max-h-[60vh]">
                <div className="space-y-4 p-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className={getApproachInfo(expandedVariant.approach).color}>
                      {getApproachInfo(expandedVariant.approach).label}
                    </Badge>
                    <Badge variant="outline">{getFormatLabel(expandedVariant.format)}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {expandedVariant.generatedText.length} characters
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {getApproachInfo(expandedVariant.approach).description}
                  </p>
                  <div className="bg-muted/50 rounded-md p-4 whitespace-pre-line text-sm">
                    {expandedVariant.generatedText}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => handleCopy(expandedVariant)}
                      disabled={copiedId === expandedVariant.versionId}
                    >
                      {copiedId === expandedVariant.versionId ? (
                        <>
                          <Check className="h-4 w-4 mr-2 text-green-500" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-2" />
                          Copy
                        </>
                      )}
                    </Button>
                    <Button onClick={() => {
                      onSelectVariant(expandedVariant);
                      setExpandedVariant(null);
                    }}>
                      <Check className="h-4 w-4 mr-2" />
                      Select this variant
                    </Button>
                  </div>
                </div>
              </ScrollArea>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface VariantDetailCardProps {
  variant: VariantData;
  index: number;
  isSelected: boolean;
  onSelect: (variant: VariantData) => void;
  onCopy: (variant: VariantData) => void;
  onViewPost?: (variant: VariantData) => void;
  onExpand: (variant: VariantData) => void;
  isCopied: boolean;
}

function VariantDetailCard({
  variant,
  index,
  isSelected,
  onSelect,
  onCopy,
  onViewPost,
  onExpand,
  isCopied,
}: VariantDetailCardProps) {
  const approachInfo = getApproachInfo(variant.approach);

  return (
    <Card
      className={cn(
        "group relative transition-all duration-200 cursor-pointer",
        isSelected
          ? "ring-2 ring-primary shadow-md bg-primary/5"
          : "hover:shadow-md hover:-translate-y-0.5"
      )}
      onClick={() => onSelect(variant)}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className={cn("text-xs font-medium", approachInfo.color)}>
                <span className="mr-1">{approachInfo.icon}</span>
                {approachInfo.label}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {getFormatLabel(variant.format)}
              </Badge>
            </div>
            <CardTitle className="text-base">Variant {index + 1}</CardTitle>
          </div>
          {isSelected && (
            <div className="flex items-center justify-center h-6 w-6 rounded-full bg-primary text-primary-foreground shrink-0">
              <Check className="h-4 w-4" />
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs text-muted-foreground">{approachInfo.description}</p>

        {/* Content Preview */}
        <div
          className="text-sm bg-muted/50 rounded-md p-3 max-h-40 overflow-y-auto whitespace-pre-line cursor-text"
          onClick={(e) => e.stopPropagation()}
        >
          {variant.generatedText}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
          <span>{variant.generatedText.length} chars</span>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2"
              onClick={(e) => {
                e.stopPropagation();
                onExpand(variant);
              }}
            >
              <Maximize2 className="h-3 w-3 mr-1" />
              Expand
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2"
              onClick={(e) => {
                e.stopPropagation();
                onCopy(variant);
              }}
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
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
