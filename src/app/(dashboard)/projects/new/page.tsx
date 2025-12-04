"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProjectForm } from "@/components/forms/project-form";
import { useProjects } from "@/lib/hooks/use-projects";
import { ROUTES } from "@/config/constants";
import type { ProjectFormData } from "@/lib/utils/validation";

export default function NewProjectPage() {
  const router = useRouter();
  const { createProject } = useProjects();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: ProjectFormData) => {
    setIsSubmitting(true);
    const result = await createProject(data);
    setIsSubmitting(false);

    if (result) {
      router.push(ROUTES.PROJECTS);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={ROUTES.PROJECTS}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">New Project</h1>
          <p className="text-muted-foreground">
            Create a new project to organize your content strategy.
          </p>
        </div>
      </div>

      <div className="w-full">
        <ProjectForm
          onSubmit={handleSubmit}
          isLoading={isSubmitting}
          submitLabel="Create Project"
        />
      </div>
    </div>
  );
}
