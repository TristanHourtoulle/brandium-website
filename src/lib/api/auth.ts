import { apiClient } from "./client";
import type {
  User,
  AuthTokens,
  LoginCredentials,
  RegisterCredentials,
} from "@/types";

interface LoginResponse {
  user: User;
  accessToken: string;
}

interface RegisterResponse {
  user: User;
  accessToken: string;
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

export async function getCurrentUser(): Promise<User> {
  return apiClient.get<User>("/api/auth/me");
}

export async function refreshToken(): Promise<AuthTokens> {
  return apiClient.post<AuthTokens>("/api/auth/refresh");
}
