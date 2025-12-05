'use client';

import {
  User,
  Briefcase,
  Monitor,
  Target,
  Lightbulb,
  History,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { VersionHistory } from '@/components/features/iterations';
import type { PostVersion } from '@/types';

interface PostInfo {
  profile?: { name: string } | null;
  project?: { name: string } | null;
  platform?: { name: string } | null;
  goal?: string | null;
  rawIdea?: string | null;
}

interface PostDetailsSidebarProps {
  characterCount: number;
  totalVersions: number;
  versions: PostVersion[];
  postInfo: PostInfo;
  isHistoryOpen: boolean;
  isDetailsOpen: boolean;
  isFetchingVersions: boolean;
  isSelectingVersion: boolean;
  onHistoryOpenChange: (open: boolean) => void;
  onDetailsOpenChange: (open: boolean) => void;
  onSelectVersion: (versionId: string) => void;
}

export function PostDetailsSidebar({
  characterCount,
  totalVersions,
  versions,
  postInfo,
  isHistoryOpen,
  isDetailsOpen,
  isFetchingVersions,
  isSelectingVersion,
  onHistoryOpenChange,
  onDetailsOpenChange,
  onSelectVersion,
}: PostDetailsSidebarProps) {
  return (
    <div className='w-72 shrink-0 border-r overflow-y-auto bg-muted/30'>
      <div className='p-4 space-y-4'>
        {/* Quick stats */}
        <div className='flex items-center justify-between text-sm'>
          <span className='text-muted-foreground'>Characters</span>
          <span className='font-medium'>{characterCount}</span>
        </div>

        {/* Version History */}
        {totalVersions > 1 && (
          <Collapsible open={isHistoryOpen} onOpenChange={onHistoryOpenChange}>
            <CollapsibleTrigger asChild>
              <Button
                variant='ghost'
                className='w-full justify-between h-10'
                size='sm'
              >
                <span className='flex items-center gap-2'>
                  <History className='h-4 w-4' />
                  Version History ({totalVersions})
                </span>
                {isHistoryOpen ? (
                  <ChevronUp className='h-4 w-4' />
                ) : (
                  <ChevronDown className='h-4 w-4' />
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className='pt-2'>
              <VersionHistory
                versions={versions}
                onSelectVersion={onSelectVersion}
                isLoading={isFetchingVersions}
                isSelectingVersion={isSelectingVersion}
              />
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Generation Details */}
        <Collapsible open={isDetailsOpen} onOpenChange={onDetailsOpenChange}>
          <CollapsibleTrigger asChild>
            <Button
              variant='ghost'
              className='w-full justify-between h-10'
              size='sm'
            >
              <span className='flex items-center gap-2'>
                <Lightbulb className='h-4 w-4' />
                Generation Details
              </span>
              {isDetailsOpen ? (
                <ChevronUp className='h-4 w-4' />
              ) : (
                <ChevronDown className='h-4 w-4' />
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className='pt-2 space-y-3'>
            {postInfo.profile && (
              <div className='flex items-center gap-2 text-sm'>
                <User className='h-4 w-4 text-muted-foreground' />
                <span className='text-muted-foreground'>Profile:</span>
                <span className='font-medium'>{postInfo.profile.name}</span>
              </div>
            )}
            {postInfo.project && (
              <div className='flex items-center gap-2 text-sm'>
                <Briefcase className='h-4 w-4 text-muted-foreground' />
                <span className='text-muted-foreground'>Project:</span>
                <span className='font-medium'>{postInfo.project.name}</span>
              </div>
            )}
            {postInfo.platform && (
              <div className='flex items-center gap-2 text-sm'>
                <Monitor className='h-4 w-4 text-muted-foreground' />
                <span className='text-muted-foreground'>Platform:</span>
                <span className='font-medium'>{postInfo.platform.name}</span>
              </div>
            )}
            {postInfo.goal && (
              <div className='flex items-start gap-2 text-sm'>
                <Target className='h-4 w-4 text-muted-foreground mt-0.5' />
                <div>
                  <span className='text-muted-foreground'>Goal:</span>
                  <p className='font-medium'>{postInfo.goal}</p>
                </div>
              </div>
            )}
            {postInfo.rawIdea && (
              <div className='flex items-start gap-2 text-sm'>
                <Lightbulb className='h-4 w-4 text-muted-foreground mt-0.5' />
                <div>
                  <span className='text-muted-foreground'>Original Idea:</span>
                  <p className='font-medium whitespace-pre-wrap'>
                    {postInfo.rawIdea}
                  </p>
                </div>
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
}
