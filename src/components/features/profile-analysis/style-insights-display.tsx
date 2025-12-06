"use client";

import {
  MessageSquare,
  Hash,
  Smile,
  HelpCircle,
  Megaphone,
  FileText,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { StyleInsights } from "@/types";

interface StyleInsightsDisplayProps {
  insights: StyleInsights;
}

const usageToProgress: Record<string, number> = {
  none: 0,
  minimal: 25,
  low: 25,
  moderate: 50,
  high: 75,
  heavy: 100,
};

const lengthLabels: Record<string, string> = {
  short: "Short (< 100 words)",
  medium: "Medium (100-300 words)",
  long: "Long (300+ words)",
};

export function StyleInsightsDisplay({ insights }: StyleInsightsDisplayProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Style Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Average Length */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-muted-foreground">
              <MessageSquare className="h-3.5 w-3.5" />
              Average Length
            </span>
            <Badge variant="secondary">
              {lengthLabels[insights.averageLength] || insights.averageLength}
            </Badge>
          </div>
        </div>

        {/* Emoji Usage */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-muted-foreground">
              <Smile className="h-3.5 w-3.5" />
              Emoji Usage
            </span>
            <span className="capitalize">{insights.emojiUsage}</span>
          </div>
          <Progress value={usageToProgress[insights.emojiUsage] || 0} className="h-2" />
        </div>

        {/* Hashtag Usage */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-muted-foreground">
              <Hash className="h-3.5 w-3.5" />
              Hashtag Usage
            </span>
            <span className="capitalize">{insights.hashtagUsage}</span>
          </div>
          <Progress value={usageToProgress[insights.hashtagUsage] || 0} className="h-2" />
        </div>

        {/* Question Usage */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-muted-foreground">
              <HelpCircle className="h-3.5 w-3.5" />
              Question Usage
            </span>
            <span className="capitalize">{insights.questionUsage}</span>
          </div>
          <Progress value={usageToProgress[insights.questionUsage] || 0} className="h-2" />
        </div>

        {/* Call to Action Usage */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-muted-foreground">
              <Megaphone className="h-3.5 w-3.5" />
              Call to Action
            </span>
            <span className="capitalize">{insights.callToActionUsage}</span>
          </div>
          <Progress value={usageToProgress[insights.callToActionUsage] || 0} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
}
