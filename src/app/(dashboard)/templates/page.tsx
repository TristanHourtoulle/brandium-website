"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  Filter,
  LayoutGrid,
  List,
  FileText,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { TemplateCardGrid } from "@/components/features/templates";
import { useTemplates } from "@/lib/hooks/use-templates";
import { useAuth } from "@/lib/hooks/use-auth";
import { ROUTES } from "@/config/constants";
import type { Template, TemplateCategory } from "@/types";
import { getAllTemplateCategories, getTemplateCategoryInfo } from "@/lib/api/templates";

type ViewMode = "grid" | "list";
type FilterType = "all" | "system" | "public" | "mine";

export default function TemplatesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | "all">("all");
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [templateToDelete, setTemplateToDelete] = useState<Template | null>(null);

  const {
    templates,
    isLoading,
    deleteTemplate,
    duplicateTemplate,
    filterByCategory,
    filterByType,
    search,
    hasMore,
    loadMore,
  } = useTemplates();

  // Debounced search - track if user has started typing
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);
      setHasSearched(true);
    },
    []
  );

  // Debounce search API call - only trigger after user interaction
  useEffect(() => {
    if (!hasSearched) return;

    const timeoutId = setTimeout(() => {
      search(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, hasSearched]);

  const handleCategoryChange = useCallback(
    (category: string) => {
      setSelectedCategory(category as TemplateCategory | "all");
      filterByCategory(category === "all" ? null : (category as TemplateCategory));
    },
    [filterByCategory]
  );

  const handleFilterTypeChange = useCallback(
    (type: FilterType) => {
      setFilterType(type);
      filterByType(type);
    },
    [filterByType]
  );

  const handleCreateTemplate = useCallback(() => {
    router.push(`${ROUTES.TEMPLATES}/new`);
  }, [router]);

  const handleEditTemplate = useCallback(
    (template: Template) => {
      router.push(`${ROUTES.TEMPLATES}/${template.id}/edit`);
    },
    [router]
  );

  const handleUseTemplate = useCallback(
    (template: Template) => {
      router.push(`${ROUTES.GENERATE}?templateId=${template.id}`);
    },
    [router]
  );

  const handleDuplicateTemplate = useCallback(
    async (template: Template) => {
      const newTemplate = await duplicateTemplate(template.id);
      if (newTemplate) {
        router.push(`${ROUTES.TEMPLATES}/${newTemplate.id}/edit`);
      }
    },
    [duplicateTemplate, router]
  );

  const handleDeleteTemplate = useCallback(async () => {
    if (!templateToDelete) return;

    const success = await deleteTemplate(templateToDelete.id);
    if (success) {
      setTemplateToDelete(null);
    }
  }, [templateToDelete, deleteTemplate]);

  return (
    <div className="container mx-auto py-6 px-4 md:py-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Templates</h1>
            <p className="text-muted-foreground">
              Create and manage your post templates
            </p>
          </div>
        </div>
        <Button onClick={handleCreateTemplate}>
          <Plus className="h-4 w-4 mr-2" />
          New Template
        </Button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Category Filter */}
        <Select value={selectedCategory} onValueChange={handleCategoryChange}>
          <SelectTrigger className="w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {getAllTemplateCategories().map((cat) => {
              const info = getTemplateCategoryInfo(cat);
              return (
                <SelectItem key={cat} value={cat}>
                  {info.label}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>

        {/* Type Filter Tabs */}
        <Tabs value={filterType} onValueChange={(v) => handleFilterTypeChange(v as FilterType)}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
            <TabsTrigger value="public">Public</TabsTrigger>
            <TabsTrigger value="mine">My Templates</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 ml-auto">
          <Button
            variant={viewMode === "grid" ? "secondary" : "ghost"}
            size="icon"
            onClick={() => setViewMode("grid")}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "secondary" : "ghost"}
            size="icon"
            onClick={() => setViewMode("list")}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Templates Grid */}
      <TemplateCardGrid
        templates={templates}
        userId={user?.id}
        onEdit={handleEditTemplate}
        onDuplicate={handleDuplicateTemplate}
        onDelete={setTemplateToDelete}
        onUse={handleUseTemplate}
        isLoading={isLoading}
        compact={viewMode === "list"}
        emptyMessage={
          searchQuery
            ? "No templates match your search"
            : filterType === "mine"
              ? "You haven't created any templates yet"
              : "No templates available"
        }
      />

      {/* Load More */}
      {hasMore && !isLoading && (
        <div className="flex justify-center pt-4">
          <Button variant="outline" onClick={loadMore}>
            <Loader2 className="h-4 w-4 mr-2" />
            Load More
          </Button>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!templateToDelete}
        onOpenChange={(open) => !open && setTemplateToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Template</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{templateToDelete?.name}&quot;? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTemplate}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
