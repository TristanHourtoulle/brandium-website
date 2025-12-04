import { apiClient } from "./client";
import type { Project, CreateProjectDto, UpdateProjectDto } from "@/types";

const PROJECTS_ENDPOINT = "/api/projects";

// Backend response types (may differ from frontend types)
interface BackendProject {
  id: string;
  userId: string;
  name: string;
  description: string;
  audience: string;
  keyMessages: string[];
  createdAt: string;
  updatedAt: string;
}

interface ProjectsListResponse {
  count: number;
  data: BackendProject[];
}

interface SingleProjectResponse {
  data: BackendProject;
}

// Normalize backend response to frontend Project type
function normalizeProject(backendProject: BackendProject): Project {
  return {
    id: backendProject.id,
    userId: backendProject.userId,
    name: backendProject.name,
    description: backendProject.description,
    audience: backendProject.audience,
    keyMessages: backendProject.keyMessages ?? [],
    createdAt: backendProject.createdAt,
    updatedAt: backendProject.updatedAt,
  };
}

export async function getProjects(): Promise<Project[]> {
  const response = await apiClient.get<ProjectsListResponse>(PROJECTS_ENDPOINT);
  return response.data.map(normalizeProject);
}

export async function getProject(id: string): Promise<Project> {
  const response = await apiClient.get<SingleProjectResponse>(
    `${PROJECTS_ENDPOINT}/${id}`
  );
  return normalizeProject(response.data);
}

export async function createProject(data: CreateProjectDto): Promise<Project> {
  const response = await apiClient.post<SingleProjectResponse>(
    PROJECTS_ENDPOINT,
    data
  );
  return normalizeProject(response.data);
}

export async function updateProject(
  id: string,
  data: UpdateProjectDto
): Promise<Project> {
  const response = await apiClient.put<SingleProjectResponse>(
    `${PROJECTS_ENDPOINT}/${id}`,
    data
  );
  return normalizeProject(response.data);
}

export async function deleteProject(id: string): Promise<void> {
  return apiClient.delete(`${PROJECTS_ENDPOINT}/${id}`);
}
