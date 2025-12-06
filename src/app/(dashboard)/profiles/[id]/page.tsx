"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Trash2, Loader2, FileText, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
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
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileForm } from "@/components/forms/profile-form";
import { HistoricalPostList } from "@/components/features/historical-posts";
import { AnalysisReviewDialog } from "@/components/features/profile-analysis";
import { useProfile, useProfiles } from "@/lib/hooks/use-profiles";
import { useProfileAnalysis } from "@/lib/hooks/use-profile-analysis";
import { useHistoricalPosts } from "@/lib/hooks/use-historical-posts";
import { ROUTES } from "@/config/constants";
import type { ProfileFormData } from "@/lib/utils/validation";
import type { ApplyAnalysisDto } from "@/types";

export default function EditProfilePage() {
  const router = useRouter();
  const params = useParams();
  const profileId = params.id as string;

  const { profile, isLoading, error, refetch: refetchProfile } = useProfile(profileId);
  const { updateProfile, deleteProfile } = useProfiles();
  const { stats } = useHistoricalPosts(profileId);
  const {
    analysisResult,
    isAnalyzing,
    isApplying,
    canAnalyze,
    analyzeProfile,
    applySuggestions,
    clearAnalysisResult,
  } = useProfileAnalysis(profileId);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isAnalysisDialogOpen, setIsAnalysisDialogOpen] = useState(false);

  const handleSubmit = async (data: ProfileFormData) => {
    setIsSubmitting(true);
    const result = await updateProfile(profileId, data);
    setIsSubmitting(false);

    if (result) {
      router.push(ROUTES.PROFILES);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    const success = await deleteProfile(profileId);
    setIsDeleting(false);

    if (success) {
      router.push(ROUTES.PROFILES);
    }
  };

  const handleAnalyzeClick = async () => {
    const result = await analyzeProfile({ autoApply: false });
    if (result) {
      setIsAnalysisDialogOpen(true);
    }
  };

  const handleApplyAnalysis = async (data: ApplyAnalysisDto) => {
    const result = await applySuggestions(data);
    if (result) {
      setIsAnalysisDialogOpen(false);
      // Refetch profile to get updated data
      refetchProfile();
    }
  };

  const handleAnalysisDialogClose = (open: boolean) => {
    setIsAnalysisDialogOpen(open);
    if (!open) {
      clearAnalysisResult();
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <Skeleton className="h-10 w-80" />
        <div className="w-full space-y-6">
          <Skeleton className="h-64" />
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <h2 className="text-2xl font-semibold">Profile not found</h2>
        <p className="mt-2 text-muted-foreground">
          The profile you&apos;re looking for doesn&apos;t exist or has been
          deleted.
        </p>
        <Button asChild className="mt-4">
          <Link href={ROUTES.PROFILES}>Back to Profiles</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={ROUTES.PROFILES}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{profile.name}</h1>
            <p className="text-muted-foreground">
              Manage profile settings and historical posts.
            </p>
          </div>
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Profile</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete &quot;{profile.name}&quot;? This
                action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeleting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview" className="gap-2">
            <Settings className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="historical-posts" className="gap-2">
            <FileText className="h-4 w-4" />
            Historical Posts
            {stats && stats.totalPosts > 0 && (
              <Badge variant="secondary" className="ml-1">
                {stats.totalPosts}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <ProfileForm
            defaultValues={{
              name: profile.name,
              bio: profile.bio,
              tone: profile.tone,
              doRules: profile.doRules,
              dontRules: profile.dontRules,
            }}
            onSubmit={handleSubmit}
            isLoading={isSubmitting}
            submitLabel="Save Changes"
          />
        </TabsContent>

        <TabsContent value="historical-posts" className="mt-6">
          <HistoricalPostList
            profileId={profileId}
            onAnalyzeClick={handleAnalyzeClick}
            canAnalyze={canAnalyze}
            isAnalyzing={isAnalyzing}
          />
        </TabsContent>
      </Tabs>

      {/* Analysis Review Dialog */}
      <AnalysisReviewDialog
        open={isAnalysisDialogOpen}
        onOpenChange={handleAnalysisDialogClose}
        analysisResult={analysisResult}
        onApply={handleApplyAnalysis}
        isApplying={isApplying}
      />
    </div>
  );
}
