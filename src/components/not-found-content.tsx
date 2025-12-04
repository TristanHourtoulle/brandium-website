"use client";

import Link from "next/link";
import { FileQuestion, Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES, APP_NAME } from "@/config/constants";
import { useAuth } from "@/lib/hooks/use-auth";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Skeleton } from "@/components/ui/skeleton";

function NotFoundMessage({ showDashboardLayout }: { showDashboardLayout: boolean }) {
  return (
    <div className={showDashboardLayout ? "flex flex-col items-center justify-center min-h-[calc(100vh-(--spacing(24)))]" : "flex min-h-screen flex-col items-center justify-center px-4"}>
      <div className="text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
          <FileQuestion className="h-10 w-10 text-primary" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">404</h1>
        <h2 className="mt-2 text-xl font-semibold">Page not found</h2>
        <p className="mt-4 max-w-md text-muted-foreground">
          Sorry, we couldn&apos;t find the page you&apos;re looking for. It
          might have been moved or deleted.
        </p>
        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Button asChild>
            <Link href={ROUTES.DASHBOARD}>
              <Home className="mr-2 h-4 w-4" />
              Go to Dashboard
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={showDashboardLayout ? ROUTES.PROFILES : ROUTES.HOME}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              {showDashboardLayout ? "Back to Profiles" : "Back to Home"}
            </Link>
          </Button>
        </div>
      </div>
      {!showDashboardLayout && (
        <p className="mt-12 text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} {APP_NAME}
        </p>
      )}
    </div>
  );
}

export function NotFoundContent() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="w-full max-w-4xl space-y-4 px-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <div className="flex min-h-screen bg-background">
        <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
          <Sidebar />
        </aside>
        <div className="flex flex-1 flex-col lg:pl-64">
          <MobileNav />
          <main className="flex-1 px-4 py-6 lg:px-8">
            <NotFoundMessage showDashboardLayout={true} />
          </main>
        </div>
      </div>
    );
  }

  return <NotFoundMessage showDashboardLayout={false} />;
}
