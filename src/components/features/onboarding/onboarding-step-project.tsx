"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { projectSchema, type ProjectFormData } from "@/lib/utils/validation";
import { useProjects } from "@/lib/hooks/use-projects";
import { useOnboardingContext } from "@/lib/providers/onboarding-provider";

interface OnboardingStepProjectProps {
  onComplete: () => void;
  onBack: () => void;
}

export function OnboardingStepProject({ onComplete, onBack }: OnboardingStepProjectProps) {
  const { createProject } = useProjects();
  const { setProjectData, data, setLoading, prevStep } = useOnboardingContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newKeyMessage, setNewKeyMessage] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: data.projectFormData?.name ?? "",
      description: data.projectFormData?.description ?? "",
      audience: data.projectFormData?.audience ?? "",
      keyMessages: data.projectFormData?.keyMessages ?? [],
    },
  });

  const watchedKeyMessages = watch("keyMessages");
  const watchedDescription = watch("description");

  const addKeyMessage = () => {
    if (newKeyMessage.trim()) {
      const current = watchedKeyMessages || [];
      if (current.length < 10) {
        setValue("keyMessages", [...current, newKeyMessage.trim()], {
          shouldValidate: true,
        });
        setNewKeyMessage("");
      }
    }
  };

  const removeKeyMessage = (index: number) => {
    const current = watchedKeyMessages || [];
    setValue(
      "keyMessages",
      current.filter((_, i) => i !== index),
      { shouldValidate: true }
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addKeyMessage();
    }
  };

  const onSubmit = async (formData: ProjectFormData) => {
    setIsSubmitting(true);
    setLoading(true);

    try {
      const project = await createProject({
        name: formData.name,
        description: formData.description,
        audience: formData.audience,
        keyMessages: formData.keyMessages,
      });

      if (project) {
        setProjectData(project, formData);
        onComplete();
      }
    } catch {
      toast.error("Failed to create project. Please try again.");
    } finally {
      setIsSubmitting(false);
      setLoading(false);
    }
  };

  const handleBack = () => {
    prevStep();
    onBack();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        {/* Project Name */}
        <div className="space-y-2">
          <Label htmlFor="name">Project Name</Label>
          <Input
            id="name"
            placeholder="e.g., Product Launch, Weekly Content"
            {...register("name")}
            disabled={isSubmitting}
          />
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name.message}</p>
          )}
          <p className="text-xs text-muted-foreground">
            What&apos;s the theme or purpose of this project?
          </p>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="description">Description</Label>
            <span className="text-xs text-muted-foreground">
              {watchedDescription?.length || 0}/500
            </span>
          </div>
          <Textarea
            id="description"
            placeholder="Describe the goals and context of this project..."
            className="min-h-[80px] resize-none"
            {...register("description")}
            disabled={isSubmitting}
          />
          {errors.description && (
            <p className="text-sm text-destructive">{errors.description.message}</p>
          )}
        </div>

        {/* Target Audience */}
        <div className="space-y-2">
          <Label htmlFor="audience">Target Audience</Label>
          <Input
            id="audience"
            placeholder="e.g., Tech professionals aged 25-45"
            {...register("audience")}
            disabled={isSubmitting}
          />
          {errors.audience && (
            <p className="text-sm text-destructive">{errors.audience.message}</p>
          )}
          <p className="text-xs text-muted-foreground">
            Who are you trying to reach?
          </p>
        </div>

        {/* Key Messages */}
        <div className="space-y-2">
          <Label>Key Messages</Label>
          <p className="text-xs text-muted-foreground mb-2">
            Add the main talking points (1-10 messages)
          </p>
          <div className="flex gap-2">
            <Input
              placeholder="e.g., We save you 5 hours per week"
              value={newKeyMessage}
              onChange={(e) => setNewKeyMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isSubmitting || (watchedKeyMessages?.length ?? 0) >= 10}
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={addKeyMessage}
              disabled={
                isSubmitting ||
                !newKeyMessage.trim() ||
                (watchedKeyMessages?.length ?? 0) >= 10
              }
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {errors.keyMessages && (
            <p className="text-sm text-destructive">{errors.keyMessages.message}</p>
          )}
          {watchedKeyMessages && watchedKeyMessages.length > 0 && (
            <ul className="space-y-2 mt-2">
              {watchedKeyMessages.map((message, index) => (
                <li
                  key={index}
                  className="flex items-center justify-between rounded-md border bg-muted/50 px-3 py-2"
                >
                  <span className="text-sm">{message}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => removeKeyMessage(index)}
                    disabled={isSubmitting}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
          <p className="text-xs text-muted-foreground">
            {watchedKeyMessages?.length ?? 0}/10 key messages
          </p>
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={handleBack} disabled={isSubmitting}>
          Back
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Create Project & Continue
        </Button>
      </div>
    </form>
  );
}
