"use client";

import { memo } from "react";
import {
  Copy,
  Edit,
  Trash2,
  MoreHorizontal,
  Users,
  Lock,
  Globe,
  Sparkles,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils/cn";
import type { Template } from "@/types";
import {
  getTemplateCategoryInfo,
  formatUsageCount,
  canEditTemplate,
  canDuplicateTemplate,
} from "@/lib/api/templates";

interface TemplateCardProps {
  template: Template;
  userId?: string;
  onSelect?: (template: Template) => void;
  onEdit?: (template: Template) => void;
  onDuplicate?: (template: Template) => void;
  onDelete?: (template: Template) => void;
  onUse?: (template: Template) => void;
  isSelected?: boolean;
  compact?: boolean;
}

function TemplateCardComponent({
  template,
  userId,
  onSelect,
  onEdit,
  onDuplicate,
  onDelete,
  onUse,
  isSelected = false,
  compact = false,
}: TemplateCardProps) {
  const categoryInfo = getTemplateCategoryInfo(template.category);
  const canEdit = userId ? canEditTemplate(template, userId) : false;
  const canDuplicate = canDuplicateTemplate(template, userId);

  const handleSelect = () => {
    onSelect?.(template);
  };

  const handleUse = (e: React.MouseEvent) => {
    e.stopPropagation();
    onUse?.(template);
  };

  // Get first variable names for preview
  const variablePreview = template.variables.slice(0, 3).map((v) => v.name);

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
      aria-label={template.name}
      aria-selected={isSelected}
    >
      <CardHeader className={cn("pb-2", compact && "py-3")}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge
                variant="secondary"
                className={cn(
                  "text-xs font-medium shrink-0",
                  categoryInfo.bgColor,
                  categoryInfo.color
                )}
              >
                {categoryInfo.label}
              </Badge>
              {template.isSystem && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Sparkles className="h-3.5 w-3.5 text-yellow-500" />
                    </TooltipTrigger>
                    <TooltipContent>System template</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              {template.isPublic ? (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Globe className="h-3.5 w-3.5 text-green-500" />
                    </TooltipTrigger>
                    <TooltipContent>Public template</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                !template.isSystem && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Lock className="h-3.5 w-3.5 text-gray-400" />
                      </TooltipTrigger>
                      <TooltipContent>Private template</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )
              )}
            </div>
            <CardTitle className={cn("line-clamp-1", compact ? "text-base" : "text-lg")}>
              {template.name}
            </CardTitle>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onUse && (
                <DropdownMenuItem onClick={() => onUse(template)}>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Use template
                </DropdownMenuItem>
              )}
              {canEdit && onEdit && (
                <DropdownMenuItem onClick={() => onEdit(template)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
              )}
              {canDuplicate && onDuplicate && (
                <DropdownMenuItem onClick={() => onDuplicate(template)}>
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicate
                </DropdownMenuItem>
              )}
              {canEdit && onDelete && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onDelete(template)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className={cn("space-y-3", compact && "pb-3")}>
        {template.description && (
          <CardDescription
            className={cn("line-clamp-2", compact && "line-clamp-1")}
          >
            {template.description}
          </CardDescription>
        )}

        {/* Variable tags */}
        {variablePreview.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {variablePreview.map((varName) => (
              <Badge
                key={varName}
                variant="outline"
                className="text-xs font-mono"
              >
                {`{{${varName}}}`}
              </Badge>
            ))}
            {template.variables.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{template.variables.length - 3} more
              </Badge>
            )}
          </div>
        )}

        {/* Footer stats */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
          <div className="flex items-center gap-3">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger className="flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" />
                  {formatUsageCount(template.usageCount)}
                </TooltipTrigger>
                <TooltipContent>
                  Used {template.usageCount} times
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {onUse && (
            <Button
              variant="default"
              size="sm"
              className="h-7 px-3 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={handleUse}
            >
              Use
            </Button>
          )}
        </div>

        {/* Tags */}
        {!compact && template.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1">
            {template.tags.slice(0, 3).map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="text-xs bg-muted/50"
              >
                #{tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export const TemplateCard = memo(TemplateCardComponent);

// Loading skeleton
export function TemplateCardSkeleton({ compact = false }: { compact?: boolean }) {
  return (
    <Card className="group relative">
      <CardHeader className={cn("pb-2", compact && "py-3")}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-3.5 w-3.5 rounded" />
            </div>
            <Skeleton className="h-5 w-3/4" />
          </div>
        </div>
      </CardHeader>
      <CardContent className={cn("space-y-3", compact && "pb-3")}>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="flex gap-1">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <div className="flex items-center justify-between pt-1">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-7 w-14" />
        </div>
      </CardContent>
    </Card>
  );
}

// Grid layout for multiple template cards
export function TemplateCardGrid({
  templates,
  userId,
  selectedTemplate,
  onSelect,
  onEdit,
  onDuplicate,
  onDelete,
  onUse,
  isLoading = false,
  compact = false,
  emptyMessage = "No templates found",
}: {
  templates: Template[];
  userId?: string;
  selectedTemplate?: Template | null;
  onSelect?: (template: Template) => void;
  onEdit?: (template: Template) => void;
  onDuplicate?: (template: Template) => void;
  onDelete?: (template: Template) => void;
  onUse?: (template: Template) => void;
  isLoading?: boolean;
  compact?: boolean;
  emptyMessage?: string;
}) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <TemplateCardSkeleton key={i} compact={compact} />
        ))}
      </div>
    );
  }

  if (templates.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {templates.map((template) => (
        <TemplateCard
          key={template.id}
          template={template}
          userId={userId}
          isSelected={selectedTemplate?.id === template.id}
          onSelect={onSelect}
          onEdit={onEdit}
          onDuplicate={onDuplicate}
          onDelete={onDelete}
          onUse={onUse}
          compact={compact}
        />
      ))}
    </div>
  );
}
