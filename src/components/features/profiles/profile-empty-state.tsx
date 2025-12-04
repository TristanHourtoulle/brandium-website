import Link from "next/link";
import { User, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/config/constants";

export function ProfileEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center animate-in fade-in-50">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
        <User className="h-6 w-6 text-primary" />
      </div>
      <h3 className="mt-4 text-lg font-semibold">No profiles yet</h3>
      <p className="mt-2 mb-4 max-w-sm text-sm text-muted-foreground">
        Create your first profile to define your personal brand voice, tone, and
        content guidelines.
      </p>
      <Button asChild>
        <Link href={`${ROUTES.PROFILES}/new`}>
          <Plus className="mr-2 h-4 w-4" />
          Create Profile
        </Link>
      </Button>
    </div>
  );
}
