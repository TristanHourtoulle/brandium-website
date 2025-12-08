"use client";

import { useCallback } from "react";
import { Save, Loader2, X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils/cn";
import type { Template, TemplateCategory } from "@/types";
import { useTemplateEditor } from "@/lib/hooks/use-template-editor";
import { VariableList } from "./variable-input";
import { TemplatePreview } from "./template-preview";
import { getAllTemplateCategories, getTemplateCategoryInfo } from "@/lib/api/templates";

interface TemplateEditorProps {
  templateId?: string | null;
  onSave?: (template: Template) => void;
  onCancel?: () => void;
  className?: string;
}

export function TemplateEditor({
  templateId,
  onSave,
  onCancel,
  className,
}: TemplateEditorProps) {
  const {
    formData,
    isDirty,
    isLoading,
    isSaving,
    error,
    preview,
    parsedVariables,
    validationErrors,
    updateField,
    updateContent,
    addVariable,
    updateVariable,
    removeVariable,
    syncVariables,
    updateExampleVariable,
    addTag,
    removeTag,
    save,
    isValid,
    isEditMode,
  } = useTemplateEditor({ templateId });

  const handleSave = useCallback(async () => {
    const template = await save();
    if (template) {
      onSave?.(template);
    }
  }, [save, onSave]);

  const handleTagKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" || e.key === ",") {
        e.preventDefault();
        const input = e.currentTarget;
        const tag = input.value.trim().toLowerCase();
        if (tag && !formData.tags.includes(tag)) {
          addTag(tag);
          input.value = "";
        }
      }
    },
    [formData.tags, addTag]
  );

  if (isLoading) {
    return <TemplateEditorSkeleton />;
  }

  return (
    <div className={cn("grid gap-6 lg:grid-cols-2", className)}>
      {/* Left column - Form */}
      <div className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Template Details</CardTitle>
            <CardDescription>
              Basic information about your template
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => updateField("name", e.target.value)}
                placeholder="My awesome template"
                className={cn(validationErrors.name && "border-destructive")}
              />
              {validationErrors.name && (
                <p className="text-xs text-destructive">{validationErrors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => updateField("description", e.target.value)}
                placeholder="What is this template for?"
                rows={2}
                className="resize-none"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    updateField("category", value as TemplateCategory)
                  }
                >
                  <SelectTrigger id="category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {getAllTemplateCategories().map((cat) => {
                      const info = getTemplateCategoryInfo(cat);
                      return (
                        <SelectItem key={cat} value={cat}>
                          <div className="flex items-center gap-2">
                            <span
                              className={cn(
                                "w-2 h-2 rounded-full",
                                info.bgColor.replace("bg-", "bg-")
                              )}
                            />
                            {info.label}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Visibility</Label>
                <div className="flex items-center gap-2 pt-2">
                  <Switch
                    id="isPublic"
                    checked={formData.isPublic}
                    onCheckedChange={(checked) => updateField("isPublic", checked)}
                  />
                  <Label htmlFor="isPublic" className="cursor-pointer font-normal">
                    {formData.isPublic ? "Public" : "Private"}
                  </Label>
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-1 mb-2">
                {formData.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="pl-2 pr-1 py-0.5"
                  >
                    #{tag}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 ml-1 hover:bg-transparent"
                      onClick={() => removeTag(tag)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
              <Input
                placeholder="Add tag and press Enter"
                onKeyDown={handleTagKeyDown}
              />
            </div>
          </CardContent>
        </Card>

        {/* Content */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Template Content</CardTitle>
            <CardDescription>
              Use {`{{variableName}}`} syntax for dynamic content
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="content">
                Content <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => updateContent(e.target.value)}
                placeholder={`Example:\n\nHey everyone! 👋\n\nI just {{action}} and wanted to share {{insight}}.\n\nHere's what I learned:\n1. {{lesson1}}\n2. {{lesson2}}\n\n{{callToAction}}`}
                rows={10}
                className={cn(
                  "font-mono text-sm resize-none",
                  validationErrors.content && "border-destructive"
                )}
              />
              {validationErrors.content && (
                <p className="text-xs text-destructive">{validationErrors.content}</p>
              )}
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{formData.content.length} characters</span>
                <span>{parsedVariables.length} variables found</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Variables */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Variables</CardTitle>
            <CardDescription>
              Define and configure your template variables
            </CardDescription>
          </CardHeader>
          <CardContent>
            <VariableList
              variables={formData.variables}
              parsedVariables={parsedVariables}
              onChange={updateVariable}
              onAdd={addVariable}
              onRemove={removeVariable}
              onSync={syncVariables}
            />
            {validationErrors.variables && (
              <p className="text-xs text-destructive mt-2">
                {validationErrors.variables}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Right column - Preview */}
      <div className="space-y-6">
        <div className="sticky top-6">
          {/* Live Preview */}
          <TemplatePreview
            content={formData.content}
            variables={formData.exampleVariables}
            title="Live Preview"
            description="Fill in example values to see how your template will look"
            className="min-h-[200px]"
          />

          {/* Example Values */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Example Values</CardTitle>
              <CardDescription>
                Provide example values to preview your template
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {parsedVariables.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No variables found in your template content yet.
                </p>
              ) : (
                parsedVariables.map((varName) => (
                  <div key={varName} className="space-y-1">
                    <Label htmlFor={`example-${varName}`} className="text-sm font-mono">
                      {varName}
                    </Label>
                    <Input
                      id={`example-${varName}`}
                      value={formData.exampleVariables[varName] ?? ""}
                      onChange={(e) => updateExampleVariable(varName, e.target.value)}
                      placeholder={`Example ${varName}`}
                    />
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 mt-6">
            {onCancel && (
              <Button variant="outline" onClick={onCancel} disabled={isSaving}>
                Cancel
              </Button>
            )}
            <Button
              onClick={handleSave}
              disabled={!isValid || isSaving || (!isDirty && isEditMode)}
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {isEditMode ? "Update Template" : "Create Template"}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Loading skeleton
function TemplateEditorSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-20 w-full" />
            <div className="grid gap-4 sm:grid-cols-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-48 w-full" />
          </CardContent>
        </Card>
      </div>
      <div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-24" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-48 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
