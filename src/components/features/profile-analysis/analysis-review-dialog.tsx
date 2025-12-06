"use client";

import { useState } from "react";
import { Loader2, CheckCircle2, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { StyleInsightsDisplay } from "./style-insights-display";
import type { AnalysisResult, ApplyAnalysisDto } from "@/types";

interface AnalysisReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  analysisResult: AnalysisResult | null;
  onApply: (data: ApplyAnalysisDto) => Promise<void>;
  isApplying?: boolean;
}

export function AnalysisReviewDialog({
  open,
  onOpenChange,
  analysisResult,
  onApply,
  isApplying = false,
}: AnalysisReviewDialogProps) {
  const [selectedToneTags, setSelectedToneTags] = useState<string[]>([]);
  const [selectedDoRules, setSelectedDoRules] = useState<string[]>([]);
  const [selectedDontRules, setSelectedDontRules] = useState<string[]>([]);
  const [initialized, setInitialized] = useState(false);

  // Initialize selections when dialog opens with new results
  if (analysisResult && !initialized) {
    setSelectedToneTags(analysisResult.suggestions.toneTags);
    setSelectedDoRules(analysisResult.suggestions.doRules);
    setSelectedDontRules(analysisResult.suggestions.dontRules);
    setInitialized(true);
  }

  const handleClose = () => {
    setInitialized(false);
    onOpenChange(false);
  };

  const toggleToneTag = (tag: string) => {
    setSelectedToneTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const toggleDoRule = (rule: string) => {
    setSelectedDoRules((prev) =>
      prev.includes(rule) ? prev.filter((r) => r !== rule) : [...prev, rule]
    );
  };

  const toggleDontRule = (rule: string) => {
    setSelectedDontRules((prev) =>
      prev.includes(rule) ? prev.filter((r) => r !== rule) : [...prev, rule]
    );
  };

  const handleApply = async () => {
    await onApply({
      toneTags: selectedToneTags,
      doRules: selectedDoRules,
      dontRules: selectedDontRules,
    });
    setInitialized(false);
  };

  if (!analysisResult) return null;

  const confidencePercent = Math.round(analysisResult.confidence * 100);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Style Analysis Results
          </DialogTitle>
          <DialogDescription>
            Based on {analysisResult.totalPostsAnalyzed} posts analyzed. Click on
            items to select/deselect before applying to your profile.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Confidence Score */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Analysis Confidence</span>
              <span className="font-medium">{confidencePercent}%</span>
            </div>
            <Progress value={confidencePercent} className="h-2" />
          </div>

          {/* Tone Tags */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Detected Tone & Style</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {analysisResult.suggestions.toneTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant={selectedToneTags.includes(tag) ? "default" : "outline"}
                    className="cursor-pointer capitalize transition-colors"
                    onClick={() => toggleToneTag(tag)}
                  >
                    {selectedToneTags.includes(tag) && (
                      <CheckCircle2 className="mr-1 h-3 w-3" />
                    )}
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Do Rules */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-green-600">
                Recommended Do&apos;s
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {analysisResult.suggestions.doRules.map((rule, index) => (
                  <li
                    key={index}
                    onClick={() => toggleDoRule(rule)}
                    className={`flex items-start gap-2 p-2 rounded-md cursor-pointer transition-colors ${
                      selectedDoRules.includes(rule)
                        ? "bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900"
                        : "bg-muted/50 opacity-60"
                    }`}
                  >
                    {selectedDoRules.includes(rule) ? (
                      <CheckCircle2 className="h-4 w-4 mt-0.5 text-green-600 shrink-0" />
                    ) : (
                      <X className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                    )}
                    <span className="text-sm">{rule}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Don't Rules */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-red-600">
                Recommended Don&apos;ts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {analysisResult.suggestions.dontRules.map((rule, index) => (
                  <li
                    key={index}
                    onClick={() => toggleDontRule(rule)}
                    className={`flex items-start gap-2 p-2 rounded-md cursor-pointer transition-colors ${
                      selectedDontRules.includes(rule)
                        ? "bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900"
                        : "bg-muted/50 opacity-60"
                    }`}
                  >
                    {selectedDontRules.includes(rule) ? (
                      <CheckCircle2 className="h-4 w-4 mt-0.5 text-red-600 shrink-0" />
                    ) : (
                      <X className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                    )}
                    <span className="text-sm">{rule}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Style Insights */}
          <StyleInsightsDisplay insights={analysisResult.suggestions.styleInsights} />
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isApplying}
          >
            Cancel
          </Button>
          <Button
            onClick={handleApply}
            disabled={
              isApplying ||
              (selectedToneTags.length === 0 &&
                selectedDoRules.length === 0 &&
                selectedDontRules.length === 0)
            }
          >
            {isApplying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Apply to Profile
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
