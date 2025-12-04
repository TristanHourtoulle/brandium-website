"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import { PlatformList } from "@/components/features/platforms";
import { usePlatforms } from "@/lib/hooks/use-platforms";
import { ROUTES } from "@/config/constants";

export default function PlatformsPage() {
  const { platforms, isLoading, deletePlatform } = usePlatforms();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Platforms"
        description="Configure social media platforms with style guidelines and character limits."
      >
        <Button asChild>
          <Link href={`${ROUTES.PLATFORMS}/new`}>
            <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
            Add Platform
          </Link>
        </Button>
      </PageHeader>

      <PlatformList
        platforms={platforms}
        isLoading={isLoading}
        onDelete={deletePlatform}
      />
    </div>
  );
}
