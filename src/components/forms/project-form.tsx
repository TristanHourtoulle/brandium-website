"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { projectSchema, type ProjectFormData } from "@/lib/utils/validation";

interface ProjectFormProps {
  defaultValues?: Partial<ProjectFormData>;
  onSubmit: (data: ProjectFormData) => Promise<void>;
  isLoading?: boolean;
  submitLabel?: string;
}

export function ProjectForm({
  defaultValues,
  onSubmit,
  isLoading = false,
  submitLabel = "Create Project",
}: ProjectFormProps) {
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
      name: defaultValues?.name ?? "",
      description: defaultValues?.description ?? "",
      audience: defaultValues?.audience ?? "",
      keyMessages: defaultValues?.keyMessages ?? [],
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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>
            Define the name and description for this project.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Project Name</Label>
            <Input
              id="name"
              placeholder="e.g., Product Launch 2024"
              {...register("name")}
              disabled={isLoading}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="description">Description</Label>
              <span className="text-xs text-muted-foreground">
                {watchedDescription?.length || 0}/500
              </span>
            </div>
            <Textarea
              id="description"
              placeholder="Describe the purpose and goals of this project..."
              className="min-h-[100px]"
              {...register("description")}
              disabled={isLoading}
            />
            {errors.description && (
              <p className="text-sm text-destructive">
                {errors.description.message}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Target Audience */}
      <Card>
        <CardHeader>
          <CardTitle>Target Audience</CardTitle>
          <CardDescription>
            Who is the primary audience for this project&apos;s content?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="audience">Audience</Label>
            <Input
              id="audience"
              placeholder="e.g., Tech professionals aged 25-45"
              {...register("audience")}
              disabled={isLoading}
            />
            {errors.audience && (
              <p className="text-sm text-destructive">
                {errors.audience.message}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Key Messages */}
      <Card>
        <CardHeader>
          <CardTitle>Key Messages</CardTitle>
          <CardDescription>
            Add the main talking points for this project (1-10 messages).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="e.g., Our product saves you 5 hours per week"
              value={newKeyMessage}
              onChange={(e) => setNewKeyMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading || (watchedKeyMessages?.length ?? 0) >= 10}
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={addKeyMessage}
              disabled={
                isLoading ||
                !newKeyMessage.trim() ||
                (watchedKeyMessages?.length ?? 0) >= 10
              }
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {errors.keyMessages && (
            <p className="text-sm text-destructive">
              {errors.keyMessages.message}
            </p>
          )}
          {watchedKeyMessages && watchedKeyMessages.length > 0 && (
            <ul className="space-y-2">
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
                    disabled={isLoading}
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
        </CardContent>
      </Card>

      {/* Submit */}
      <div className="flex justify-end gap-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
