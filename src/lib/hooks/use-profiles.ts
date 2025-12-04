"use client";

import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import * as profilesApi from "@/lib/api/profiles";
import type { Profile, CreateProfileDto, UpdateProfileDto } from "@/types";

interface UseProfilesReturn {
  profiles: Profile[];
  isLoading: boolean;
  error: string | null;
  fetchProfiles: () => Promise<void>;
  createProfile: (data: CreateProfileDto) => Promise<Profile | null>;
  updateProfile: (
    id: string,
    data: UpdateProfileDto
  ) => Promise<Profile | null>;
  deleteProfile: (id: string) => Promise<boolean>;
}

export function useProfiles(): UseProfilesReturn {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfiles = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await profilesApi.getProfiles();
      setProfiles(data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load profiles";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createProfile = useCallback(
    async (data: CreateProfileDto): Promise<Profile | null> => {
      try {
        const newProfile = await profilesApi.createProfile(data);
        setProfiles((prev) => [...prev, newProfile]);
        toast.success("Profile created successfully");
        return newProfile;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to create profile";
        toast.error(message);
        return null;
      }
    },
    []
  );

  const updateProfile = useCallback(
    async (id: string, data: UpdateProfileDto): Promise<Profile | null> => {
      try {
        const updatedProfile = await profilesApi.updateProfile(id, data);
        setProfiles((prev) =>
          prev.map((p) => (p.id === id ? updatedProfile : p))
        );
        toast.success("Profile updated successfully");
        return updatedProfile;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to update profile";
        toast.error(message);
        return null;
      }
    },
    []
  );

  const deleteProfile = useCallback(async (id: string): Promise<boolean> => {
    try {
      await profilesApi.deleteProfile(id);
      setProfiles((prev) => prev.filter((p) => p.id !== id));
      toast.success("Profile deleted successfully");
      return true;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to delete profile";
      toast.error(message);
      return false;
    }
  }, []);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  return {
    profiles,
    isLoading,
    error,
    fetchProfiles,
    createProfile,
    updateProfile,
    deleteProfile,
  };
}

// Hook for fetching a single profile
interface UseProfileReturn {
  profile: Profile | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useProfile(id: string | null): UseProfileReturn {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!id) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const data = await profilesApi.getProfile(id);
      setProfile(data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load profile";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    profile,
    isLoading,
    error,
    refetch: fetchProfile,
  };
}
