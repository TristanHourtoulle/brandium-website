import { apiClient } from "./client";
import type {
  User,
  AuthTokens,
  LoginCredentials,
  RegisterCredentials,
} from "@/types";

interface LoginResponse {
  user: User;
  token: string;
  message?: string;
}

interface RegisterResponse {
  user: User;
  token: string;
  message?: string;
}

export async function login(credentials: LoginCredentials): Promise<LoginResponse> {
  return apiClient.post<LoginResponse>("/api/auth/login", credentials);
}

export async function register(credentials: RegisterCredentials): Promise<RegisterResponse> {
  return apiClient.post<RegisterResponse>("/api/auth/register", {
    email: credentials.email,
    password: credentials.password,
  });
}

interface MeResponse {
  user: User;
}

export async function getCurrentUser(): Promise<User> {
  const response = await apiClient.get<MeResponse>("/api/auth/me");
  return response.user;
}

export async function refreshToken(): Promise<AuthTokens> {
  return apiClient.post<AuthTokens>("/api/auth/refresh");
}
