import Link from "next/link";
import { User, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/config/constants";

export function ProfileEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-muted-foreground/25 bg-muted/10 py-12 sm:py-16 px-4 sm:px-6 text-center">
      <div className="relative mb-4">
        <div className="absolute inset-0 rounded-full bg-primary/10 blur-xl" />
        <div className="relative mx-auto flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-primary/10">
          <User className="h-8 w-8 sm:h-10 sm:w-10 text-primary/60" />
        </div>
      </div>
      <h3 className="text-lg sm:text-xl font-semibold">No profiles yet</h3>
      <p className="mt-2 mb-6 max-w-sm text-sm text-muted-foreground/90">
        Create your first profile to define your personal brand voice, tone, and
        content guidelines.
      </p>
      <Button
        asChild
        size="lg"
        className="gap-2 shadow-lg shadow-primary/20 transition-all duration-200 hover:shadow-xl hover:shadow-primary/25"
      >
        <Link href={`${ROUTES.PROFILES}/new`}>
          <Plus className="h-4 w-4" />
          Create Profile
        </Link>
      </Button>
    </div>
  );
}
