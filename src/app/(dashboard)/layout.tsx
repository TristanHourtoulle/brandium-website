'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/hooks/use-auth';
import { ROUTES } from '@/config/constants';
import { Skeleton } from '@/components/ui/skeleton';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { OnboardingProvider } from '@/lib/providers/onboarding-provider';
import { OnboardingWizard } from '@/components/features/onboarding';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';

const routeLabels: Record<string, string> = {
  dashboard: 'Dashboard',
  profiles: 'Profiles',
  projects: 'Projects',
  platforms: 'Platforms',
  generate: 'Generate',
  posts: 'Posts',
  analytics: 'Analytics',
  templates: 'Templates',
  drafts: 'Drafts',
  published: 'Published',
};

function getBreadcrumbs(pathname: string) {
  const segments = pathname.split('/').filter(Boolean);
  const breadcrumbs: { label: string; href: string; isLast: boolean }[] = [];

  let currentPath = '';
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    const label = routeLabels[segment] || segment;
    breadcrumbs.push({
      label,
      href: currentPath,
      isLast: index === segments.length - 1,
    });
  });

  return breadcrumbs;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const breadcrumbs = getBreadcrumbs(pathname);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace(ROUTES.LOGIN);
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <div className='w-full max-w-4xl space-y-4 px-4'>
          <Skeleton className='h-16 w-full' />
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <Skeleton className='h-32' />
            <Skeleton className='h-32' />
            <Skeleton className='h-32' />
          </div>
          <Skeleton className='h-64 w-full' />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <OnboardingProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className='flex flex-col shrink-0'>
            <div className='flex h-12 items-center gap-2 px-4'>
              <SidebarTrigger className='-ml-1 hover:cursor-pointer hover:bg-blue-600/10 hover:text-blue-600 transition-colors' />
              <Separator orientation='vertical' className='mr-2 h-4' />
              <Breadcrumb>
                <BreadcrumbList>
                  {breadcrumbs.map((crumb) => (
                    <BreadcrumbItem key={crumb.href}>
                      {crumb.isLast ? (
                        <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                      ) : (
                        <>
                          <BreadcrumbLink href={crumb.href}>
                            {crumb.label}
                          </BreadcrumbLink>
                          <BreadcrumbSeparator />
                        </>
                      )}
                    </BreadcrumbItem>
                  ))}
                </BreadcrumbList>
              </Breadcrumb>
            </div>
            <Separator className='w-full' />
          </header>
          <main
            id='main-content'
            className='flex flex-1 flex-col gap-4 p-4'
            tabIndex={-1}
          >
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>

      {/* Onboarding Wizard Modal */}
      <OnboardingWizard />
    </OnboardingProvider>
  );
}
