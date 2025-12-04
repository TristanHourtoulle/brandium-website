"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/config/constants";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function DashboardError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log error to console in development
    if (process.env.NODE_ENV === "development") {
      console.error("Dashboard error:", error);
    }
  }, [error]);

  const isDevelopment = process.env.NODE_ENV === "development";

  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
          <AlertTriangle className="h-10 w-10 text-destructive" aria-hidden="true" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight">Error</h1>
        <h2 className="mt-2 text-xl font-semibold">Something went wrong</h2>
        <p className="mt-4 max-w-md text-muted-foreground">
          An error occurred while loading this page. Please try again or go back
          to the dashboard.
        </p>
        {isDevelopment && error && (
          <div className="mt-4 rounded-md bg-muted p-3 overflow-auto max-h-32 text-left">
            <code className="text-xs text-destructive break-all">
              {error.message}
            </code>
          </div>
        )}
        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Button onClick={reset}>
            <RefreshCw className="mr-2 h-4 w-4" aria-hidden="true" />
            Try again
          </Button>
          <Button variant="outline" asChild>
            <Link href={ROUTES.DASHBOARD}>
              <Home className="mr-2 h-4 w-4" aria-hidden="true" />
              Go to Dashboard
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
