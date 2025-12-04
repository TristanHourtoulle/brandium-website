import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
} from "@/lib/api/projects";
import { apiClient } from "@/lib/api/client";
import type { Project, CreateProjectDto, UpdateProjectDto } from "@/types";

// Mock the apiClient
vi.mock("@/lib/api/client", () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockProject: Project = {
  id: "project-1",
  userId: "user-1",
  name: "Product Launch 2024",
  description: "Launch campaign for our new product line targeting tech professionals",
  audience: "Tech professionals aged 25-45",
  keyMessages: ["Innovative solution", "Save 5 hours per week", "Easy integration"],
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
};

const mockProjects: Project[] = [
  mockProject,
  {
    ...mockProject,
    id: "project-2",
    name: "Brand Awareness Campaign",
    description: "Building brand recognition among target audience",
    audience: "Marketing managers",
  },
];

describe("projects API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getProjects", () => {
    it("should fetch all projects", async () => {
      vi.mocked(apiClient.get).mockResolvedValue({
        count: mockProjects.length,
        data: mockProjects,
      });

      const result = await getProjects();

      expect(apiClient.get).toHaveBeenCalledWith("/api/projects");
      expect(result).toEqual(mockProjects);
    });

    it("should return empty array when no projects exist", async () => {
      vi.mocked(apiClient.get).mockResolvedValue({
        count: 0,
        data: [],
      });

      const result = await getProjects();

      expect(result).toEqual([]);
    });

    it("should throw error when API fails", async () => {
      const error = new Error("Network error");
      vi.mocked(apiClient.get).mockRejectedValue(error);

      await expect(getProjects()).rejects.toThrow("Network error");
    });

    it("should normalize missing keyMessages to empty array", async () => {
      const projectWithoutKeyMessages = {
        ...mockProject,
        keyMessages: undefined,
      };
      vi.mocked(apiClient.get).mockResolvedValue({
        count: 1,
        data: [projectWithoutKeyMessages],
      });

      const result = await getProjects();

      expect(result[0].keyMessages).toEqual([]);
    });
  });

  describe("getProject", () => {
    it("should fetch a single project by id", async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: mockProject });

      const result = await getProject("project-1");

      expect(apiClient.get).toHaveBeenCalledWith("/api/projects/project-1");
      expect(result).toEqual(mockProject);
    });

    it("should throw error when project not found", async () => {
      const error = { message: "Project not found", statusCode: 404 };
      vi.mocked(apiClient.get).mockRejectedValue(error);

      await expect(getProject("invalid-id")).rejects.toEqual(error);
    });

    it("should normalize missing keyMessages", async () => {
      const projectWithoutKeyMessages = {
        ...mockProject,
        keyMessages: undefined,
      };
      vi.mocked(apiClient.get).mockResolvedValue({ data: projectWithoutKeyMessages });

      const result = await getProject("project-1");

      expect(result.keyMessages).toEqual([]);
    });
  });

  describe("createProject", () => {
    it("should create a new project", async () => {
      const createData: CreateProjectDto = {
        name: "New Project",
        description: "A brand new project for testing purposes",
        audience: "Developers",
        keyMessages: ["Message 1", "Message 2"],
      };

      const createdProject: Project = {
        ...mockProject,
        id: "new-project-id",
        ...createData,
      };

      vi.mocked(apiClient.post).mockResolvedValue({ data: createdProject });

      const result = await createProject(createData);

      expect(apiClient.post).toHaveBeenCalledWith("/api/projects", createData);
      expect(result).toEqual(createdProject);
    });

    it("should throw error on validation failure", async () => {
      const createData: CreateProjectDto = {
        name: "",
        description: "Short",
        audience: "",
        keyMessages: [],
      };

      const error = { message: "Validation failed", statusCode: 400 };
      vi.mocked(apiClient.post).mockRejectedValue(error);

      await expect(createProject(createData)).rejects.toEqual(error);
    });
  });

  describe("updateProject", () => {
    it("should update an existing project", async () => {
      const updateData: UpdateProjectDto = {
        name: "Updated Project Name",
        description: "Updated description for the project",
      };

      const updatedProject: Project = {
        ...mockProject,
        ...updateData,
      };

      vi.mocked(apiClient.put).mockResolvedValue({ data: updatedProject });

      const result = await updateProject("project-1", updateData);

      expect(apiClient.put).toHaveBeenCalledWith("/api/projects/project-1", updateData);
      expect(result).toEqual(updatedProject);
    });

    it("should allow partial updates", async () => {
      const updateData: UpdateProjectDto = {
        keyMessages: ["New message 1", "New message 2"],
      };

      const updatedProject: Project = {
        ...mockProject,
        keyMessages: updateData.keyMessages!,
      };

      vi.mocked(apiClient.put).mockResolvedValue({ data: updatedProject });

      const result = await updateProject("project-1", updateData);

      expect(result.keyMessages).toEqual(updateData.keyMessages);
    });

    it("should throw error when project not found", async () => {
      const error = { message: "Project not found", statusCode: 404 };
      vi.mocked(apiClient.put).mockRejectedValue(error);

      await expect(
        updateProject("invalid-id", { name: "Test" })
      ).rejects.toEqual(error);
    });
  });

  describe("deleteProject", () => {
    it("should delete a project", async () => {
      vi.mocked(apiClient.delete).mockResolvedValue(undefined);

      await deleteProject("project-1");

      expect(apiClient.delete).toHaveBeenCalledWith("/api/projects/project-1");
    });

    it("should throw error when project not found", async () => {
      const error = { message: "Project not found", statusCode: 404 };
      vi.mocked(apiClient.delete).mockRejectedValue(error);

      await expect(deleteProject("invalid-id")).rejects.toEqual(error);
    });

    it("should throw error when project is in use", async () => {
      const error = {
        message: "Cannot delete project that is in use",
        statusCode: 409,
      };
      vi.mocked(apiClient.delete).mockRejectedValue(error);

      await expect(deleteProject("project-in-use")).rejects.toEqual(error);
    });
  });
});
