"use client";

import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { IdeaFilters } from "@/types";
import type { Profile, Project, Platform } from "@/types";

interface IdeaFiltersProps {
  filters: IdeaFilters;
  onFiltersChange: (filters: IdeaFilters) => void;
  onClearFilters: () => void;
  profiles?: Profile[];
  projects?: Project[];
  platforms?: Platform[];
}

const ALL_VALUE = "all";
const USED_VALUE = "used";
const UNUSED_VALUE = "unused";

export function IdeaFiltersComponent({
  filters,
  onFiltersChange,
  onClearFilters,
  profiles = [],
  projects = [],
  platforms = [],
}: IdeaFiltersProps) {
  const hasActiveFilters =
    filters.platformId ||
    filters.profileId ||
    filters.projectId ||
    filters.isUsed !== undefined;

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

  const handleUsedChange = (value: string) => {
    let isUsed: boolean | undefined;
    if (value === USED_VALUE) {
      isUsed = true;
    } else if (value === UNUSED_VALUE) {
      isUsed = false;
    } else {
      isUsed = undefined;
    }
    onFiltersChange({ isUsed });
  };

  const getUsedValue = () => {
    if (filters.isUsed === true) return USED_VALUE;
    if (filters.isUsed === false) return UNUSED_VALUE;
    return ALL_VALUE;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        {/* Filter dropdowns */}
        <div className="flex flex-wrap gap-2">
          {platforms.length > 0 && (
            <Select
              value={filters.platformId || ALL_VALUE}
              onValueChange={handlePlatformChange}
            >
              <SelectTrigger
                className="w-[140px]"
                aria-label="Filter by platform"
              >
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
              <SelectTrigger
                className="w-[140px]"
                aria-label="Filter by profile"
              >
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
              <SelectTrigger
                className="w-[140px]"
                aria-label="Filter by project"
              >
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

          <Select value={getUsedValue()} onValueChange={handleUsedChange}>
            <SelectTrigger className="w-[120px]" aria-label="Filter by status">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_VALUE}>All ideas</SelectItem>
              <SelectItem value={UNUSED_VALUE}>Unused</SelectItem>
              <SelectItem value={USED_VALUE}>Used</SelectItem>
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
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
