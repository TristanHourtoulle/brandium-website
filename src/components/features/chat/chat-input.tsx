"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2, Sparkles } from "lucide-react";

interface ChatInputProps {
  onSubmit: (message: string) => void;
  placeholder?: string;
  disabled?: boolean;
  isLoading?: boolean;
  showSparkles?: boolean;
  className?: string;
  minRows?: number;
  maxRows?: number;
  defaultValue?: string;
}

export function ChatInput({
  onSubmit,
  placeholder = "Type your message...",
  disabled = false,
  isLoading = false,
  showSparkles = true,
  className,
  minRows = 1,
  maxRows = 5,
  defaultValue = "",
}: ChatInputProps) {
  const [message, setMessage] = useState(defaultValue);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = "auto";
    const lineHeight = 24;
    const minHeight = lineHeight * minRows;
    const maxHeight = lineHeight * maxRows;
    const scrollHeight = textarea.scrollHeight;

    textarea.style.height = `${Math.min(Math.max(scrollHeight, minHeight), maxHeight)}px`;
  }, [message, minRows, maxRows]);

  const handleSubmit = () => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage || disabled || isLoading) return;

    onSubmit(trimmedMessage);
    setMessage("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const canSubmit = message.trim().length > 0 && !disabled && !isLoading;

  return (
    <div className={cn("relative", className)}>
      <div className="flex items-end gap-2 rounded-full border bg-background p-2 shadow-sm focus-within:ring-2 focus-within:ring-blue-600/20 focus-within:border-blue-600">
        {/* Sparkles icon */}
        {showSparkles && (
          <div className="flex items-center justify-center h-10 w-10 shrink-0">
            <Sparkles className="h-5 w-5 text-blue-600" />
          </div>
        )}

        {/* Textarea */}
        <Textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled || isLoading}
          rows={minRows}
          className={cn(
            "flex-1 resize-none border-0 bg-transparent p-2 focus-visible:ring-0 focus-visible:ring-offset-0",
            "min-h-[40px] max-h-[120px]",
            "placeholder:text-muted-foreground/60"
          )}
        />

        {/* Submit button */}
        <Button
          type="button"
          size="icon"
          onClick={handleSubmit}
          disabled={!canSubmit}
          className={cn(
            "h-10 w-10 shrink-0 rounded-full transition-all",
            canSubmit
              ? "bg-blue-600 hover:bg-blue-700 text-white"
              : "bg-muted text-muted-foreground"
          )}
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Send className="h-5 w-5" />
          )}
          <span className="sr-only">Send message</span>
        </Button>
      </div>

      {/* Helper text */}
      <p className="text-[11px] text-muted-foreground mt-2 text-center">
        Press <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">Enter</kbd> to send, <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">Shift + Enter</kbd> for new line
      </p>
    </div>
  );
}
