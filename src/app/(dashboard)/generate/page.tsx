'use client';

import { useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useProfiles } from '@/lib/hooks/use-profiles';
import { useProjects } from '@/lib/hooks/use-projects';
import { usePlatforms } from '@/lib/hooks/use-platforms';
import { useGenerate } from '@/lib/hooks/use-generate';
import { usePostIdea } from '@/lib/hooks/use-post-ideas';
import { useTemplate } from '@/lib/hooks/use-templates';
import { ChatContainer, type Message } from '@/components/features/chat';
import {
  RateLimitStatusDisplay,
  GenerationConfig,
} from '@/components/features/generate';
import { VariableInputForm, TemplatePreviewInline } from '@/components/features/templates';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Sparkles, Copy, Check, ExternalLink, FileText, X, Layers } from 'lucide-react';
import { toast } from 'sonner';
import { copyToClipboard } from '@/lib/utils/format';
import { ROUTES } from '@/config/constants';
import { renderTemplateContent } from '@/lib/api/templates';
import type { PostIdea } from '@/types/idea';
import type { Template } from '@/types';

// Loading skeleton for when idea is loading
function GeneratePageSkeleton() {
  return (
    <div className='h-[calc(100vh-4rem)] flex flex-col'>
      {/* Header skeleton */}
      <div className='shrink-0 border-b bg-background/95 backdrop-blur p-4 md:p-6'>
        <div className='flex items-center gap-3'>
          <Skeleton className='h-10 w-10 rounded-full animate-pulse' />
          <div className='space-y-2'>
            <Skeleton className='h-5 w-32 md:w-40 animate-pulse' />
            <Skeleton className='h-4 w-48 md:w-60 animate-pulse' />
          </div>
        </div>
      </div>
      {/* Main content skeleton - responsive */}
      <div className='flex-1 flex flex-col lg:flex-row'>
        {/* Config sidebar skeleton */}
        <div className='w-full lg:w-80 border-b lg:border-b-0 lg:border-r p-4 space-y-4 bg-muted/30'>
          <div className='space-y-2'>
            <Skeleton className='h-4 w-16 animate-pulse' />
            <Skeleton className='h-10 w-full animate-pulse' />
          </div>
          <div className='space-y-2'>
            <Skeleton className='h-4 w-16 animate-pulse' />
            <Skeleton className='h-10 w-full animate-pulse' />
          </div>
          <div className='space-y-2'>
            <Skeleton className='h-4 w-16 animate-pulse' />
            <Skeleton className='h-10 w-full animate-pulse' />
          </div>
        </div>
        {/* Chat area skeleton */}
        <div className='flex-1 p-6 md:p-8 flex items-center justify-center'>
          <div className='text-center space-y-4'>
            <div className='relative mx-auto w-fit'>
              <Skeleton className='h-16 w-16 rounded-full animate-pulse' />
              <div className='absolute inset-0 rounded-full bg-primary/5 animate-ping' />
            </div>
            <Skeleton className='h-6 w-40 md:w-48 mx-auto animate-pulse' />
            <Skeleton className='h-4 w-56 md:w-64 mx-auto animate-pulse' />
          </div>
        </div>
      </div>
    </div>
  );
}

// Inner component that receives initialized values via key remounting
interface GeneratePageContentProps {
  idea: PostIdea | null;
  defaultProfileId: string;
  hookText?: string | null;
  template?: Template | null;
}

function GeneratePageContent({ idea, defaultProfileId, hookText, template }: GeneratePageContentProps) {
  const router = useRouter();
  const { profiles, isLoading: profilesLoading } = useProfiles();
  const { projects, isLoading: projectsLoading } = useProjects();
  const { platforms, isLoading: platformsLoading } = usePlatforms();

  const {
    generatedPost,
    generationContext,
    isGenerating,
    rateLimitStatus,
    isRateLimited,
    generate,
    regenerate,
  } = useGenerate();

  // Configuration state - initialized from idea, template, or defaults
  const [selectedProfileId, setSelectedProfileId] = useState<string>(() =>
    idea?.profile?.id ?? template?.profileId ?? defaultProfileId
  );
  const [selectedProjectId, setSelectedProjectId] = useState<string | undefined>(() =>
    idea?.project?.id
  );
  const [selectedPlatformId, setSelectedPlatformId] = useState<string | undefined>(() =>
    idea?.platform?.id ?? template?.platformId ?? undefined
  );
  const [goal, setGoal] = useState<string>(() =>
    idea?.suggestedGoal ?? ''
  );

  // Template variable values state
  const [templateVariables, setTemplateVariables] = useState<Record<string, string>>(() =>
    template?.exampleVariables ?? {}
  );
  const [showTemplatePanel, setShowTemplatePanel] = useState(!!template);

  // Chat messages state - starts empty, user will send the pre-filled message
  const [messages, setMessages] = useState<Message[]>([]);
  const [copied, setCopied] = useState(false);

  // Handle template variable change
  const handleTemplateVariableChange = useCallback((name: string, value: string) => {
    setTemplateVariables(prev => ({ ...prev, [name]: value }));
  }, []);

  // Generate rendered template content
  const renderedTemplateContent = template
    ? renderTemplateContent(template.content, templateVariables)
    : '';

  // Check if all required template variables are filled
  const templateReady = !template || template.variables.every(
    v => !v.required || templateVariables[v.name]?.trim()
  );

  // Compute the default input value
  const defaultInputValue = template
    ? renderedTemplateContent
    : hookText
      ? hookText
      : idea
        ? `${idea.title}\n\n${idea.description}`
        : undefined;

  const handleSendMessage = useCallback(
    async (message: string) => {
      if (!selectedProfileId) {
        toast.error('Please select a profile first');
        return;
      }

      // Add user message
      const userMessage: Message = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: message,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);

      // Generate content
      const result = await generate({
        profileId: selectedProfileId,
        projectId: selectedProjectId,
        platformId: selectedPlatformId,
        goal: goal || undefined,
        rawIdea: message,
      });

      if (result) {
        // Add assistant response
        const assistantMessage: Message = {
          id: `assistant-${result.id}`,
          role: 'assistant',
          content: result.content,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      }
    },
    [selectedProfileId, selectedProjectId, selectedPlatformId, goal, generate]
  );

  const handleRegenerate = useCallback(async () => {
    const result = await regenerate();
    if (result) {
      // Update last assistant message
      setMessages((prev) => {
        const newMessages = [...prev];
        const lastAssistantIndex = newMessages
          .map((m, i) => ({ role: m.role, index: i }))
          .filter((m) => m.role === 'assistant')
          .pop()?.index;

        if (lastAssistantIndex !== undefined) {
          newMessages[lastAssistantIndex] = {
            ...newMessages[lastAssistantIndex],
            content: result.content,
            timestamp: new Date(),
          };
        }
        return newMessages;
      });
    }
  }, [regenerate]);

  const handleCopy = async () => {
    if (!generatedPost) return;
    const success = await copyToClipboard(generatedPost.content);
    if (success) {
      setCopied(true);
      toast.success('Copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleViewPost = () => {
    if (generatedPost) {
      router.push(`${ROUTES.POSTS}/${generatedPost.id}`);
    }
  };

  const selectedPlatform = platforms.find((p) => p.id === selectedPlatformId);
  const canGenerate = selectedProfileId && profiles.length > 0 && !isRateLimited;

  return (
    <div className='h-[calc(100vh-4rem)] flex flex-col'>
      {/* Header */}
      <div className='shrink-0 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60'>
        <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 md:px-6 pb-4'>
          <div className='flex items-center gap-3'>
            <div className='flex items-center justify-center h-10 w-10 rounded-full bg-primary/10 transition-transform duration-200 hover:scale-105'>
              <Sparkles className='h-5 w-5 text-primary' />
            </div>
            <div>
              <h1 className='text-lg font-semibold'>AI Content Generator</h1>
              <p className='text-sm text-muted-foreground/90'>
                {template
                  ? `Using template: ${template.name}`
                  : hookText
                    ? 'Creating post from your selected hook'
                    : idea
                      ? `Creating post from idea: ${idea.title}`
                      : 'Chat with AI to create personalized posts'}
              </p>
            </div>
          </div>
          <div className='flex items-center gap-2'>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => router.push(ROUTES.GENERATE_VARIANTS)}
                    className='hidden sm:flex'
                  >
                    <Layers className='h-4 w-4 mr-2' />
                    A/B Variants
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Generate multiple post variations with different approaches for A/B testing</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <RateLimitStatusDisplay status={rateLimitStatus} />
          </div>
        </div>
      </div>

      {/* Main content - responsive layout */}
      <div className='flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden'>
        {/* Left sidebar - Configuration - collapsible on mobile */}
        <div className='w-full lg:w-80 shrink-0 border-b lg:border-b-0 lg:border-r overflow-y-auto bg-muted/30 max-h-[35vh] lg:max-h-none transition-all duration-300'>
          <GenerationConfig
            profiles={profiles}
            projects={projects}
            platforms={platforms}
            selectedProfileId={selectedProfileId}
            selectedProjectId={selectedProjectId}
            selectedPlatformId={selectedPlatformId}
            goal={goal}
            isLoadingProfiles={profilesLoading}
            isLoadingProjects={projectsLoading}
            isLoadingPlatforms={platformsLoading}
            onProfileChange={setSelectedProfileId}
            onProjectChange={setSelectedProjectId}
            onPlatformChange={setSelectedPlatformId}
            onGoalChange={setGoal}
            disabled={isGenerating}
            className='py-4'
          />

          {/* Template Variables Panel */}
          {template && showTemplatePanel && (
            <div className='border-t p-4 space-y-4'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <FileText className='h-4 w-4 text-primary' />
                  <span className='text-sm font-medium'>Template Variables</span>
                </div>
                <Button
                  variant='ghost'
                  size='icon'
                  className='h-6 w-6'
                  onClick={() => setShowTemplatePanel(false)}
                >
                  <X className='h-4 w-4' />
                </Button>
              </div>
              <VariableInputForm
                variables={template.variables}
                values={templateVariables}
                exampleValues={template.exampleVariables ?? undefined}
                onChange={handleTemplateVariableChange}
                disabled={isGenerating}
              />
              {!templateReady && (
                <p className='text-xs text-amber-600'>
                  Fill in all required variables to generate your post
                </p>
              )}
            </div>
          )}
        </div>

        {/* Chat area */}
        <div className='flex-1 flex flex-col min-h-0'>
          <ChatContainer
            messages={messages}
            onSendMessage={handleSendMessage}
            isLoading={isGenerating}
            placeholder={
              canGenerate
                ? 'Describe what you want to post about...'
                : 'Select a profile to start generating'
            }
            emptyStateTitle='Create Your Post'
            emptyStateDescription="Describe your idea and I'll generate engaging content tailored to your personal brand"
            showMessageActions={true}
            onRegenerateMessage={handleRegenerate}
            isRegenerating={isGenerating}
            disabled={!canGenerate}
            defaultInputValue={defaultInputValue}
          />
        </div>

        {/* Right sidebar - Generated content actions (when available) */}
        {generatedPost && (
          <div className='w-full lg:w-72 shrink-0 border-t lg:border-t-0 lg:border-l overflow-y-auto bg-muted/30 p-4 animate-in slide-in-from-right-5 duration-300'>
            <Card className='p-4 space-y-4 transition-all duration-200 hover:shadow-md'>
              <div className='flex items-center gap-2'>
                <Sparkles className='h-4 w-4 text-primary' />
                <h3 className='font-medium text-sm'>Generated Post</h3>
              </div>

              {/* Platform badge */}
              {selectedPlatform && (
                <Badge variant='secondary' className='text-xs'>
                  {selectedPlatform.name}
                  {selectedPlatform.maxLength && (
                    <span className='ml-1 text-muted-foreground/80'>
                      ({generatedPost.content.length}/
                      {selectedPlatform.maxLength})
                    </span>
                  )}
                </Badge>
              )}

              {/* Historical posts context */}
              {generationContext?.historicalPostsUsed !== undefined && generationContext.historicalPostsUsed > 0 && (
                <Badge variant='outline' className='text-xs text-primary border-primary/50'>
                  Style matched from {generationContext.historicalPostsUsed} post{generationContext.historicalPostsUsed !== 1 ? 's' : ''}
                </Badge>
              )}

              {/* Character count */}
              <p className='text-xs text-muted-foreground/90'>
                {generatedPost.content.length} characters
              </p>

              {/* Actions */}
              <div className='space-y-2'>
                <Button
                  variant='outline'
                  size='sm'
                  className='w-full justify-start transition-all duration-200'
                  onClick={handleCopy}
                  disabled={copied}
                >
                  {copied ? (
                    <>
                      <Check className='h-4 w-4 mr-2 text-green-500' />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className='h-4 w-4 mr-2' />
                      Copy to clipboard
                    </>
                  )}
                </Button>

                <Button
                  size='sm'
                  className='w-full justify-start'
                  onClick={handleViewPost}
                >
                  <ExternalLink className='h-4 w-4 mr-2' />
                  View & refine post
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

// Main page component that handles loading states and passes data
export default function GeneratePage() {
  const searchParams = useSearchParams();
  const ideaId = searchParams.get('ideaId');
  const hookText = searchParams.get('hook');
  const templateId = searchParams.get('templateId');
  const { profiles, isLoading: profilesLoading } = useProfiles();
  const { idea, isLoading: ideaLoading } = usePostIdea(ideaId);
  const { template, isLoading: templateLoading } = useTemplate(templateId);

  // Show skeleton while loading idea, template, or profiles (needed for default)
  if (ideaId && ideaLoading) {
    return <GeneratePageSkeleton />;
  }

  if (templateId && templateLoading) {
    return <GeneratePageSkeleton />;
  }

  if (profilesLoading) {
    return <GeneratePageSkeleton />;
  }

  const defaultProfileId = profiles.length > 0 ? profiles[0].id : '';

  // Use key to force remount when ideaId, hook, or templateId changes, ensuring state is re-initialized
  return (
    <GeneratePageContent
      key={ideaId ?? hookText ?? templateId ?? 'no-context'}
      idea={idea}
      defaultProfileId={defaultProfileId}
      template={template}
      hookText={hookText}
    />
  );
}
