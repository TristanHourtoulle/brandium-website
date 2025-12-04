"use client";

import { useState, useEffect } from "react";
import { Search, X, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { PostFilters } from "@/types";
import type { Profile, Project, Platform } from "@/types";

interface PostFiltersProps {
  filters: PostFilters;
  onFiltersChange: (filters: PostFilters) => void;
  onClearFilters: () => void;
  profiles?: Profile[];
  projects?: Project[];
  platforms?: Platform[];
}

const ALL_VALUE = "all";

export function PostFiltersComponent({
  filters,
  onFiltersChange,
  onClearFilters,
  profiles = [],
  projects = [],
  platforms = [],
}: PostFiltersProps) {
  const [searchValue, setSearchValue] = useState(filters.search || "");

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchValue !== filters.search) {
        onFiltersChange({ search: searchValue || undefined });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchValue, filters.search, onFiltersChange]);

  const hasActiveFilters =
    filters.search || filters.platformId || filters.profileId || filters.projectId;

  const handlePlatformChange = (value: string) => {
    onFiltersChange({
      platformId: value === ALL_VALUE ? undefined : value,
    });
  };

  const handleProfileChange = (value: string) => {
    onFiltersChange({
      profileId: value === ALL_VALUE ? undefined : value,
    });
  };

  const handleProjectChange = (value: string) => {
    onFiltersChange({
      projectId: value === ALL_VALUE ? undefined : value,
    });
  };

  const handleClearSearch = () => {
    setSearchValue("");
    onFiltersChange({ search: undefined });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        {/* Search input */}
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            type="search"
            placeholder="Search posts..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="pl-9 pr-9"
            aria-label="Search posts"
          />
          {searchValue && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2"
              onClick={handleClearSearch}
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Filter dropdowns */}
        <div className="flex flex-wrap gap-2">
          {platforms.length > 0 && (
            <Select
              value={filters.platformId || ALL_VALUE}
              onValueChange={handlePlatformChange}
            >
              <SelectTrigger className="w-[140px]" aria-label="Filter by platform">
                <SelectValue placeholder="Platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_VALUE}>All platforms</SelectItem>
                {platforms.map((platform) => (
                  <SelectItem key={platform.id} value={platform.id}>
                    {platform.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {profiles.length > 0 && (
            <Select
              value={filters.profileId || ALL_VALUE}
              onValueChange={handleProfileChange}
            >
              <SelectTrigger className="w-[140px]" aria-label="Filter by profile">
                <SelectValue placeholder="Profile" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_VALUE}>All profiles</SelectItem>
                {profiles.map((profile) => (
                  <SelectItem key={profile.id} value={profile.id}>
                    {profile.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {projects.length > 0 && (
            <Select
              value={filters.projectId || ALL_VALUE}
              onValueChange={handleProjectChange}
            >
              <SelectTrigger className="w-[140px]" aria-label="Filter by project">
                <SelectValue placeholder="Project" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_VALUE}>All projects</SelectItem>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchValue("");
                onClearFilters();
              }}
              className="gap-1"
            >
              <Filter className="h-4 w-4" aria-hidden="true" />
              Clear
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
