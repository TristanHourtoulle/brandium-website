"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import { ProfileList } from "@/components/features/profiles";
import { useProfiles } from "@/lib/hooks/use-profiles";
import { ROUTES } from "@/config/constants";

export default function ProfilesPage() {
  const { profiles, isLoading, deleteProfile } = useProfiles();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Profiles"
        description="Manage your personal brand profiles and voice guidelines."
      >
        <Button asChild>
          <Link href={`${ROUTES.PROFILES}/new`}>
            <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
            New Profile
          </Link>
        </Button>
      </PageHeader>

      <ProfileList
        profiles={profiles}
        isLoading={isLoading}
        onDelete={deleteProfile}
      />
    </div>
  );
}
