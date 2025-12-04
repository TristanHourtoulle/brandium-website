import { apiClient } from "./client";
import type { Platform, CreatePlatformDto, UpdatePlatformDto } from "@/types";

const PLATFORMS_ENDPOINT = "/api/platforms";

// Backend response types (may differ from frontend types)
interface BackendPlatform {
  id: string;
  userId: string;
  name: string;
  styleGuidelines: string;
  maxLength?: number;
  createdAt: string;
  updatedAt: string;
}

interface PlatformsListResponse {
  count: number;
  data: BackendPlatform[];
}

interface SinglePlatformResponse {
  data: BackendPlatform;
}

// Normalize backend response to frontend Platform type
function normalizePlatform(backendPlatform: BackendPlatform): Platform {
  return {
    id: backendPlatform.id,
    userId: backendPlatform.userId,
    name: backendPlatform.name,
    styleGuidelines: backendPlatform.styleGuidelines,
    maxLength: backendPlatform.maxLength,
    createdAt: backendPlatform.createdAt,
    updatedAt: backendPlatform.updatedAt,
  };
}

export async function getPlatforms(): Promise<Platform[]> {
  const response =
    await apiClient.get<PlatformsListResponse>(PLATFORMS_ENDPOINT);
  return response.data.map(normalizePlatform);
}

export async function getPlatform(id: string): Promise<Platform> {
  const response = await apiClient.get<SinglePlatformResponse>(
    `${PLATFORMS_ENDPOINT}/${id}`
  );
  return normalizePlatform(response.data);
}

export async function createPlatform(
  data: CreatePlatformDto
): Promise<Platform> {
  const response = await apiClient.post<SinglePlatformResponse>(
    PLATFORMS_ENDPOINT,
    data
  );
  return normalizePlatform(response.data);
}

export async function updatePlatform(
  id: string,
  data: UpdatePlatformDto
): Promise<Platform> {
  const response = await apiClient.put<SinglePlatformResponse>(
    `${PLATFORMS_ENDPOINT}/${id}`,
    data
  );
  return normalizePlatform(response.data);
}

export async function deletePlatform(id: string): Promise<void> {
  return apiClient.delete(`${PLATFORMS_ENDPOINT}/${id}`);
}
