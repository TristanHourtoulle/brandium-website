"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import { AUTH_TOKEN_KEY } from "@/config/constants";
import * as authApi from "@/lib/api/auth";
import type { User, LoginCredentials, RegisterCredentials } from "@/types";

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const hasInitialized = useRef(false);

  const isAuthenticated = !!user;

  // Initialize auth state only once on mount
  useEffect(() => {
    // Prevent double initialization (React 18 StrictMode)
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    let isMounted = true;

    const initAuth = async () => {
      // Check if we're in the browser
      if (typeof window === "undefined") {
        return;
      }

      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      if (!token) {
        if (isMounted) setIsLoading(false);
        return;
      }

      try {
        const userData = await authApi.getCurrentUser();
        if (isMounted) setUser(userData);
      } catch (error) {
        // Only remove token on auth errors (401), not on network errors
        const statusCode = (error as { statusCode?: number })?.statusCode;
        if (statusCode === 401 || statusCode === 403) {
          localStorage.removeItem(AUTH_TOKEN_KEY);
        }
        console.error("Failed to load user:", error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    initAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    const response = await authApi.login(credentials);
    localStorage.setItem(AUTH_TOKEN_KEY, response.token);
    setUser(response.user);
  }, []);

  const register = useCallback(async (credentials: RegisterCredentials) => {
    const response = await authApi.register(credentials);
    localStorage.setItem(AUTH_TOKEN_KEY, response.token);
    setUser(response.user);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
