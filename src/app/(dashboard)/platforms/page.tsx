"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PlatformList } from "@/components/features/platforms";
import { usePlatforms } from "@/lib/hooks/use-platforms";
import { ROUTES } from "@/config/constants";

export default function PlatformsPage() {
  const { platforms, isLoading, deletePlatform } = usePlatforms();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Platforms</h1>
          <p className="text-muted-foreground">
            Configure social media platforms with style guidelines and character
            limits.
          </p>
        </div>
        <Button asChild>
          <Link href={`${ROUTES.PLATFORMS}/new`}>
            <Plus className="mr-2 h-4 w-4" />
            Add Platform
          </Link>
        </Button>
      </div>

      <PlatformList
        platforms={platforms}
        isLoading={isLoading}
        onDelete={deletePlatform}
      />
    </div>
  );
}
