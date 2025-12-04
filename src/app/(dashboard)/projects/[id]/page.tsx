"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProjectForm } from "@/components/forms/project-form";
import { useProject, useProjects } from "@/lib/hooks/use-projects";
import { ROUTES } from "@/config/constants";
import type { ProjectFormData } from "@/lib/utils/validation";

export default function EditProjectPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;

  const { project, isLoading: isLoadingProject, error } = useProject(projectId);
  const { updateProject } = useProjects();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: ProjectFormData) => {
    setIsSubmitting(true);
    const result = await updateProject(projectId, data);
    setIsSubmitting(false);

    if (result) {
      router.push(ROUTES.PROJECTS);
    }
  };

  if (isLoadingProject) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={ROUTES.PROJECTS}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Project Not Found
            </h1>
            <p className="text-muted-foreground">
              The project you&apos;re looking for doesn&apos;t exist or has been
              deleted.
            </p>
          </div>
        </div>
        <Button asChild>
          <Link href={ROUTES.PROJECTS}>Back to Projects</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={ROUTES.PROJECTS}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Project</h1>
          <p className="text-muted-foreground">
            Update the details of &quot;{project.name}&quot;.
          </p>
        </div>
      </div>

      <div className="w-full">
        <ProjectForm
          defaultValues={{
            name: project.name,
            description: project.description,
            audience: project.audience,
            keyMessages: project.keyMessages,
          }}
          onSubmit={handleSubmit}
          isLoading={isSubmitting}
          submitLabel="Save Changes"
        />
      </div>
    </div>
  );
}
