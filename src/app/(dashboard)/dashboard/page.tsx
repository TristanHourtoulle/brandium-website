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
    <div className="space-y-6 md:space-y-8">
      {/* Welcome Section - more subtle background effects */}
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-primary/5 via-transparent to-transparent border border-primary/10 p-4 sm:p-6 md:p-8">
        <div className="absolute top-0 right-0 -mt-16 -mr-16 h-48 w-48 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-16 -ml-16 h-32 w-32 rounded-full bg-primary/5 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col gap-4 md:gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 transition-transform duration-200 hover:scale-105">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <span className="text-sm font-medium text-primary">Dashboard</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight md:text-3xl">
              {getGreeting()}
              {getUserName() && `, ${getUserName()}`}
            </h1>
            <p className="text-muted-foreground/90 max-w-lg text-sm sm:text-base">
              Ready to create engaging content? Start by generating a new post
              or manage your existing profiles and projects.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              size="lg"
              className="gap-2 shadow-lg shadow-primary/20 transition-all duration-200 hover:shadow-xl hover:shadow-primary/25"
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

      {/* Stats Grid - improved responsive */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.label} href={stat.href} className="group">
              <Card
                className="relative overflow-hidden hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.99]"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-xs sm:text-sm font-medium text-muted-foreground/90">
                        {stat.label}
                      </p>
                      {stat.isLoading ? (
                        <Skeleton className="h-7 sm:h-9 w-12 sm:w-16 animate-pulse" />
                      ) : (
                        <p className="text-2xl sm:text-3xl font-bold tracking-tight">
                          {stat.value}
                        </p>
                      )}
                    </div>
                    <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-primary/10 transition-all duration-300 group-hover:scale-110 group-hover:bg-primary/15">
                      <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                    </div>
                  </div>
                  <div className="mt-3 sm:mt-4 flex items-center gap-1 text-xs text-muted-foreground/80">
                    <span className="hidden sm:inline">View all {stat.label.toLowerCase()}</span>
                    <span className="sm:hidden">View</span>
                    <ArrowRight className="ml-auto h-3 w-3 transition-transform duration-300 group-hover:translate-x-1" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Main Content Grid - responsive */}
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-5">
        {/* Quick Actions */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3 sm:pb-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 transition-transform duration-200 hover:scale-105">
                <Plus className="h-4 w-4 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base sm:text-lg">Quick Actions</CardTitle>
                <CardDescription className="text-xs text-muted-foreground/90">
                  Get started with your personal brand
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 sm:space-y-3">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.label}
                  href={action.href}
                  className="group flex items-center gap-3 sm:gap-4 rounded-xl border border-transparent bg-muted/50 p-3 sm:p-4 transition-all duration-200 hover:border-border hover:bg-muted hover:shadow-sm active:scale-[0.99]"
                >
                  <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 transition-all duration-200 group-hover:bg-primary/15">
                    <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm">{action.label}</p>
                    <p className="text-xs text-muted-foreground/90 truncate">
                      {action.description}
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground/70 transition-all duration-200 group-hover:translate-x-1 group-hover:text-foreground" />
                </Link>
              );
            })}

            <div className="pt-2">
              <Button
                variant="outline"
                className="w-full gap-2 border-dashed transition-all duration-200 hover:border-primary/50 hover:bg-primary/5"
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
          <CardHeader className="pb-3 sm:pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 transition-transform duration-200 hover:scale-105">
                  <FileText className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base sm:text-lg">Recent Posts</CardTitle>
                  <CardDescription className="text-xs text-muted-foreground/90">
                    Your latest generated content
                  </CardDescription>
                </div>
              </div>
              {recentPosts.length > 0 && (
                <Button variant="ghost" size="sm" className="gap-1 transition-all duration-200" asChild>
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
              <div className="space-y-2 sm:space-y-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 sm:gap-4 rounded-xl bg-muted/50 p-3 sm:p-4"
                  >
                    <Skeleton className="h-10 w-10 sm:h-12 sm:w-12 rounded-full animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4 animate-pulse" />
                      <Skeleton className="h-3 w-1/2 animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            ) : recentPosts.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-muted-foreground/25 bg-muted/20 py-8 sm:py-12 px-4 sm:px-6 text-center">
                <div className="relative mb-4">
                  <div className="absolute inset-0 rounded-full bg-primary/10 blur-xl" />
                  <div className="relative flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-primary/10">
                    <FileText className="h-7 w-7 sm:h-8 sm:w-8 text-primary/50" />
                  </div>
                </div>
                <h3 className="font-semibold text-foreground mb-1">
                  No posts yet
                </h3>
                <p className="text-sm text-muted-foreground/90 mb-4 max-w-xs">
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
              <div className="space-y-2 sm:space-y-3">
                {recentPosts.map((post, index) => (
                  <Link
                    key={post.id}
                    href={`${ROUTES.POSTS}/${post.id}`}
                    className="group flex items-start gap-3 sm:gap-4 rounded-xl bg-muted/50 p-3 sm:p-4 transition-all duration-200 hover:bg-muted hover:shadow-sm active:scale-[0.99]"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 transition-all duration-200 group-hover:bg-primary/15">
                      <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium leading-relaxed line-clamp-2">
                        {post.content.length > 100
                          ? `${post.content.substring(0, 100)}...`
                          : post.content}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground/90">
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
                            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary px-2 py-0.5 text-xs font-medium">
                              {post.platform.name}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground/70 transition-all duration-200 group-hover:translate-x-1 group-hover:text-foreground mt-1" />
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
