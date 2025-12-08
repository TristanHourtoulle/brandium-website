"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Zap,
  RefreshCw,
  Copy,
  Check,
  Sparkles,
  ArrowRight,
  Replace,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HookCardGrid } from "./hook-card";
import { useHooks } from "@/lib/hooks/use-hooks";
import * as iterationsApi from "@/lib/api/iterations";
import { ROUTES } from "@/config/constants";

interface HooksFromPostDialogProps {
  postId: string;
  postTitle?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Callback when the hook is replaced in the post */
  onHookReplaced?: () => void;
}

export function HooksFromPostDialog({
  postId,
  postTitle,
  open,
  onOpenChange,
  onHookReplaced,
}: HooksFromPostDialogProps) {
  const router = useRouter();
  const [variants, setVariants] = useState<number>(2);
  const [copied, setCopied] = useState<string | null>(null);
  const [isReplacing, setIsReplacing] = useState(false);

  const {
    hooks,
    isLoading,
    error,
    selectedHook,
    generateFromPost,
    regenerate,
    selectHook,
    clearHooks,
  } = useHooks({ showToasts: false });

  const handleGenerate = useCallback(async () => {
    await generateFromPost(postId, { variants });
  }, [generateFromPost, postId, variants]);

  const handleRegenerate = useCallback(async () => {
    await regenerate();
  }, [regenerate]);

  const handleCopy = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(text);
    toast.success("Hook copied to clipboard");
    setTimeout(() => setCopied(null), 2000);
  }, []);

  const handleUseHookForNewPost = useCallback(() => {
    if (!selectedHook) return;

    // Navigate to generation page with the selected hook
    const params = new URLSearchParams();
    params.set("hook", selectedHook.text);
    router.push(`${ROUTES.GENERATE}?${params.toString()}`);
    onOpenChange(false);
  }, [selectedHook, router, onOpenChange]);

  const handleReplaceHook = useCallback(async () => {
    if (!selectedHook) return;

    setIsReplacing(true);

    try {
      // Use the custom iteration type to replace the hook
      const feedback = `Replace the opening/hook of this post with the following new hook. Keep the rest of the content unchanged, but ensure a smooth transition from the new hook to the existing content. New hook to use:\n\n"${selectedHook.text}"`;

      await iterationsApi.iteratePostV2(postId, "custom", feedback);

      toast.success("Hook replaced successfully! A new version has been created.");

      // Call the callback to refresh the post data
      onHookReplaced?.();

      // Close the dialog
      clearHooks();
      onOpenChange(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to replace hook";
      toast.error(message);
    } finally {
      setIsReplacing(false);
    }
  }, [selectedHook, postId, onHookReplaced, clearHooks, onOpenChange]);

  const handleClose = useCallback(() => {
    clearHooks();
    onOpenChange(false);
  }, [clearHooks, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-yellow-100 dark:bg-yellow-900/30">
              <Zap className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
            </div>
            Generate Hooks from Post
          </DialogTitle>
          <DialogDescription>
            {postTitle
              ? `Generate engaging hook suggestions based on "${postTitle.slice(0, 50)}${postTitle.length > 50 ? "..." : ""}"`
              : "Generate engaging hook suggestions based on your post content"}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 py-2">
          {/* Generation options */}
          {hooks.length === 0 && !isLoading && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-muted/50 space-y-4">
                <div className="flex items-start gap-3">
                  <Sparkles className="h-5 w-5 text-primary mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Better Context, Better Hooks</p>
                    <p className="text-sm text-muted-foreground">
                      By generating hooks from your existing post, the AI has full context
                      of your content, tone, and message - resulting in more relevant and
                      engaging hook suggestions.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="variants">Variants per hook type</Label>
                <Select
                  value={variants.toString()}
                  onValueChange={(v) => setVariants(Number(v))}
                >
                  <SelectTrigger id="variants" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 variant (4 hooks total)</SelectItem>
                    <SelectItem value="2">2 variants (8 hooks total)</SelectItem>
                    <SelectItem value="3">3 variants (12 hooks total)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  More variants give you more options to choose from
                </p>
              </div>

              <Button onClick={handleGenerate} className="w-full" size="lg">
                <Zap className="h-4 w-4 mr-2" />
                Generate Hooks
              </Button>
            </div>
          )}

          {/* Loading state */}
          {isLoading && (
            <div className="space-y-4">
              <div className="flex items-center justify-center py-8">
                <div className="text-center space-y-3">
                  <div className="flex items-center justify-center">
                    <Zap className="h-8 w-8 text-yellow-500 animate-pulse" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Analyzing your post and generating hooks...
                  </p>
                </div>
              </div>
              <HookCardGrid hooks={[]} isLoading={true} compact />
            </div>
          )}

          {/* Error state */}
          {error && !isLoading && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Results */}
          {hooks.length > 0 && !isLoading && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {hooks.length} hooks generated - select one to use
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRegenerate}
                  disabled={isLoading || isReplacing}
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Regenerate
                </Button>
              </div>

              <HookCardGrid
                hooks={hooks}
                selectedHook={selectedHook}
                onSelect={selectHook}
                onCopy={handleCopy}
                compact
              />
            </div>
          )}
        </div>

        {/* Footer actions */}
        {hooks.length > 0 && !isLoading && (
          <>
            <Separator />
            <div className="flex items-center justify-between pt-2">
              <div className="text-sm text-muted-foreground">
                {selectedHook ? (
                  <span className="flex items-center gap-1">
                    <Check className="h-4 w-4 text-green-500" />
                    Hook selected
                  </span>
                ) : (
                  "Select a hook to continue"
                )}
              </div>
              <div className="flex items-center gap-2">
                {selectedHook && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCopy(selectedHook.text)}
                        >
                          {copied === selectedHook.text ? (
                            <>
                              <Check className="h-4 w-4 mr-1 text-green-500" />
                              Copied
                            </>
                          ) : (
                            <>
                              <Copy className="h-4 w-4 mr-1" />
                              Copy
                            </>
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Copy hook to clipboard</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        onClick={handleReplaceHook}
                        disabled={!selectedHook || isReplacing}
                      >
                        {isReplacing ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                            Replacing...
                          </>
                        ) : (
                          <>
                            <Replace className="h-4 w-4 mr-1" />
                            Replace Hook
                          </>
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Replace the hook in this post (creates new version)</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={handleUseHookForNewPost}
                        disabled={!selectedHook || isReplacing}
                      >
                        New Post
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Use this hook to generate a new post</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
