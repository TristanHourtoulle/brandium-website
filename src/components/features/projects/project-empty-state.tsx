import Link from "next/link";
import { Briefcase, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/config/constants";

export function ProjectEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center animate-in fade-in-50">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
        <Briefcase className="h-6 w-6 text-primary" />
      </div>
      <h3 className="mt-4 text-lg font-semibold">No projects yet</h3>
      <p className="mt-2 mb-4 max-w-sm text-sm text-muted-foreground">
        Create your first project to organize your content around specific
        topics, products, or campaigns.
      </p>
      <Button asChild>
        <Link href={`${ROUTES.PROJECTS}/new`}>
          <Plus className="mr-2 h-4 w-4" />
          Create Project
        </Link>
      </Button>
    </div>
  );
}
