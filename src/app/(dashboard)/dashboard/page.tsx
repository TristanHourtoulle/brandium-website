"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/hooks/use-auth";
import { useProfiles } from "@/lib/hooks/use-profiles";
import { useProjects } from "@/lib/hooks/use-projects";
import { usePlatforms } from "@/lib/hooks/use-platforms";
import { usePosts } from "@/lib/hooks/use-posts";
import { useOnboardingContext } from "@/lib/providers/onboarding-provider";
import { shouldShowOnboarding } from "@/lib/services/onboarding";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/layout/page-header";
import {
  Sparkles,
  User,
  Briefcase,
  Share2,
  FileText,
  Plus,
  ArrowRight,
} from "lucide-react";
import { APP_NAME, ROUTES } from "@/config/constants";

export default function DashboardPage() {
  const { user } = useAuth();
  const { profiles, isLoading: profilesLoading } = useProfiles();
  const { projects, isLoading: projectsLoading } = useProjects();
  const { platforms, isLoading: platformsLoading } = usePlatforms();
  const { posts, isLoading: postsLoading, pagination } = usePosts();
  const { openOnboarding, isOpen: isOnboardingOpen } = useOnboardingContext();

  // Get up to 3 most recent posts for dashboard preview
  const recentPosts = posts.slice(0, 3);

  // Check if we should show onboarding when data is loaded
  const isDataLoaded = !profilesLoading && !projectsLoading && !postsLoading;

  useEffect(() => {
    if (isDataLoaded && !isOnboardingOpen) {
      const showOnboarding = shouldShowOnboarding(
        profiles.length,
        projects.length,
        pagination.totalItems
      );
      if (showOnboarding) {
        openOnboarding();
      }
    }
  }, [isDataLoaded, profiles.length, projects.length, pagination.totalItems, openOnboarding, isOnboardingOpen]);

  const stats = [
    {
      label: "Profiles",
      value: profiles.length,
      icon: User,
      href: ROUTES.PROFILES,
      isLoading: profilesLoading,
    },
    {
      label: "Projects",
      value: projects.length,
      icon: Briefcase,
      href: ROUTES.PROJECTS,
      isLoading: projectsLoading,
    },
    {
      label: "Platforms",
      value: platforms.length,
      icon: Share2,
      href: ROUTES.PLATFORMS,
      isLoading: platformsLoading,
    },
    {
      label: "Posts",
      value: pagination.totalItems,
      icon: FileText,
      href: ROUTES.POSTS,
      isLoading: postsLoading,
    },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        description={`Welcome back to ${APP_NAME}${user?.email ? `, ${user.email}` : ""}`}
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.label} href={stat.href}>
              <Card className="transition-colors hover:bg-muted/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.label}
                  </CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {stat.isLoading ? (
                    <Skeleton className="h-8 w-12" />
                  ) : (
                    <div className="text-2xl font-bold">{stat.value}</div>
                  )}
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Get started with your personal branding
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            <Button variant="outline" className="justify-start" asChild>
              <Link href={`${ROUTES.PROFILES}/new`}>
                <Plus className="mr-2 h-4 w-4" />
                Create a Profile
              </Link>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <Link href={`${ROUTES.PROJECTS}/new`}>
                <Briefcase className="mr-2 h-4 w-4" />
                Add a Project
              </Link>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <Link href={`${ROUTES.PLATFORMS}/new`}>
                <Share2 className="mr-2 h-4 w-4" />
                Configure a Platform
              </Link>
            </Button>
            <Button className="justify-start" asChild>
              <Link href={ROUTES.GENERATE}>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Content
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Posts</CardTitle>
              <CardDescription>Your latest generated content</CardDescription>
            </div>
            {recentPosts.length > 0 && (
              <Button variant="ghost" size="sm" asChild>
                <Link href={ROUTES.POSTS}>
                  View all
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {postsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Skeleton className="h-10 w-10 rounded" />
                    <div className="flex-1 space-y-1">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : recentPosts.length === 0 ? (
              <div className="flex h-32 flex-col items-center justify-center rounded-md border border-dashed">
                <FileText className="mb-2 h-8 w-8 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">
                  No posts generated yet
                </p>
                <Button variant="link" size="sm" className="mt-2" asChild>
                  <Link href={ROUTES.GENERATE}>
                    <Sparkles className="mr-1 h-3 w-3" />
                    Generate your first post
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {recentPosts.map((post) => (
                  <Link
                    key={post.id}
                    href={`${ROUTES.POSTS}/${post.id}`}
                    className="flex items-start gap-3 rounded-lg p-2 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-primary/10">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {post.content.length > 60
                          ? `${post.content.substring(0, 60)}...`
                          : post.content}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(post.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                        {post.platform && ` · ${post.platform.name}`}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
