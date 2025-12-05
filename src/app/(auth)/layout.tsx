"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/use-auth";
import { ROUTES, APP_NAME } from "@/config/constants";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles, Zap, TrendingUp, Users } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace(ROUTES.DASHBOARD);
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="w-full max-w-md space-y-4 px-4">
          <Skeleton className="h-8 w-32 mx-auto" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="flex min-h-screen">
      {/* Left side - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-blue-400/10 rounded-full blur-2xl animate-pulse delay-500" />
        </div>

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 text-white">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
              <Sparkles className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold">{APP_NAME}</span>
          </div>

          {/* Main content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl font-bold leading-tight">
                Build your personal brand with AI-powered content
              </h1>
              <p className="text-lg text-blue-100/80 max-w-md">
                Create engaging social media posts that resonate with your audience and grow your online presence.
              </p>
            </div>

            {/* Feature highlights */}
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-full bg-white/10 backdrop-blur-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
                  <Zap className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium">AI-Powered Generation</p>
                  <p className="text-sm text-blue-100/70">Create posts in seconds with smart AI</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-full bg-white/10 backdrop-blur-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium">Grow Your Audience</p>
                  <p className="text-sm text-blue-100/70">Optimized content for maximum engagement</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-full bg-white/10 backdrop-blur-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium">Personal Touch</p>
                  <p className="text-sm text-blue-100/70">Content that sounds like you</p>
                </div>
              </div>
            </div>
          </div>

          {/* Testimonial or social proof */}
          <div className="space-y-4">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                  <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                </svg>
              ))}
            </div>
            <blockquote className="text-blue-100/90 italic">
              &ldquo;Brandium transformed how I create content. I went from struggling with writer&apos;s block to posting consistently every day.&rdquo;
            </blockquote>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-400" />
              <div>
                <p className="font-medium text-sm">Sarah Johnson</p>
                <p className="text-xs text-blue-100/60">Marketing Consultant</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex w-full lg:w-1/2 items-center justify-center bg-background p-6 sm:p-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <span className="text-xl font-bold">{APP_NAME}</span>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
