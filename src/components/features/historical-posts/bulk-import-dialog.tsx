"use client";

import { useState } from "react";
import { Loader2, AlertCircle, CheckCircle2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { Platform, BulkImportResponse, CreateHistoricalPostDto } from "@/types";

interface BulkImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (posts: { posts: CreateHistoricalPostDto[] }) => Promise<BulkImportResponse | null>;
  platforms: Platform[];
  isLoading?: boolean;
}

const EXAMPLE_JSON = `[
  {
    "content": "Your post content here...",
    "publishedAt": "2024-01-15T10:30:00Z",
    "engagement": {
      "likes": 100,
      "comments": 10
    }
  }
]`;

export function BulkImportDialog({
  open,
  onOpenChange,
  onImport,
  platforms,
  isLoading = false,
}: BulkImportDialogProps) {
  const [jsonInput, setJsonInput] = useState("");
  const [defaultPlatformId, setDefaultPlatformId] = useState<string>("");
  const [parseError, setParseError] = useState<string | null>(null);
  const [importResult, setImportResult] = useState<BulkImportResponse | null>(null);

  const handleImport = async () => {
    setParseError(null);
    setImportResult(null);

    let posts: CreateHistoricalPostDto[];

    try {
      const parsed = JSON.parse(jsonInput);

      if (!Array.isArray(parsed)) {
        setParseError("Input must be a JSON array of posts");
        return;
      }

      if (parsed.length === 0) {
        setParseError("At least one post is required");
        return;
      }

      if (parsed.length > 100) {
        setParseError("Maximum 100 posts allowed per import");
        return;
      }

      // Add default platform if selected
      posts = parsed.map((post) => ({
        ...post,
        platformId: post.platformId || defaultPlatformId || undefined,
      }));
    } catch {
      setParseError("Invalid JSON format. Please check your input.");
      return;
    }

    const result = await onImport({ posts });
    if (result) {
      setImportResult(result);
      if (result.failed === 0) {
        // Clear form on complete success
        setJsonInput("");
        setDefaultPlatformId("");
      }
    }
  };

  const handleClose = () => {
    setJsonInput("");
    setDefaultPlatformId("");
    setParseError(null);
    setImportResult(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bulk Import Historical Posts</DialogTitle>
          <DialogDescription>
            Import multiple posts at once by pasting JSON data. Maximum 100 posts
            per import.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Default Platform */}
          <div className="space-y-2">
            <Label htmlFor="defaultPlatform">Default Platform (Optional)</Label>
            <Select
              value={defaultPlatformId}
              onValueChange={setDefaultPlatformId}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select default platform for all posts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">None</SelectItem>
                {platforms.map((platform) => (
                  <SelectItem key={platform.id} value={platform.id}>
                    {platform.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              This will be applied to posts without a platformId
            </p>
          </div>

          {/* JSON Input */}
          <div className="space-y-2">
            <Label htmlFor="jsonInput">Posts JSON</Label>
            <Textarea
              id="jsonInput"
              placeholder={EXAMPLE_JSON}
              className="min-h-[200px] font-mono text-sm"
              value={jsonInput}
              onChange={(e) => {
                setJsonInput(e.target.value);
                setParseError(null);
              }}
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              Paste a JSON array of posts. Each post should have at least a
              &quot;content&quot; field.
            </p>
          </div>

          {/* Example */}
          <div className="space-y-2">
            <Label>Example Format</Label>
            <pre className="rounded-md bg-muted p-3 text-xs overflow-x-auto">
              {EXAMPLE_JSON}
            </pre>
          </div>

          {/* Parse Error */}
          {parseError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{parseError}</AlertDescription>
            </Alert>
          )}

          {/* Import Result */}
          {importResult && (
            <Alert variant={importResult.failed > 0 ? "destructive" : "default"}>
              {importResult.failed > 0 ? (
                <AlertCircle className="h-4 w-4" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              <AlertTitle>Import Complete</AlertTitle>
              <AlertDescription className="space-y-2">
                <p>
                  {importResult.created} posts imported successfully
                  {importResult.failed > 0 && `, ${importResult.failed} failed`}
                </p>
                {importResult.errors && importResult.errors.length > 0 && (
                  <ul className="list-disc list-inside text-sm">
                    {importResult.errors.slice(0, 5).map((error, i) => (
                      <li key={i}>
                        Post #{error.index + 1}: {error.reason}
                      </li>
                    ))}
                    {importResult.errors.length > 5 && (
                      <li>...and {importResult.errors.length - 5} more errors</li>
                    )}
                  </ul>
                )}
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
          >
            {importResult?.failed === 0 ? "Done" : "Cancel"}
          </Button>
          {(!importResult || importResult.failed > 0) && (
            <Button
              onClick={handleImport}
              disabled={isLoading || !jsonInput.trim()}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Upload className="mr-2 h-4 w-4" />
              Import Posts
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
