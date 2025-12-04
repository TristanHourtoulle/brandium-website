"use client";

import Link from "next/link";
import { useAuth } from "@/lib/hooks/use-auth";
import { useProfiles } from "@/lib/hooks/use-profiles";
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
} from "lucide-react";
import { APP_NAME, ROUTES } from "@/config/constants";

export default function DashboardPage() {
  const { user } = useAuth();
  const { profiles, isLoading: profilesLoading } = useProfiles();

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
      value: 0,
      icon: Briefcase,
      href: ROUTES.PROJECTS,
      isLoading: false,
    },
    {
      label: "Platforms",
      value: 0,
      icon: Share2,
      href: ROUTES.PLATFORMS,
      isLoading: false,
    },
    {
      label: "Posts",
      value: 0,
      icon: FileText,
      href: ROUTES.POSTS,
      isLoading: false,
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back to {APP_NAME}
          {user?.email ? `, ${user.email}` : ""}
        </p>
      </div>

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
            <Button variant="outline" className="justify-start" disabled>
              <Briefcase className="mr-2 h-4 w-4" />
              Add a Project
            </Button>
            <Button variant="outline" className="justify-start" disabled>
              <Share2 className="mr-2 h-4 w-4" />
              Configure a Platform
            </Button>
            <Button className="justify-start" disabled>
              <Sparkles className="mr-2 h-4 w-4" />
              Generate Content
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Posts</CardTitle>
            <CardDescription>Your latest generated content</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex h-32 items-center justify-center rounded-md border border-dashed">
              <p className="text-sm text-muted-foreground">
                No posts generated yet
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
