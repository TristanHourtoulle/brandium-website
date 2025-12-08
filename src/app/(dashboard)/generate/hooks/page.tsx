"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight, Lightbulb } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HookGenerator } from "@/components/features/hooks";
import { ROUTES } from "@/config/constants";
import type { Hook } from "@/types";

export default function HooksGeneratePage() {
  const router = useRouter();
  const [selectedHook, setSelectedHook] = useState<Hook | null>(null);
  const [generatedHooks, setGeneratedHooks] = useState<Hook[]>([]);

  const handleHookSelected = useCallback((hook: Hook) => {
    setSelectedHook(hook);
  }, []);

  const handleHooksGenerated = useCallback((hooks: Hook[]) => {
    setGeneratedHooks(hooks);
    setSelectedHook(null);
  }, []);

  const handleUseHook = useCallback(() => {
    if (!selectedHook) {
      toast.error("Please select a hook first");
      return;
    }

    // Navigate to generate page with the hook text as the raw idea
    const params = new URLSearchParams({
      hook: selectedHook.text,
    });
    router.push(`${ROUTES.GENERATE}?${params.toString()}`);
  }, [selectedHook, router]);

  const handleCopyHook = useCallback(() => {
    if (!selectedHook) return;
    navigator.clipboard.writeText(selectedHook.text);
    toast.success("Hook copied to clipboard");
  }, [selectedHook]);

  return (
    <div className="container max-w-4xl mx-auto py-6 px-4 md:py-8 space-y-6">
      {/* Page Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Hook Generator</h1>
            <p className="text-muted-foreground">
              Create attention-grabbing hooks for your social media posts
            </p>
          </div>
        </div>
      </div>

      {/* Info Card */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-blue-200/50 dark:border-blue-800/50">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <CardTitle className="text-sm font-medium text-blue-800 dark:text-blue-300">
              Why Hooks Matter
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-sm text-blue-700/80 dark:text-blue-300/80">
            The first line of your post determines whether people will keep reading.
            A great hook can increase engagement by up to 300%. We&apos;ll generate 4 different
            styles: questions, statistics, stories, and bold opinions.
          </p>
        </CardContent>
      </Card>

      {/* Hook Generator */}
      <HookGenerator
        onHookSelected={handleHookSelected}
        onHooksGenerated={handleHooksGenerated}
      />

      {/* Action Card - shown when a hook is selected */}
      {selectedHook && (
        <Card className="border-primary/50 bg-primary/5 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Selected Hook</CardTitle>
              <Badge variant="secondary" className="capitalize">
                {selectedHook.type.replace("_", " ")}
              </Badge>
            </div>
            <CardDescription>
              Use this hook to start your post
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <blockquote className="border-l-4 border-primary pl-4 italic text-foreground/90">
              &ldquo;{selectedHook.text}&rdquo;
            </blockquote>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handleUseHook}
                className="flex-1 sm:flex-none"
              >
                Use Hook to Generate Post
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                onClick={handleCopyHook}
              >
                Copy Hook
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Card - shown when hooks are generated */}
      {generatedHooks.length > 0 && (
        <Card className="bg-muted/30">
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-primary">{generatedHooks.length}</p>
                <p className="text-xs text-muted-foreground">Hooks Generated</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {Math.max(...generatedHooks.map(h => h.estimatedEngagement))}
                </p>
                <p className="text-xs text-muted-foreground">Highest Engagement</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">
                  {generatedHooks.filter(h => h.type === "question").length}
                </p>
                <p className="text-xs text-muted-foreground">Questions</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-600">
                  {generatedHooks.filter(h => h.type === "story").length}
                </p>
                <p className="text-xs text-muted-foreground">Stories</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
