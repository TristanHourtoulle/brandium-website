"use client";

import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import * as projectsApi from "@/lib/api/projects";
import type { Project, CreateProjectDto, UpdateProjectDto } from "@/types";

interface UseProjectsReturn {
  projects: Project[];
  isLoading: boolean;
  error: string | null;
  fetchProjects: () => Promise<void>;
  createProject: (data: CreateProjectDto) => Promise<Project | null>;
  updateProject: (
    id: string,
    data: UpdateProjectDto
  ) => Promise<Project | null>;
  deleteProject: (id: string) => Promise<boolean>;
}

export function useProjects(): UseProjectsReturn {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await projectsApi.getProjects();
      setProjects(data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load projects";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createProject = useCallback(
    async (data: CreateProjectDto): Promise<Project | null> => {
      try {
        const newProject = await projectsApi.createProject(data);
        setProjects((prev) => [...prev, newProject]);
        toast.success("Project created successfully");
        return newProject;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to create project";
        toast.error(message);
        return null;
      }
    },
    []
  );

  const updateProject = useCallback(
    async (id: string, data: UpdateProjectDto): Promise<Project | null> => {
      try {
        const updatedProject = await projectsApi.updateProject(id, data);
        setProjects((prev) =>
          prev.map((p) => (p.id === id ? updatedProject : p))
        );
        toast.success("Project updated successfully");
        return updatedProject;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to update project";
        toast.error(message);
        return null;
      }
    },
    []
  );

  const deleteProject = useCallback(async (id: string): Promise<boolean> => {
    try {
      await projectsApi.deleteProject(id);
      setProjects((prev) => prev.filter((p) => p.id !== id));
      toast.success("Project deleted successfully");
      return true;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to delete project";
      toast.error(message);
      return false;
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return {
    projects,
    isLoading,
    error,
    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
  };
}

// Hook for fetching a single project
interface UseProjectReturn {
  project: Project | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useProject(id: string | null): UseProjectReturn {
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProject = useCallback(async () => {
    if (!id) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const data = await projectsApi.getProject(id);
      setProject(data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load project";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  return {
    project,
    isLoading,
    error,
    refetch: fetchProject,
  };
}
