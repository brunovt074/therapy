import { apiClient } from "./client";
import { TokenResponse, User } from "@/types/api";

export const authApi = {
  login: (email: string, password: string): Promise<TokenResponse> =>
    apiClient.post<TokenResponse>("/api/auth/login", { email, password }),

  me: (): Promise<User> => apiClient.get<User>("/api/auth/me"),
};
