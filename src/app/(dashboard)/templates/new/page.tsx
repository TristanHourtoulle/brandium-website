"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TemplateEditor } from "@/components/features/templates";
import { ROUTES } from "@/config/constants";
import type { Template } from "@/types";

export default function NewTemplatePage() {
  const router = useRouter();

  const handleSave = useCallback(
    (template: Template) => {
      router.push(`${ROUTES.TEMPLATES}/${template.id}/edit`);
    },
    [router]
  );

  const handleCancel = useCallback(() => {
    router.push(ROUTES.TEMPLATES);
  }, [router]);

  return (
    <div className="container mx-auto py-6 px-4 md:py-8 space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={handleCancel}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Create Template</h1>
            <p className="text-muted-foreground">
              Build a reusable template for your posts
            </p>
          </div>
        </div>
      </div>

      {/* Editor */}
      <TemplateEditor onSave={handleSave} onCancel={handleCancel} />
    </div>
  );
}
