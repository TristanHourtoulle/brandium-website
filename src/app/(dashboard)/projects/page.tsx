"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProjectList } from "@/components/features/projects";
import { useProjects } from "@/lib/hooks/use-projects";
import { ROUTES } from "@/config/constants";

export default function ProjectsPage() {
  const { projects, isLoading, deleteProject } = useProjects();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground">
            Organize your content around specific topics, products, or
            campaigns.
          </p>
        </div>
        <Button asChild>
          <Link href={`${ROUTES.PROJECTS}/new`}>
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Link>
        </Button>
      </div>

      <ProjectList
        projects={projects}
        isLoading={isLoading}
        onDelete={deleteProject}
      />
    </div>
  );
}
