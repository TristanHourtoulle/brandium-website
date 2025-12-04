export interface Project {
  id: string;
  userId: string;
  name: string;
  description: string;
  audience: string;
  keyMessages: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectDto {
  name: string;
  description: string;
  audience: string;
  keyMessages: string[];
}

export interface UpdateProjectDto {
  name?: string;
  description?: string;
  audience?: string;
  keyMessages?: string[];
}
