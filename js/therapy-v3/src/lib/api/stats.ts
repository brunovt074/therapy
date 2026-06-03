import { apiClient } from "./client";
import { Stats } from "@/types/api";

export const statsApi = {
  get: (): Promise<Stats> => apiClient.get<Stats>("/api/admin/stats"),
};
