"use client";

import { memo, useMemo } from "react";
import { Copy, Check, Eye, EyeOff } from "lucide-react";
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
import { toast } from "sonner";
import { useState } from "react";

interface TemplatePreviewProps {
  content: string;
  variables?: Record<string, string>;
  title?: string;
  description?: string;
  showVariableHighlights?: boolean;
  className?: string;
  onCopy?: (content: string) => void;
  isLoading?: boolean;
}

function TemplatePreviewComponent({
  content,
  variables = {},
  title = "Preview",
  description,
  showVariableHighlights = true,
  className,
  onCopy,
  isLoading = false,
}: TemplatePreviewProps) {
  const [copied, setCopied] = useState(false);
  const [showHighlights, setShowHighlights] = useState(showVariableHighlights);

  // Render content with variable substitution
  const renderedContent = useMemo(() => {
    let rendered = content;

    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, "g");
      if (showHighlights && value) {
        // Highlight substituted values
        rendered = rendered.replace(
          regex,
          `<mark class="bg-primary/20 text-primary px-0.5 rounded">${value}</mark>`
        );
      } else {
        rendered = rendered.replace(regex, value || `{{${key}}}`);
      }
    }

    // Highlight remaining unsubstituted variables
    if (showHighlights) {
      rendered = rendered.replace(
        /\{\{(\w+)\}\}/g,
        '<span class="bg-orange-100 text-orange-600 px-0.5 rounded font-mono text-sm">{{$1}}</span>'
      );
    }

    return rendered;
  }, [content, variables, showHighlights]);

  // Count remaining unsubstituted variables
  const remainingVariables = useMemo(() => {
    const matches = content.match(/\{\{(\w+)\}\}/g) || [];
    return matches.filter((match) => {
      const varName = match.slice(2, -2);
      return !variables[varName];
    }).length;
  }, [content, variables]);

  const handleCopy = async () => {
    // Get plain text without HTML highlights
    let plainContent = content;
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, "g");
      plainContent = plainContent.replace(regex, value || `{{${key}}}`);
    }

    try {
      await navigator.clipboard.writeText(plainContent);
      setCopied(true);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
      onCopy?.(plainContent);
    } catch {
      toast.error("Failed to copy");
    }
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <Skeleton className="h-5 w-24" />
        </CardHeader>
        <CardContent className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("flex flex-col", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">{title}</CardTitle>
            {description && (
              <CardDescription className="text-xs mt-1">
                {description}
              </CardDescription>
            )}
          </div>
          <div className="flex items-center gap-1">
            {remainingVariables > 0 && (
              <Badge variant="outline" className="text-xs text-orange-600 border-orange-300">
                {remainingVariables} variable{remainingVariables !== 1 ? "s" : ""} left
              </Badge>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setShowHighlights(!showHighlights)}
              title={showHighlights ? "Hide highlights" : "Show highlights"}
            >
              {showHighlights ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleCopy}
              disabled={copied}
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <div
          className="prose prose-sm max-w-none whitespace-pre-wrap text-sm leading-relaxed"
          dangerouslySetInnerHTML={{ __html: renderedContent }}
        />
      </CardContent>
    </Card>
  );
}

export const TemplatePreview = memo(TemplatePreviewComponent);

// Compact inline preview
export function TemplatePreviewInline({
  content,
  variables = {},
  maxLength = 200,
  className,
}: {
  content: string;
  variables?: Record<string, string>;
  maxLength?: number;
  className?: string;
}) {
  const renderedContent = useMemo(() => {
    let rendered = content;

    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, "g");
      rendered = rendered.replace(regex, value || `{{${key}}}`);
    }

    if (rendered.length > maxLength) {
      rendered = rendered.slice(0, maxLength) + "...";
    }

    return rendered;
  }, [content, variables, maxLength]);

  return (
    <p className={cn("text-sm text-muted-foreground whitespace-pre-wrap", className)}>
      {renderedContent}
    </p>
  );
}
