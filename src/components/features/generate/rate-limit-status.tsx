"use client";

import { AlertCircle, Clock, Zap } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  formatCountdown,
  calculateRateLimitPercentage,
} from "@/lib/utils/format";
import type { RateLimitStatus } from "@/types";

interface RateLimitStatusProps {
  status: RateLimitStatus | null;
  isLoading?: boolean;
}

export function RateLimitStatusDisplay({
  status,
  isLoading = false,
}: RateLimitStatusProps) {
  if (isLoading || !status) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Zap className="h-4 w-4" />
        <span>Loading...</span>
      </div>
    );
  }

  const percentage = calculateRateLimitPercentage(
    status.remaining,
    status.total
  );
  const isLimited = status.remaining <= 0;
  const isLow = percentage <= 20 && !isLimited;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-3">
            {isLimited ? (
              <AlertCircle className="h-4 w-4 text-destructive" />
            ) : isLow ? (
              <Clock className="h-4 w-4 text-yellow-500" />
            ) : (
              <Zap className="h-4 w-4 text-primary" />
            )}

            <div className="flex items-center gap-2">
              <Progress
                value={percentage}
                className="h-2 w-24"
              />
              <span
                className={`text-sm font-medium ${
                  isLimited
                    ? "text-destructive"
                    : isLow
                    ? "text-yellow-500"
                    : "text-muted-foreground"
                }`}
              >
                {status.remaining}/{status.total}
              </span>
            </div>

            {isLimited && (
              <span className="text-sm text-destructive">
                Resets in {formatCountdown(status.resetAt)}
              </span>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>
            {isLimited
              ? `Rate limit exceeded. Resets in ${formatCountdown(status.resetAt)}`
              : `${status.remaining} generations remaining out of ${status.total}`}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
