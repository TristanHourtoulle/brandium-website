"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProfileForm } from "@/components/forms/profile-form";
import { useProfiles } from "@/lib/hooks/use-profiles";
import { ROUTES } from "@/config/constants";
import type { ProfileFormData } from "@/lib/utils/validation";

export default function NewProfilePage() {
  const router = useRouter();
  const { createProfile } = useProfiles();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: ProfileFormData) => {
    setIsSubmitting(true);
    const result = await createProfile(data);
    setIsSubmitting(false);

    if (result) {
      router.push(ROUTES.PROFILES);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={ROUTES.PROFILES}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Profile</h1>
          <p className="text-muted-foreground">
            Define a new personal brand profile with voice guidelines.
          </p>
        </div>
      </div>

      <div className="w-full">
        <ProfileForm
          onSubmit={handleSubmit}
          isLoading={isSubmitting}
          submitLabel="Create Profile"
        />
      </div>
    </div>
  );
}
