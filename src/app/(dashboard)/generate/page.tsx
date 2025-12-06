'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useProfiles } from '@/lib/hooks/use-profiles';
import { useProjects } from '@/lib/hooks/use-projects';
import { usePlatforms } from '@/lib/hooks/use-platforms';
import { useGenerate } from '@/lib/hooks/use-generate';
import { ChatContainer, type Message } from '@/components/features/chat';
import {
  RateLimitStatusDisplay,
  GenerationConfig,
} from '@/components/features/generate';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, Copy, Check, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { copyToClipboard } from '@/lib/utils/format';
import { ROUTES } from '@/config/constants';

export default function GeneratePage() {
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

  // Configuration state - initialize with first profile if available
  const [selectedProfileId, setSelectedProfileId] = useState<string>('');
  const [selectedProjectId, setSelectedProjectId] = useState<
    string | undefined
  >();
  const [selectedPlatformId, setSelectedPlatformId] = useState<
    string | undefined
  >();
  const [goal, setGoal] = useState<string>('');
  const [hasInitializedProfile, setHasInitializedProfile] = useState(false);

  // Chat messages state
  const [messages, setMessages] = useState<Message[]>([]);
  const [copied, setCopied] = useState(false);

  // Set default profile when profiles load (only once)
  if (profiles.length > 0 && !selectedProfileId && !hasInitializedProfile) {
    setHasInitializedProfile(true);
    setSelectedProfileId(profiles[0].id);
  }

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
  const canGenerate =
    selectedProfileId && profiles.length > 0 && !isRateLimited;

  return (
    <div className='h-[calc(100vh-4rem)] flex flex-col'>
      {/* Header */}
      <div className='shrink-0 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60'>
        <div className='flex items-center justify-between px-6 pb-4'>
          <div className='flex items-center gap-3'>
            <div className='flex items-center justify-center h-10 w-10 rounded-full bg-blue-600/10'>
              <Sparkles className='h-5 w-5 text-blue-600' />
            </div>
            <div>
              <h1 className='text-lg font-semibold'>AI Content Generator</h1>
              <p className='text-sm text-muted-foreground'>
                Chat with AI to create personalized posts
              </p>
            </div>
          </div>
          <RateLimitStatusDisplay status={rateLimitStatus} />
        </div>
      </div>

      {/* Main content */}
      <div className='flex-1 flex min-h-0 overflow-hidden'>
        {/* Left sidebar - Configuration */}
        <div className='w-80 shrink-0 border-r overflow-y-auto bg-muted/30'>
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
          />
        </div>

        {/* Right sidebar - Generated content actions (when available) */}
        {generatedPost && (
          <div className='w-72 shrink-0 border-l overflow-y-auto bg-muted/30 p-4'>
            <Card className='p-4 space-y-4'>
              <div className='flex items-center gap-2'>
                <Sparkles className='h-4 w-4 text-blue-600' />
                <h3 className='font-medium text-sm'>Generated Post</h3>
              </div>

              {/* Platform badge */}
              {selectedPlatform && (
                <Badge variant='secondary' className='text-xs'>
                  {selectedPlatform.name}
                  {selectedPlatform.maxLength && (
                    <span className='ml-1 text-muted-foreground'>
                      ({generatedPost.content.length}/
                      {selectedPlatform.maxLength})
                    </span>
                  )}
                </Badge>
              )}

              {/* Historical posts context */}
              {generationContext?.historicalPostsUsed !== undefined && generationContext.historicalPostsUsed > 0 && (
                <Badge variant='outline' className='text-xs text-blue-600 border-blue-600/50'>
                  Style matched from {generationContext.historicalPostsUsed} post{generationContext.historicalPostsUsed !== 1 ? 's' : ''}
                </Badge>
              )}

              {/* Character count */}
              <p className='text-xs text-muted-foreground'>
                {generatedPost.content.length} characters
              </p>

              {/* Actions */}
              <div className='space-y-2'>
                <Button
                  variant='outline'
                  size='sm'
                  className='w-full justify-start'
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
                  className='w-full justify-start bg-blue-600 hover:bg-blue-700'
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
