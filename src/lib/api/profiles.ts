import { apiClient } from "./client";
import type { Profile, CreateProfileDto, UpdateProfileDto } from "@/types";

const PROFILES_ENDPOINT = "/api/profiles";

// Backend response types (may differ from frontend types)
interface BackendProfile {
  id: string;
  userId: string;
  name: string;
  bio: string;
  toneTags?: string[];
  tone?: string[];
  doRules: string[];
  dontRules: string[];
  createdAt: string;
  updatedAt: string;
}

interface ProfilesListResponse {
  count: number;
  data: BackendProfile[];
}

interface SingleProfileResponse {
  data: BackendProfile;
}

// Normalize backend response to frontend Profile type
function normalizeProfile(backendProfile: BackendProfile): Profile {
  return {
    id: backendProfile.id,
    userId: backendProfile.userId,
    name: backendProfile.name,
    bio: backendProfile.bio,
    tone: backendProfile.tone ?? backendProfile.toneTags ?? [],
    doRules: backendProfile.doRules ?? [],
    dontRules: backendProfile.dontRules ?? [],
    createdAt: backendProfile.createdAt,
    updatedAt: backendProfile.updatedAt,
  };
}

export async function getProfiles(): Promise<Profile[]> {
  const response = await apiClient.get<ProfilesListResponse>(PROFILES_ENDPOINT);
  return response.data.map(normalizeProfile);
}

export async function getProfile(id: string): Promise<Profile> {
  const response = await apiClient.get<SingleProfileResponse>(
    `${PROFILES_ENDPOINT}/${id}`
  );
  return normalizeProfile(response.data);
}

export async function createProfile(data: CreateProfileDto): Promise<Profile> {
  const response = await apiClient.post<SingleProfileResponse>(
    PROFILES_ENDPOINT,
    {
      ...data,
      toneTags: data.tone,
    }
  );
  return normalizeProfile(response.data);
}

export async function updateProfile(
  id: string,
  data: UpdateProfileDto
): Promise<Profile> {
  const response = await apiClient.put<SingleProfileResponse>(
    `${PROFILES_ENDPOINT}/${id}`,
    {
      ...data,
      toneTags: data.tone,
    }
  );
  return normalizeProfile(response.data);
}

export async function deleteProfile(id: string): Promise<void> {
  return apiClient.delete(`${PROFILES_ENDPOINT}/${id}`);
}
