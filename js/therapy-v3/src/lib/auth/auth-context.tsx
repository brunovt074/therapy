"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getToken, removeToken, setToken } from "./token";
import { authApi } from "@/lib/api/auth";
import { User } from "@/types/api";

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [authError, setAuthError] = useState<Error | null>(null);

  const {
    data: user,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: authApi.me,
    enabled: typeof window !== "undefined" && !!getToken(),
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const login = useCallback(
    async (email: string, password: string) => {
      const response = await authApi.login(email, password);
      setToken(response.access_token);
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
      setAuthError(null);
    },
    [queryClient]
  );

  const logout = useCallback(() => {
    removeToken();
    queryClient.clear();
    window.location.href = "/admin/login";
  }, [queryClient]);

  const isAuthenticated = !!user && !error && !authError;

  return (
    <AuthContext.Provider
      value={{ user: user ?? null, isLoading, isAuthenticated, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
