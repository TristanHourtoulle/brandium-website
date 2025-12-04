"use client";

import { useAuth } from "@/lib/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, User, Briefcase, Share2, FileText, LogOut } from "lucide-react";
import { APP_NAME } from "@/config/constants";

export default function DashboardPage() {
  const { user, logout } = useAuth();

  const stats = [
    { label: "Profiles", value: 0, icon: User },
    { label: "Projects", value: 0, icon: Briefcase },
    { label: "Platforms", value: 0, icon: Share2 },
    { label: "Posts", value: 0, icon: FileText },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back to {APP_NAME}, {user?.email}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="secondary">{user?.email}</Badge>
          <Button variant="outline" size="sm" onClick={logout}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.label}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
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
            <Button variant="outline" className="justify-start" disabled>
              <User className="mr-2 h-4 w-4" />
              Create a Profile
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
