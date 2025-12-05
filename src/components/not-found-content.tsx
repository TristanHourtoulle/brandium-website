"use client";

import Link from "next/link";
import { FileQuestion, Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES, APP_NAME } from "@/config/constants";
import { useAuth } from "@/lib/hooks/use-auth";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

function NotFoundMessage({
  showDashboardLayout,
}: {
  showDashboardLayout: boolean;
}) {
  return (
    <div
      className={
        showDashboardLayout
          ? "flex flex-col items-center justify-center min-h-[calc(100vh-5rem)]"
          : "flex min-h-screen flex-col items-center justify-center px-4"
      }
    >
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
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex flex-col shrink-0">
            <div className="flex h-16 items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbPage>Not Found</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
            <Separator className="w-full" />
          </header>
          <main className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <NotFoundMessage showDashboardLayout={true} />
          </main>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  return <NotFoundMessage showDashboardLayout={false} />;
}
