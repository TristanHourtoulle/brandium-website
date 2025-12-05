'use client';

import { use, useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Copy,
  Trash2,
  Wand2,
  Check,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { usePost } from '@/lib/hooks/use-posts';
import { usePostIterations } from '@/lib/hooks/use-post-iterations';
import * as postsApi from '@/lib/api/posts';
import {
  formatPostDate,
  copyToClipboard,
  getCharacterCountInfo,
} from '@/lib/services/posts.service';
import { ROUTES } from '@/config/constants';
import { RefinementChat, PostDetailsSidebar } from '@/components/features/posts';

interface PostDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function PostDetailPage({ params }: PostDetailPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { post, isLoading, error, refetch } = usePost(id);
  const [isDeleting, setIsDeleting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const {
    versions,
    currentVersion,
    totalVersions,
    isIterating,
    isFetchingVersions,
    isSelectingVersion,
    iterate,
    fetchVersions,
    selectVersion,
  } = usePostIterations();

  // Fetch versions when post loads
  useEffect(() => {
    if (post?.id) {
      fetchVersions(post.id);
    }
  }, [post?.id, fetchVersions]);

  // Get display content - prefer current version if available
  const displayContent = currentVersion?.generatedText || post?.content || '';
  const displayVersionNumber =
    currentVersion?.versionNumber || post?.totalVersions || 1;

  const handleCopy = useCallback(async () => {
    if (!displayContent) return;
    const success = await copyToClipboard(displayContent);
    if (success) {
      setCopied(true);
      toast.success('Post copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } else {
      toast.error('Failed to copy post');
    }
  }, [displayContent]);

  const handleDelete = useCallback(async () => {
    if (!post) return;
    setIsDeleting(true);
    try {
      await postsApi.deletePost(post.id);
      toast.success('Post deleted successfully');
      router.push(ROUTES.POSTS);
    } catch {
      toast.error('Failed to delete post');
      setIsDeleting(false);
    }
  }, [post, router]);

  const handleRefine = useCallback(
    async (prompt: string) => {
      if (!post || !prompt.trim()) return null;

      const result = await iterate(post.id, { iterationPrompt: prompt });
      if (result) {
        refetch();
        return {
          generatedText: result.generatedText,
          versionNumber: result.versionNumber,
        };
      }
      return null;
    },
    [post, iterate, refetch]
  );

  const handleSelectVersion = useCallback(
    async (versionId: string) => {
      if (!post) return;
      await selectVersion(post.id, versionId);
      refetch();
    },
    [post, selectVersion, refetch]
  );

  if (isLoading) {
    return <PostDetailSkeleton />;
  }

  if (error || !post) {
    return (
      <div className='space-y-6'>
        <Button variant='ghost' asChild>
          <Link href={ROUTES.POSTS}>
            <ArrowLeft className='mr-2 h-4 w-4' />
            Back to Posts
          </Link>
        </Button>
        <Card>
          <CardContent className='py-12 text-center'>
            <p className='text-muted-foreground'>{error || 'Post not found'}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const charInfo = getCharacterCountInfo(displayContent);
  const formattedDate = formatPostDate(post.createdAt);

  return (
    <div className='h-[calc(100vh-5rem)] flex flex-col'>
      {/* Header */}
      <div className='shrink-0 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60'>
        <div className='flex items-center justify-between px-6 pb-4'>
          <div className='flex items-center gap-4'>
            <Button variant='ghost' size='sm' asChild>
              <Link href={ROUTES.POSTS}>
                <ArrowLeft className='mr-2 h-4 w-4' />
                Back
              </Link>
            </Button>
            <Separator orientation='vertical' className='h-6' />
            <div className='flex items-center gap-2'>
              <div className='flex items-center justify-center h-8 w-8 rounded-lg bg-blue-600/10'>
                <Wand2 className='h-4 w-4 text-blue-600' />
              </div>
              <div>
                <h1 className='text-sm font-semibold'>Post Editor</h1>
                <p className='text-xs text-muted-foreground'>
                  Created {formattedDate}
                </p>
              </div>
            </div>
          </div>

          <div className='flex items-center gap-2'>
            {totalVersions > 0 && (
              <Badge variant='outline' className='font-mono text-xs'>
                v{displayVersionNumber}
                {totalVersions > 1 && ` of ${totalVersions}`}
              </Badge>
            )}
            {post.platform && (
              <Badge className='bg-blue-600 hover:bg-blue-700'>
                {post.platform.name}
              </Badge>
            )}
            <Button
              variant='outline'
              size='sm'
              onClick={handleCopy}
              disabled={copied}
            >
              {copied ? (
                <Check className='h-4 w-4 text-green-500' />
              ) : (
                <Copy className='h-4 w-4' />
              )}
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant='outline' size='sm' disabled={isDeleting}>
                  <Trash2 className='h-4 w-4 text-destructive' />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Post</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this post? This action
                    cannot be undone. All versions will also be deleted.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className='flex-1 flex min-h-0 overflow-hidden'>
        {/* Left sidebar - Post details */}
        <PostDetailsSidebar
          characterCount={charInfo.count}
          totalVersions={totalVersions}
          versions={versions}
          postInfo={{
            profile: post.profile,
            project: post.project,
            platform: post.platform,
            goal: post.goal,
            rawIdea: post.rawIdea,
          }}
          isHistoryOpen={isHistoryOpen}
          isDetailsOpen={isDetailsOpen}
          isFetchingVersions={isFetchingVersions}
          isSelectingVersion={isSelectingVersion}
          onHistoryOpenChange={setIsHistoryOpen}
          onDetailsOpenChange={setIsDetailsOpen}
          onSelectVersion={handleSelectVersion}
        />

        {/* Chat area for refinement */}
        <RefinementChat
          initialContent={post.content}
          initialTimestamp={new Date(post.createdAt)}
          postId={post.id}
          isIterating={isIterating}
          onRefine={handleRefine}
        />
      </div>
    </div>
  );
}

function PostDetailSkeleton() {
  return (
    <div className='h-[calc(100vh-4rem)] flex flex-col'>
      {/* Header skeleton */}
      <div className='shrink-0 border-b p-4'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-4'>
            <Skeleton className='h-9 w-20' />
            <Skeleton className='h-6 w-px' />
            <div className='flex items-center gap-2'>
              <Skeleton className='h-8 w-8 rounded-lg' />
              <div>
                <Skeleton className='h-4 w-24' />
                <Skeleton className='h-3 w-32 mt-1' />
              </div>
            </div>
          </div>
          <div className='flex items-center gap-2'>
            <Skeleton className='h-6 w-16' />
            <Skeleton className='h-8 w-8' />
            <Skeleton className='h-8 w-8' />
          </div>
        </div>
      </div>

      {/* Content skeleton */}
      <div className='flex-1 flex'>
        <div className='w-80 border-r p-4 space-y-4'>
          <Skeleton className='h-48 w-full' />
          <Skeleton className='h-10 w-full' />
          <Skeleton className='h-10 w-full' />
        </div>
        <div className='flex-1 flex items-center justify-center'>
          <div className='text-center space-y-4'>
            <Skeleton className='h-16 w-16 rounded-2xl mx-auto' />
            <Skeleton className='h-6 w-48 mx-auto' />
            <Skeleton className='h-4 w-64 mx-auto' />
          </div>
        </div>
      </div>
    </div>
  );
}
