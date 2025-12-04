"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/use-auth";
import { ROUTES } from "@/config/constants";
import { Skeleton } from "@/components/ui/skeleton";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { OnboardingProvider } from "@/lib/providers/onboarding-provider";
import { OnboardingWizard } from "@/components/features/onboarding";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace(ROUTES.LOGIN);
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="w-full max-w-4xl space-y-4 px-4">
          <Skeleton className="h-16 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <OnboardingProvider>
      <div className="flex min-h-screen bg-background">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
          <Sidebar />
        </aside>

        {/* Main Content */}
        <div className="flex flex-1 flex-col lg:pl-64">
          {/* Mobile Header */}
          <MobileNav />

          {/* Page Content */}
          <main id="main-content" className="flex-1 px-4 py-6 lg:px-8" tabIndex={-1}>
            {children}
          </main>
        </div>
      </div>

      {/* Onboarding Wizard Modal */}
      <OnboardingWizard />
    </OnboardingProvider>
  );
}
