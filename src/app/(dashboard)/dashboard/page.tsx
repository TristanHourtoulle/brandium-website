"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/hooks/use-auth";
import { useProfiles } from "@/lib/hooks/use-profiles";
import { useProjects } from "@/lib/hooks/use-projects";
import { usePlatforms } from "@/lib/hooks/use-platforms";
import { usePosts } from "@/lib/hooks/use-posts";
import { usePostIdeas } from "@/lib/hooks/use-post-ideas";
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
import {
  Sparkles,
  User,
  Briefcase,
  Share2,
  FileText,
  Plus,
  ArrowRight,
  Zap,
  Lightbulb,
} from "lucide-react";
import { ROUTES } from "@/config/constants";

export default function DashboardPage() {
  const { user } = useAuth();
  const { profiles, isLoading: profilesLoading } = useProfiles();
  const { projects, isLoading: projectsLoading } = useProjects();
  const { platforms, isLoading: platformsLoading } = usePlatforms();
  const { posts, isLoading: postsLoading, pagination } = usePosts();
  const { isLoading: ideasLoading, pagination: ideasPagination } = usePostIdeas();
  const { openOnboarding, isOpen: isOnboardingOpen } = useOnboardingContext();

  const recentPosts = posts.slice(0, 3);

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
  }, [
    isDataLoaded,
    profiles.length,
    projects.length,
    pagination.totalItems,
    openOnboarding,
    isOnboardingOpen,
  ]);

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
      label: "Ideas",
      value: ideasPagination.totalItems,
      icon: Lightbulb,
      href: ROUTES.IDEAS,
      isLoading: ideasLoading,
    },
    {
      label: "Posts",
      value: pagination.totalItems,
      icon: FileText,
      href: ROUTES.POSTS,
      isLoading: postsLoading,
    },
  ];

  const quickActions = [
    {
      label: "Create Profile",
      description: "Set up your personal brand identity",
      icon: User,
      href: `${ROUTES.PROFILES}/new`,
    },
    {
      label: "Add Project",
      description: "Showcase your work and achievements",
      icon: Briefcase,
      href: `${ROUTES.PROJECTS}/new`,
    },
    {
      label: "Configure Platform",
      description: "Connect your social media accounts",
      icon: Share2,
      href: `${ROUTES.PLATFORMS}/new`,
    },
  ];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const getUserName = () => {
    if (!user?.email) return "";
    const name = user.email.split("@")[0];
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-primary/10 via-primary/5 to-transparent border border-primary/10 p-6 md:p-8">
        <div className="absolute top-0 right-0 -mt-16 -mr-16 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 -mb-16 -ml-16 h-48 w-48 rounded-full bg-primary/5 blur-2xl" />

        <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <span className="text-sm font-medium text-primary">Dashboard</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              {getGreeting()}
              {getUserName() && `, ${getUserName()}`}
            </h1>
            <p className="text-muted-foreground max-w-lg">
              Ready to create engaging content? Start by generating a new post
              or manage your existing profiles and projects.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              size="lg"
              className="gap-2 shadow-lg shadow-primary/20"
              asChild
            >
              <Link href={ROUTES.GENERATE}>
                <Zap className="h-4 w-4" />
                Generate Content
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.label} href={stat.href} className="group">
              <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">
                        {stat.label}
                      </p>
                      {stat.isLoading ? (
                        <Skeleton className="h-9 w-16" />
                      ) : (
                        <p className="text-3xl font-bold tracking-tight">
                          {stat.value}
                        </p>
                      )}
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 transition-transform duration-300 group-hover:scale-110">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-1 text-xs text-muted-foreground">
                    <span>View all {stat.label.toLowerCase()}</span>
                    <ArrowRight className="ml-auto h-3 w-3 transition-transform duration-300 group-hover:translate-x-1" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Quick Actions */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                <Plus className="h-4 w-4 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
                <CardDescription className="text-xs">
                  Get started with your personal brand
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.label}
                  href={action.href}
                  className="group flex items-center gap-4 rounded-xl border border-transparent bg-muted/50 p-4 transition-all duration-200 hover:border-border hover:bg-muted"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm">{action.label}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {action.description}
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform duration-200 group-hover:translate-x-1 group-hover:text-foreground" />
                </Link>
              );
            })}

            <div className="pt-2">
              <Button
                variant="outline"
                className="w-full gap-2 border-dashed"
                asChild
              >
                <Link href={ROUTES.GENERATE}>
                  <Sparkles className="h-4 w-4" />
                  Generate your first post
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Posts */}
        <Card className="lg:col-span-3">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                  <FileText className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">Recent Posts</CardTitle>
                  <CardDescription className="text-xs">
                    Your latest generated content
                  </CardDescription>
                </div>
              </div>
              {recentPosts.length > 0 && (
                <Button variant="ghost" size="sm" className="gap-1" asChild>
                  <Link href={ROUTES.POSTS}>
                    View all
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {postsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex items-start gap-4 rounded-xl bg-muted/50 p-4"
                  >
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : recentPosts.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-muted-foreground/25 bg-muted/20 py-12 px-6 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
                  <FileText className="h-8 w-8 text-primary/50" />
                </div>
                <h3 className="font-semibold text-foreground mb-1">
                  No posts yet
                </h3>
                <p className="text-sm text-muted-foreground mb-4 max-w-xs">
                  Start creating engaging content for your personal brand with
                  AI-powered generation.
                </p>
                <Button size="sm" className="gap-2" asChild>
                  <Link href={ROUTES.GENERATE}>
                    <Sparkles className="h-4 w-4" />
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
                    className="group flex items-start gap-4 rounded-xl bg-muted/50 p-4 transition-all duration-200 hover:bg-muted"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium leading-relaxed line-clamp-2">
                        {post.content.length > 100
                          ? `${post.content.substring(0, 100)}...`
                          : post.content}
                      </p>
                      <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                        <span>
                          {new Date(post.createdAt).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            }
                          )}
                        </span>
                        {post.platform && (
                          <>
                            <span className="text-muted-foreground/50">·</span>
                            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary px-2 py-0.5 text-xs">
                              {post.platform.name}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 group-hover:translate-x-1 group-hover:text-foreground mt-1" />
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
