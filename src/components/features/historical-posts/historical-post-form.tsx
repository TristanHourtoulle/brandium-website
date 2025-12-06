"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  historicalPostSchema,
  type HistoricalPostFormData,
} from "@/lib/utils/validation";
import type { HistoricalPost, Platform } from "@/types";

interface HistoricalPostFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: HistoricalPostFormData) => Promise<void>;
  platforms: Platform[];
  defaultValues?: Partial<HistoricalPost>;
  isLoading?: boolean;
  mode?: "create" | "edit";
}

export function HistoricalPostForm({
  open,
  onOpenChange,
  onSubmit,
  platforms,
  defaultValues,
  isLoading = false,
  mode = "create",
}: HistoricalPostFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<HistoricalPostFormData>({
    resolver: zodResolver(historicalPostSchema),
    defaultValues: {
      content: defaultValues?.content ?? "",
      platformId: defaultValues?.platformId ?? undefined,
      publishedAt: defaultValues?.publishedAt
        ? new Date(defaultValues.publishedAt).toISOString().slice(0, 16)
        : undefined,
      externalUrl: defaultValues?.externalUrl ?? "",
      engagement: defaultValues?.engagement ?? {
        likes: undefined,
        comments: undefined,
        shares: undefined,
        views: undefined,
      },
    },
  });

  const watchedContent = watch("content");
  const watchedPlatformId = watch("platformId");

  const handleFormSubmit = async (data: HistoricalPostFormData) => {
    await onSubmit(data);
    reset();
    onOpenChange(false);
  };

  const handleClose = () => {
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Add Historical Post" : "Edit Historical Post"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Add a past social media post to help the AI learn your writing style."
              : "Update the details of this historical post."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Content */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="content">Post Content *</Label>
              <span className="text-xs text-muted-foreground">
                {watchedContent?.length || 0}/50000
              </span>
            </div>
            <Textarea
              id="content"
              placeholder="Paste your original post content here..."
              className="min-h-[150px]"
              {...register("content")}
              disabled={isLoading}
            />
            {errors.content && (
              <p className="text-sm text-destructive">{errors.content.message}</p>
            )}
          </div>

          {/* Platform & Date */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="platformId">Platform</Label>
              <Select
                value={watchedPlatformId ?? ""}
                onValueChange={(value) =>
                  setValue("platformId", value || undefined)
                }
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent>
                  {platforms.map((platform) => (
                    <SelectItem key={platform.id} value={platform.id}>
                      {platform.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="publishedAt">Published Date</Label>
              <Input
                id="publishedAt"
                type="datetime-local"
                {...register("publishedAt")}
                disabled={isLoading}
              />
            </div>
          </div>

          {/* External URL */}
          <div className="space-y-2">
            <Label htmlFor="externalUrl">Original Post URL</Label>
            <Input
              id="externalUrl"
              type="url"
              placeholder="https://linkedin.com/posts/..."
              {...register("externalUrl")}
              disabled={isLoading}
            />
            {errors.externalUrl && (
              <p className="text-sm text-destructive">
                {errors.externalUrl.message}
              </p>
            )}
          </div>

          {/* Engagement Metrics */}
          <div className="space-y-3">
            <Label>Engagement Metrics (Optional)</Label>
            <div className="grid gap-4 sm:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="likes" className="text-xs text-muted-foreground">
                  Likes
                </Label>
                <Input
                  id="likes"
                  type="number"
                  min="0"
                  placeholder="0"
                  {...register("engagement.likes", { valueAsNumber: true })}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="comments"
                  className="text-xs text-muted-foreground"
                >
                  Comments
                </Label>
                <Input
                  id="comments"
                  type="number"
                  min="0"
                  placeholder="0"
                  {...register("engagement.comments", { valueAsNumber: true })}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shares" className="text-xs text-muted-foreground">
                  Shares
                </Label>
                <Input
                  id="shares"
                  type="number"
                  min="0"
                  placeholder="0"
                  {...register("engagement.shares", { valueAsNumber: true })}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="views" className="text-xs text-muted-foreground">
                  Views
                </Label>
                <Input
                  id="views"
                  type="number"
                  min="0"
                  placeholder="0"
                  {...register("engagement.views", { valueAsNumber: true })}
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === "create" ? "Add Post" : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
