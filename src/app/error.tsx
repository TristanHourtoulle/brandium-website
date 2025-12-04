"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ROUTES } from "@/config/constants";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log error to console in development
    if (process.env.NODE_ENV === "development") {
      console.error("App error:", error);
    }
  }, [error]);

  const isDevelopment = process.env.NODE_ENV === "development";

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle
              className="h-8 w-8 text-destructive"
              aria-hidden="true"
            />
          </div>
          <CardTitle className="mt-4 text-2xl">Something went wrong</CardTitle>
          <CardDescription className="mt-2">
            We&apos;re sorry, but something unexpected happened. Please try
            again or return to the home page.
          </CardDescription>
        </CardHeader>

        {isDevelopment && error && (
          <CardContent>
            <div className="rounded-md bg-muted p-4 overflow-auto max-h-40">
              <p className="text-xs font-medium text-muted-foreground mb-1">
                Error details:
              </p>
              <code className="text-xs text-destructive break-all">
                {error.message}
              </code>
              {error.digest && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Digest: {error.digest}
                </p>
              )}
            </div>
          </CardContent>
        )}

        <CardFooter className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button onClick={reset} variant="default" className="w-full sm:w-auto">
            <RefreshCw className="mr-2 h-4 w-4" aria-hidden="true" />
            Try again
          </Button>
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link href={ROUTES.HOME}>
              <Home className="mr-2 h-4 w-4" aria-hidden="true" />
              Go to Home
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
