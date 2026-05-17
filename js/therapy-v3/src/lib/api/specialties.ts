import { apiClient } from "./client";
import { Specialty, SpecialtyCreateInput, SpecialtyUpdateInput } from "@/types/specialty";

export const specialtiesApi = {
  getActive: (): Promise<Specialty[]> =>
    apiClient.get<Specialty[]>("/api/specialties"),

  getAll: (): Promise<Specialty[]> =>
    apiClient.get<Specialty[]>("/api/admin/specialties"),

  create: (data: SpecialtyCreateInput): Promise<Specialty> =>
    apiClient.post<Specialty>("/api/admin/specialties", data),

  update: (id: number, data: SpecialtyUpdateInput): Promise<Specialty> =>
    apiClient.patch<Specialty>(`/api/admin/specialties/${id}`, data),

  deactivate: (id: number): Promise<void> =>
    apiClient.delete(`/api/admin/specialties/${id}`),
};
