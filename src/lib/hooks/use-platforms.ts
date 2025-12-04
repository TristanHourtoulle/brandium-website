"use client";

import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import * as platformsApi from "@/lib/api/platforms";
import type { Platform, CreatePlatformDto, UpdatePlatformDto } from "@/types";

interface UsePlatformsReturn {
  platforms: Platform[];
  isLoading: boolean;
  error: string | null;
  fetchPlatforms: () => Promise<void>;
  createPlatform: (data: CreatePlatformDto) => Promise<Platform | null>;
  updatePlatform: (
    id: string,
    data: UpdatePlatformDto
  ) => Promise<Platform | null>;
  deletePlatform: (id: string) => Promise<boolean>;
}

export function usePlatforms(): UsePlatformsReturn {
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlatforms = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await platformsApi.getPlatforms();
      setPlatforms(data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load platforms";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createPlatform = useCallback(
    async (data: CreatePlatformDto): Promise<Platform | null> => {
      try {
        const newPlatform = await platformsApi.createPlatform(data);
        setPlatforms((prev) => [...prev, newPlatform]);
        toast.success("Platform created successfully");
        return newPlatform;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to create platform";
        toast.error(message);
        return null;
      }
    },
    []
  );

  const updatePlatform = useCallback(
    async (id: string, data: UpdatePlatformDto): Promise<Platform | null> => {
      try {
        const updatedPlatform = await platformsApi.updatePlatform(id, data);
        setPlatforms((prev) =>
          prev.map((p) => (p.id === id ? updatedPlatform : p))
        );
        toast.success("Platform updated successfully");
        return updatedPlatform;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to update platform";
        toast.error(message);
        return null;
      }
    },
    []
  );

  const deletePlatform = useCallback(async (id: string): Promise<boolean> => {
    try {
      await platformsApi.deletePlatform(id);
      setPlatforms((prev) => prev.filter((p) => p.id !== id));
      toast.success("Platform deleted successfully");
      return true;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to delete platform";
      toast.error(message);
      return false;
    }
  }, []);

  useEffect(() => {
    fetchPlatforms();
  }, [fetchPlatforms]);

  return {
    platforms,
    isLoading,
    error,
    fetchPlatforms,
    createPlatform,
    updatePlatform,
    deletePlatform,
  };
}

// Hook for fetching a single platform
interface UsePlatformReturn {
  platform: Platform | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function usePlatform(id: string | null): UsePlatformReturn {
  const [platform, setPlatform] = useState<Platform | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlatform = useCallback(async () => {
    if (!id) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const data = await platformsApi.getPlatform(id);
      setPlatform(data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load platform";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchPlatform();
  }, [fetchPlatform]);

  return {
    platform,
    isLoading,
    error,
    refetch: fetchPlatform,
  };
}
