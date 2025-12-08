"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils/cn";
import { Progress } from "@/components/ui/progress";
import { Loader2 } from "lucide-react";

interface LoadingProgressProps {
  /** Whether the loading is active */
  isLoading: boolean;
  /** Estimated duration in milliseconds (default: 5000ms) */
  estimatedDuration?: number;
  /** Text to display during loading */
  loadingText?: string;
  /** Show the percentage */
  showPercentage?: boolean;
  /** Additional class names */
  className?: string;
}

/**
 * A progress indicator for long-running operations like LLM generation
 * Shows an estimated progress bar that fills over time
 */
export function LoadingProgress({
  isLoading,
  estimatedDuration = 5000,
  loadingText = "Generating...",
  showPercentage = false,
  className,
}: LoadingProgressProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isLoading) {
      setProgress(0);
      return;
    }

    // Start progress animation
    setProgress(10);

    // Calculate interval for smooth animation
    const steps = 90; // 10% to 100%
    const intervalTime = estimatedDuration / steps;
    let currentStep = 0;

    const interval = setInterval(() => {
      currentStep++;
      // Ease out - slow down as we approach 95%
      const easedProgress = 10 + (85 * (1 - Math.pow(1 - currentStep / steps, 3)));
      setProgress(Math.min(easedProgress, 95));

      if (currentStep >= steps) {
        clearInterval(interval);
      }
    }, intervalTime);

    return () => {
      clearInterval(interval);
    };
  }, [isLoading, estimatedDuration]);

  // Complete the progress when loading finishes
  useEffect(() => {
    if (!isLoading && progress > 0) {
      setProgress(100);
      const timer = setTimeout(() => setProgress(0), 500);
      return () => clearTimeout(timer);
    }
  }, [isLoading, progress]);

  if (!isLoading && progress === 0) {
    return null;
  }

  return (
    <div
      className={cn("space-y-2", className)}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progress)}
      aria-label={loadingText}
    >
      <div className="flex items-center justify-between text-sm">
        <span className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          {loadingText}
        </span>
        {showPercentage && (
          <span className="text-muted-foreground font-mono">
            {Math.round(progress)}%
          </span>
        )}
      </div>
      <Progress value={progress} className="h-2" />
    </div>
  );
}

/**
 * A simpler inline loading spinner with text
 */
export function InlineLoader({
  text = "Loading...",
  className,
}: {
  text?: string;
  className?: string;
}) {
  return (
    <span
      className={cn("inline-flex items-center gap-2 text-muted-foreground", className)}
      role="status"
      aria-live="polite"
    >
      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      <span>{text}</span>
    </span>
  );
}

/**
 * Full page loading overlay
 */
export function LoadingOverlay({
  text = "Loading...",
  className,
}: {
  text?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm",
        className
      )}
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden="true" />
        <p className="text-sm text-muted-foreground">{text}</p>
      </div>
    </div>
  );
}
