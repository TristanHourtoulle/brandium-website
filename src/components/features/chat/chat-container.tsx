"use client";

import { useRef, useEffect } from "react";
import { cn } from "@/lib/utils/cn";
import { ChatMessage } from "./chat-message";
import { ChatInput } from "./chat-input";
import { Bot, Sparkles } from "lucide-react";

export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp?: Date;
}

interface ChatContainerProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
  placeholder?: string;
  emptyStateTitle?: string;
  emptyStateDescription?: string;
  showMessageActions?: boolean;
  onRegenerateMessage?: (messageId: string) => void;
  isRegenerating?: boolean;
  disabled?: boolean;
  className?: string;
  headerContent?: React.ReactNode;
  defaultInputValue?: string;
}

export function ChatContainer({
  messages,
  onSendMessage,
  isLoading = false,
  placeholder = "Describe what you want to create...",
  emptyStateTitle = "Start a conversation",
  emptyStateDescription = "Share your idea and I'll help you create amazing content",
  showMessageActions = true,
  onRegenerateMessage,
  isRegenerating = false,
  disabled = false,
  className,
  headerContent,
  defaultInputValue,
}: ChatContainerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    // Use requestAnimationFrame to ensure DOM is updated before scrolling
    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    });
  }, [messages, isLoading]);

  const lastAssistantMessageId = [...messages]
    .reverse()
    .find((m) => m.role === "assistant")?.id;

  return (
    <div className={cn("flex flex-col h-full min-h-0", className)}>
      {/* Header content slot */}
      {headerContent && (
        <div className="shrink-0 border-b">
          {headerContent}
        </div>
      )}

      {/* Messages area */}
      <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto">
        {messages.length === 0 ? (
          <EmptyState
            title={emptyStateTitle}
            description={emptyStateDescription}
          />
        ) : (
          <div className="py-4 px-4 space-y-1">
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                role={message.role}
                content={message.content}
                timestamp={message.timestamp}
                showActions={
                  showMessageActions &&
                  message.role === "assistant" &&
                  message.id === lastAssistantMessageId
                }
                onRegenerate={
                  onRegenerateMessage
                    ? () => onRegenerateMessage(message.id)
                    : undefined
                }
                isRegenerating={isRegenerating && message.id === lastAssistantMessageId}
              />
            ))}

            {/* Loading indicator */}
            {isLoading && (
              <ChatMessage
                role="assistant"
                content=""
                isLoading={true}
              />
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input area - Fixed at bottom */}
      <div className="shrink-0 border-t bg-background p-4">
        <ChatInput
          onSubmit={onSendMessage}
          placeholder={placeholder}
          isLoading={isLoading}
          disabled={disabled}
          defaultValue={defaultInputValue}
        />
      </div>
    </div>
  );
}

interface EmptyStateProps {
  title: string;
  description: string;
}

function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center px-4">
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-blue-600/20 blur-2xl rounded-full" />
        <div className="relative bg-gradient-to-br from-blue-600 to-blue-700 p-4 rounded-2xl shadow-lg">
          <Bot className="h-8 w-8 text-white" />
        </div>
        <Sparkles className="absolute -top-1 -right-1 h-5 w-5 text-blue-600" />
      </div>

      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground max-w-sm">{description}</p>

      {/* Suggestion chips */}
      <div className="flex flex-wrap justify-center gap-2 mt-6">
        <SuggestionChip text="Share a personal achievement" />
        <SuggestionChip text="Promote your latest project" />
        <SuggestionChip text="Industry insight or tip" />
      </div>
    </div>
  );
}

function SuggestionChip({ text }: { text: string }) {
  return (
    <span className="px-3 py-1.5 text-xs text-muted-foreground bg-muted rounded-full border border-transparent hover:border-blue-600/30 hover:text-blue-600 cursor-default transition-colors">
      {text}
    </span>
  );
}
