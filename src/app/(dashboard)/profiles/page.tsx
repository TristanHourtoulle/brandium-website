"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProfileList } from "@/components/features/profiles";
import { useProfiles } from "@/lib/hooks/use-profiles";
import { ROUTES } from "@/config/constants";

export default function ProfilesPage() {
  const { profiles, isLoading, deleteProfile } = useProfiles();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Profiles</h1>
          <p className="text-muted-foreground">
            Manage your personal brand profiles and voice guidelines.
          </p>
        </div>
        <Button asChild>
          <Link href={`${ROUTES.PROFILES}/new`}>
            <Plus className="mr-2 h-4 w-4" />
            New Profile
          </Link>
        </Button>
      </div>

      <ProfileList
        profiles={profiles}
        isLoading={isLoading}
        onDelete={deleteProfile}
      />
    </div>
  );
}
