"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PlatformForm } from "@/components/forms/platform-form";
import { usePlatform, usePlatforms } from "@/lib/hooks/use-platforms";
import { ROUTES } from "@/config/constants";
import type { PlatformFormData } from "@/lib/utils/validation";

export default function EditPlatformPage() {
  const router = useRouter();
  const params = useParams();
  const platformId = params.id as string;

  const {
    platform,
    isLoading: isLoadingPlatform,
    error,
  } = usePlatform(platformId);
  const { updatePlatform } = usePlatforms();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: PlatformFormData) => {
    setIsSubmitting(true);
    const result = await updatePlatform(platformId, data);
    setIsSubmitting(false);

    if (result) {
      router.push(ROUTES.PLATFORMS);
    }
  };

  if (isLoadingPlatform) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !platform) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={ROUTES.PLATFORMS}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Platform Not Found
            </h1>
            <p className="text-muted-foreground">
              The platform you&apos;re looking for doesn&apos;t exist or has
              been deleted.
            </p>
          </div>
        </div>
        <Button asChild>
          <Link href={ROUTES.PLATFORMS}>Back to Platforms</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={ROUTES.PLATFORMS}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Platform</h1>
          <p className="text-muted-foreground">
            Update the configuration for &quot;{platform.name}&quot;.
          </p>
        </div>
      </div>

      <div className="w-full">
        <PlatformForm
          defaultValues={{
            name: platform.name,
            styleGuidelines: platform.styleGuidelines,
            maxLength: platform.maxLength,
          }}
          onSubmit={handleSubmit}
          isLoading={isSubmitting}
          submitLabel="Save Changes"
        />
      </div>
    </div>
  );
}
