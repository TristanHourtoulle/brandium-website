"use client";

import { useState } from "react";
import { Loader2, Sparkles, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface IterationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (prompt: string) => Promise<void>;
  isLoading?: boolean;
  currentVersionNumber?: number;
}

// Suggested prompts for quick iteration
const SUGGESTED_PROMPTS = [
  { label: "Shorter", prompt: "Make it shorter and more concise" },
  { label: "Professional", prompt: "Make it more professional" },
  { label: "Casual", prompt: "Make it more casual and friendly" },
  { label: "Emojis", prompt: "Add relevant emojis" },
  { label: "Hashtags", prompt: "Add relevant hashtags" },
  { label: "Call-to-action", prompt: "Add a clear call-to-action" },
  { label: "Bullet points", prompt: "Use bullet points for clarity" },
  { label: "Questions", prompt: "Add engaging questions" },
];

export function IterationDialog({
  open,
  onOpenChange,
  onSubmit,
  isLoading = false,
  currentVersionNumber = 1,
}: IterationDialogProps) {
  const [prompt, setPrompt] = useState("");

  const handleSubmit = async () => {
    if (!prompt.trim() || isLoading) return;

    await onSubmit(prompt.trim());
    setPrompt("");
  };

  const handleSuggestedPrompt = (suggestedPrompt: string) => {
    setPrompt(suggestedPrompt);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && e.metaKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-primary" />
            Refine Your Post
          </DialogTitle>
          <DialogDescription>
            Describe how you&apos;d like to modify version {currentVersionNumber}.
            A new version will be created while preserving the original.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Suggested prompts */}
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">
              Quick suggestions
            </Label>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_PROMPTS.map((suggestion) => (
                <Badge
                  key={suggestion.label}
                  variant="outline"
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                  onClick={() => handleSuggestedPrompt(suggestion.prompt)}
                >
                  {suggestion.label}
                </Badge>
              ))}
            </div>
          </div>

          {/* Custom prompt input */}
          <div className="space-y-2">
            <Label htmlFor="iteration-prompt">Your refinement instructions</Label>
            <Textarea
              id="iteration-prompt"
              placeholder="e.g., Make it more engaging, add statistics, remove the hashtags..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={4}
              disabled={isLoading}
              className="resize-none"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Be specific for better results</span>
              <span>{prompt.length} / 500</span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!prompt.trim() || isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Create Version {currentVersionNumber + 1}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
