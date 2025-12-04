"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PlatformForm } from "@/components/forms/platform-form";
import { usePlatforms } from "@/lib/hooks/use-platforms";
import { ROUTES } from "@/config/constants";
import type { PlatformFormData } from "@/lib/utils/validation";

export default function NewPlatformPage() {
  const router = useRouter();
  const { createPlatform } = usePlatforms();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: PlatformFormData) => {
    setIsSubmitting(true);
    const result = await createPlatform(data);
    setIsSubmitting(false);

    if (result) {
      router.push(ROUTES.PLATFORMS);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={ROUTES.PLATFORMS}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add Platform</h1>
          <p className="text-muted-foreground">
            Configure a new social media platform for content generation.
          </p>
        </div>
      </div>

      <div className="w-full">
        <PlatformForm
          onSubmit={handleSubmit}
          isLoading={isSubmitting}
          submitLabel="Add Platform"
        />
      </div>
    </div>
  );
}
