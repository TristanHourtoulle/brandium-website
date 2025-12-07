'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import {
  User,
  Wand2,
  Check,
  Send,
  Loader2,
  Bot,
  Copy,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils/cn';
import { copyToClipboard } from '@/lib/services/posts.service';

// Suggested refinement prompts
const SUGGESTED_PROMPTS = [
  { label: 'Shorter', prompt: 'Make it shorter and more concise' },
  { label: 'Professional', prompt: 'Make it more professional' },
  { label: 'Casual', prompt: 'Make it more casual and friendly' },
  { label: 'Emojis', prompt: 'Add relevant emojis' },
  { label: 'Hashtags', prompt: 'Add relevant hashtags' },
  { label: 'Call-to-action', prompt: 'Add a clear call-to-action' },
];

export interface RefinementMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  versionNumber?: number;
}

interface RefinementChatProps {
  initialContent: string;
  initialTimestamp: Date;
  postId: string;
  isIterating: boolean;
  onRefine: (prompt: string) => Promise<{ generatedText: string; versionNumber: number } | null>;
}

export function RefinementChat({
  initialContent,
  initialTimestamp,
  postId,
  isIterating,
  onRefine,
}: RefinementChatProps) {
  const [refinementInput, setRefinementInput] = useState('');
  const [refinementMessages, setRefinementMessages] = useState<RefinementMessage[]>([]);
  const [initializedPostId, setInitializedPostId] = useState<string | null>(null);
  const scrollViewportRef = useRef<HTMLDivElement>(null);

  // Initialize chat with current post content as first message (only once per post)
  if (initialContent && postId !== initializedPostId) {
    const initialMessage: RefinementMessage = {
      id: `initial-${postId}`,
      role: 'assistant',
      content: initialContent,
      timestamp: initialTimestamp,
      versionNumber: 1,
    };
    setRefinementMessages([initialMessage]);
    setInitializedPostId(postId);
  }

  // Auto-scroll to bottom when messages change or when iterating
  useEffect(() => {
    // Use requestAnimationFrame to ensure DOM is updated before scrolling
    requestAnimationFrame(() => {
      const viewport = scrollViewportRef.current;
      if (viewport) {
        viewport.scrollTo({
          top: viewport.scrollHeight,
          behavior: 'smooth',
        });
      }
    });
  }, [refinementMessages, isIterating]);

  const handleRefine = useCallback(
    async (prompt: string) => {
      if (!prompt.trim()) return;

      const messageId = crypto.randomUUID();

      // Add user message
      const userMessage: RefinementMessage = {
        id: `user-${messageId}`,
        role: 'user',
        content: prompt,
        timestamp: new Date(),
      };
      setRefinementMessages((prev) => [...prev, userMessage]);
      setRefinementInput('');

      // Call iterate API
      const result = await onRefine(prompt);
      if (result) {
        // Add assistant response with new version
        const assistantMessage: RefinementMessage = {
          id: `assistant-${messageId}`,
          role: 'assistant',
          content: result.generatedText,
          timestamp: new Date(),
          versionNumber: result.versionNumber,
        };
        setRefinementMessages((prev) => [...prev, assistantMessage]);
      }
    },
    [onRefine]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleRefine(refinementInput);
    }
  };

  return (
    <div className='flex-1 flex flex-col min-h-0'>
      {/* Messages area */}
      <ScrollArea className='flex-1 min-h-0' viewportRef={scrollViewportRef}>
        <div className='py-4 px-4 space-y-4'>
          {/* Welcome message */}
          {refinementMessages.length > 0 &&
            refinementMessages[0].id.startsWith('initial-') && (
              <div className='flex items-center gap-2 text-xs text-muted-foreground justify-center py-2'>
                <Wand2 className='h-3 w-3' />
                <span>Here&apos;s your current post. Ask me to refine it!</span>
              </div>
            )}

          {refinementMessages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}

          {/* Loading indicator */}
          {isIterating && (
            <div className='flex gap-3 py-4'>
              <Avatar className='h-8 w-8 shrink-0 bg-muted'>
                <AvatarFallback className='bg-muted'>
                  <Bot className='h-4 w-4 text-blue-600' />
                </AvatarFallback>
              </Avatar>
              <div className='rounded-2xl rounded-bl-md bg-muted px-4 py-3'>
                <div className='flex items-center gap-1'>
                  <span className='h-2 w-2 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.3s]' />
                  <span className='h-2 w-2 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.15s]' />
                  <span className='h-2 w-2 bg-blue-600 rounded-full animate-bounce' />
                </div>
              </div>
            </div>
          )}

        </div>
      </ScrollArea>

      {/* Input area - Fixed at bottom */}
      <div className='shrink-0 border-t bg-background p-4'>
        {/* Quick suggestions */}
        <div className='flex flex-wrap gap-2 mb-3'>
          {SUGGESTED_PROMPTS.map((suggestion) => (
            <Badge
              key={suggestion.label}
              variant='outline'
              className='cursor-pointer hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-colors'
              onClick={() => handleRefine(suggestion.prompt)}
            >
              {suggestion.label}
            </Badge>
          ))}
        </div>

        {/* Input */}
        <div className='flex items-end gap-2 rounded-3xl border bg-background p-2 shadow-sm focus-within:ring-2 focus-within:ring-blue-600/20 focus-within:border-blue-600'>
          <div className='flex items-center justify-center h-10 w-10 shrink-0 self-end'>
            <Wand2 className='h-5 w-5 text-blue-600' />
          </div>
          <Textarea
            value={refinementInput}
            onChange={(e) => setRefinementInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe how you'd like to refine this post..."
            disabled={isIterating}
            rows={1}
            className='flex-1 resize-none border-0 bg-transparent p-2 focus-visible:ring-0 focus-visible:ring-offset-0 min-h-[40px] max-h-[120px] placeholder:text-muted-foreground/60'
          />
          <Button
            type='button'
            size='icon'
            onClick={() => handleRefine(refinementInput)}
            disabled={!refinementInput.trim() || isIterating}
            className={cn(
              'h-10 w-10 shrink-0 rounded-full transition-all self-end',
              refinementInput.trim() && !isIterating
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-muted text-muted-foreground'
            )}
          >
            {isIterating ? (
              <Loader2 className='h-5 w-5 animate-spin' />
            ) : (
              <Send className='h-5 w-5' />
            )}
          </Button>
        </div>
        <p className='text-[11px] text-muted-foreground mt-2 text-center'>
          Press{' '}
          <kbd className='px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono'>
            Enter
          </kbd>{' '}
          to send,{' '}
          <kbd className='px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono'>
            Shift + Enter
          </kbd>{' '}
          for new line
        </p>
      </div>
    </div>
  );
}

interface ChatMessageProps {
  message: RefinementMessage;
}

function ChatMessage({ message }: ChatMessageProps) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';

  const handleCopy = async () => {
    const success = await copyToClipboard(message.content);
    if (success) {
      setCopied(true);
      toast.success('Copied!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      className={cn(
        'flex gap-3 py-2',
        isUser ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      <Avatar
        className={cn('h-8 w-8 shrink-0', isUser ? 'bg-blue-600' : 'bg-muted')}
      >
        <AvatarFallback
          className={cn(isUser ? 'bg-blue-600 text-white' : 'bg-muted')}
        >
          {isUser ? (
            <User className='h-4 w-4' />
          ) : (
            <Bot className='h-4 w-4 text-blue-600' />
          )}
        </AvatarFallback>
      </Avatar>

      <div
        className={cn(
          'flex flex-col max-w-[80%] gap-1',
          isUser ? 'items-end' : 'items-start'
        )}
      >
        {/* Version badge for assistant messages */}
        {!isUser && message.versionNumber && (
          <Badge variant='outline' className='text-xs font-mono mb-1'>
            v{message.versionNumber}
          </Badge>
        )}

        <div
          className={cn(
            'rounded-2xl px-4 py-3 text-sm',
            isUser
              ? 'bg-blue-600 text-white rounded-br-md'
              : 'bg-muted rounded-bl-md'
          )}
        >
          <p className='whitespace-pre-wrap leading-relaxed'>
            {message.content}
          </p>
        </div>

        {/* Copy button for assistant messages */}
        {!isUser && (
          <Button
            variant='ghost'
            size='sm'
            onClick={handleCopy}
            className='h-7 px-2 text-muted-foreground hover:text-foreground'
          >
            {copied ? (
              <Check className='h-3.5 w-3.5 text-green-500 mr-1' />
            ) : (
              <Copy className='h-3.5 w-3.5 mr-1' />
            )}
            <span className='text-xs'>Copy</span>
          </Button>
        )}
      </div>
    </div>
  );
}
