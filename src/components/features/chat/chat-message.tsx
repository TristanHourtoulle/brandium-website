"use client";

import { cn } from "@/lib/utils/cn";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bot, User, Copy, Check, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { copyToClipboard } from "@/lib/utils/format";
import { toast } from "sonner";

export type MessageRole = "user" | "assistant" | "system";

export interface ChatMessageProps {
  role: MessageRole;
  content: string;
  timestamp?: Date;
  isLoading?: boolean;
  showActions?: boolean;
  onCopy?: () => void;
  onRegenerate?: () => void;
  isRegenerating?: boolean;
  className?: string;
}

export function ChatMessage({
  role,
  content,
  timestamp,
  isLoading = false,
  showActions = false,
  onRegenerate,
  isRegenerating = false,
  className,
}: ChatMessageProps) {
  const [copied, setCopied] = useState(false);
  const isUser = role === "user";
  const isAssistant = role === "assistant";

  const handleCopy = async () => {
    const success = await copyToClipboard(content);
    if (success) {
      setCopied(true);
      toast.success("Copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } else {
      toast.error("Failed to copy");
    }
  };

  if (role === "system") {
    return (
      <div className={cn("flex justify-center py-2", className)}>
        <span className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
          {content}
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex gap-3 py-4",
        isUser ? "flex-row-reverse" : "flex-row",
        className
      )}
    >
      {/* Avatar */}
      <Avatar className={cn(
        "h-8 w-8 shrink-0",
        isUser ? "bg-blue-600" : "bg-muted"
      )}>
        <AvatarFallback className={cn(
          isUser ? "bg-blue-600 text-white" : "bg-muted"
        )}>
          {isUser ? (
            <User className="h-4 w-4" />
          ) : (
            <Bot className="h-4 w-4 text-blue-600" />
          )}
        </AvatarFallback>
      </Avatar>

      {/* Message bubble */}
      <div
        className={cn(
          "flex flex-col max-w-[80%] gap-1",
          isUser ? "items-end" : "items-start"
        )}
      >
        <div
          className={cn(
            "rounded-2xl px-4 py-3 text-sm",
            isUser
              ? "bg-blue-600 text-white rounded-br-md"
              : "bg-muted rounded-bl-md",
            isLoading && "animate-pulse"
          )}
        >
          {isLoading ? (
            <div className="flex items-center gap-1">
              <span className="h-2 w-2 bg-current rounded-full animate-bounce [animation-delay:-0.3s]" />
              <span className="h-2 w-2 bg-current rounded-full animate-bounce [animation-delay:-0.15s]" />
              <span className="h-2 w-2 bg-current rounded-full animate-bounce" />
            </div>
          ) : (
            <p className="whitespace-pre-wrap leading-relaxed">{content}</p>
          )}
        </div>

        {/* Actions for assistant messages */}
        {isAssistant && showActions && !isLoading && (
          <div className="flex items-center gap-1 mt-1">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleCopy}
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-green-500" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
              <span className="sr-only">Copy message</span>
            </Button>
            {onRegenerate && (
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={onRegenerate}
                disabled={isRegenerating}
                className="h-7 w-7 text-muted-foreground hover:text-foreground"
              >
                <RefreshCw className={cn(
                  "h-3.5 w-3.5",
                  isRegenerating && "animate-spin"
                )} />
                <span className="sr-only">Regenerate</span>
              </Button>
            )}
          </div>
        )}

        {/* Timestamp */}
        {timestamp && (
          <span className="text-[10px] text-muted-foreground px-1">
            {timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
        )}
      </div>
    </div>
  );
}
