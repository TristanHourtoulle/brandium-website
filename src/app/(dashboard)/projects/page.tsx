"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import { ProjectList } from "@/components/features/projects";
import { useProjects } from "@/lib/hooks/use-projects";
import { ROUTES } from "@/config/constants";

export default function ProjectsPage() {
  const { projects, isLoading, deleteProject } = useProjects();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Projects"
        description="Organize your content around specific topics, products, or campaigns."
      >
        <Button asChild>
          <Link href={`${ROUTES.PROJECTS}/new`}>
            <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
            New Project
          </Link>
        </Button>
      </PageHeader>

      <ProjectList
        projects={projects}
        isLoading={isLoading}
        onDelete={deleteProject}
      />
    </div>
  );
}
