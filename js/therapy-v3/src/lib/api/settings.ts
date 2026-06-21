import { apiClient } from "./client";
import { Settings, BusinessHoursRange } from "@/types/api";

export interface SettingsUpdateInput {
  business_hours_ranges?: BusinessHoursRange[] | null;
  business_work_days?: number[] | null;
}

export const settingsApi = {
  get: (): Promise<Settings> =>
    apiClient.get<Settings>("/api/admin/settings"),

  update: (data: SettingsUpdateInput): Promise<Settings> =>
    apiClient.patch<Settings>("/api/admin/settings", data),
};
