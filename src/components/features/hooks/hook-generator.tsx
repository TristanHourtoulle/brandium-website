"use client";

import { useState, useCallback } from "react";
import { RefreshCw, Sparkles, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { useHooks } from "@/lib/hooks/use-hooks";
import { HookCardGrid } from "./hook-card";
import { validateRawIdea } from "@/lib/api/hooks";
import type { Hook } from "@/types";

interface HookGeneratorProps {
  /** Initial raw idea to generate hooks for */
  initialRawIdea?: string;
  /** Goal for the post (optional) */
  goal?: string;
  /** Profile ID to personalize hooks (optional) */
  profileId?: string;
  /** Called when a hook is selected */
  onHookSelected?: (hook: Hook) => void;
  /** Called when hooks are generated */
  onHooksGenerated?: (hooks: Hook[]) => void;
  /** Show the input form (set to false if providing rawIdea externally) */
  showForm?: boolean;
  /** Compact mode for embedding */
  compact?: boolean;
}

export function HookGenerator({
  initialRawIdea = "",
  goal,
  profileId,
  onHookSelected,
  onHooksGenerated,
  showForm = true,
  compact = false,
}: HookGeneratorProps) {
  const [rawIdea, setRawIdea] = useState(initialRawIdea);
  const [hookCount, setHookCount] = useState<string>("4");

  const {
    hooks,
    isLoading,
    error,
    selectedHook,
    hasHooks,
    generate,
    regenerate,
    selectHook,
    clearHooks,
  } = useHooks({ showToasts: false });

  const handleGenerate = useCallback(async () => {
    const validation = validateRawIdea(rawIdea);
    if (!validation.isValid) {
      toast.error(validation.error);
      return;
    }

    const result = await generate(rawIdea, {
      goal,
      profileId,
      count: parseInt(hookCount, 10),
    });

    if (result) {
      onHooksGenerated?.(result);
      toast.success(`Generated ${result.length} hook suggestions`);
    }
  }, [rawIdea, goal, profileId, hookCount, generate, onHooksGenerated]);

  const handleRegenerate = useCallback(async () => {
    const result = await regenerate();
    if (result) {
      onHooksGenerated?.(result);
      toast.success(`Regenerated ${result.length} hook suggestions`);
    }
  }, [regenerate, onHooksGenerated]);

  const handleSelectHook = useCallback(
    (hook: Hook) => {
      selectHook(hook);
      onHookSelected?.(hook);
    },
    [selectHook, onHookSelected]
  );

  const handleCopyHook = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Hook copied to clipboard");
  }, []);

  const charCount = rawIdea.length;
  const isValidLength = charCount >= 5 && charCount <= 500;

  return (
    <div className="space-y-6">
      {showForm && (
        <Card>
          <CardHeader className={compact ? "pb-2" : undefined}>
            <CardTitle className={compact ? "text-lg" : undefined}>
              Generate Hooks
            </CardTitle>
            <CardDescription>
              Enter your post idea and we&apos;ll generate 4 different hook styles
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="rawIdea">Post Idea</Label>
              <Textarea
                id="rawIdea"
                placeholder="What do you want to write about? (e.g., 'Share tips about remote work productivity')"
                value={rawIdea}
                onChange={(e) => setRawIdea(e.target.value)}
                rows={3}
                className="resize-none"
              />
              <div className="flex items-center justify-between text-xs">
                <span
                  className={
                    charCount > 500
                      ? "text-destructive"
                      : charCount < 5
                        ? "text-muted-foreground"
                        : "text-muted-foreground"
                  }
                >
                  {charCount}/500 characters
                </span>
                {!isValidLength && charCount > 0 && (
                  <span className="text-destructive">
                    {charCount < 5
                      ? "At least 5 characters required"
                      : "Maximum 500 characters"}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-end gap-4">
              <div className="space-y-2">
                <Label htmlFor="hookCount">Number of Hooks</Label>
                <Select value={hookCount} onValueChange={setHookCount}>
                  <SelectTrigger id="hookCount" className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[2, 3, 4, 5, 6].map((num) => (
                      <SelectItem key={num} value={String(num)}>
                        {num}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleGenerate}
                disabled={isLoading || !isValidLength}
                className="flex-1 sm:flex-none"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Hooks
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {hasHooks && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              Hook Suggestions
              {selectedHook && (
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  (1 selected)
                </span>
              )}
            </h3>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRegenerate}
                disabled={isLoading}
              >
                <RefreshCw
                  className={`h-4 w-4 mr-1 ${isLoading ? "animate-spin" : ""}`}
                />
                Regenerate
              </Button>
              <Button variant="ghost" size="sm" onClick={clearHooks}>
                Clear
              </Button>
            </div>
          </div>

          <HookCardGrid
            hooks={hooks}
            selectedHook={selectedHook}
            onSelect={handleSelectHook}
            onCopy={handleCopyHook}
            isLoading={isLoading}
            compact={compact}
          />

          {selectedHook && (
            <div className="bg-muted/50 rounded-lg p-4 border">
              <p className="text-sm text-muted-foreground mb-2">
                Selected hook will be used as your post opening:
              </p>
              <p className="font-medium">&ldquo;{selectedHook.text}&rdquo;</p>
            </div>
          )}
        </div>
      )}

      {!hasHooks && !showForm && !isLoading && (
        <div className="text-center py-8 text-muted-foreground">
          <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No hooks generated yet</p>
          {initialRawIdea && (
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={handleGenerate}
            >
              Generate Hooks
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

// Compact version for embedding in other components
export function HookGeneratorCompact({
  rawIdea,
  goal,
  profileId,
  onHookSelected,
}: {
  rawIdea: string;
  goal?: string;
  profileId?: string;
  onHookSelected?: (hook: Hook) => void;
}) {
  return (
    <HookGenerator
      initialRawIdea={rawIdea}
      goal={goal}
      profileId={profileId}
      onHookSelected={onHookSelected}
      showForm={false}
      compact
    />
  );
}
