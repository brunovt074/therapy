import { apiClient } from "./client";
import { Patient, PatientCreateInput, PatientUpdateInput } from "@/types/patient";

export const patientsApi = {
  list: (q?: string, page = 1, per_page = 20): Promise<Patient[]> => {
    const params = new URLSearchParams();
    if (q) params.append("q", q);
    params.append("page", String(page));
    params.append("per_page", String(per_page));
    return apiClient.get<Patient[]>(`/api/admin/patients?${params.toString()}`);
  },

  get: (id: number): Promise<Patient> =>
    apiClient.get<Patient>(`/api/admin/patients/${id}`),

  create: (data: PatientCreateInput): Promise<Patient> =>
    apiClient.post<Patient>(`/api/admin/patients`, data),

  update: (id: number, data: PatientUpdateInput): Promise<Patient> =>
    apiClient.patch<Patient>(`/api/admin/patients/${id}`, data),

  remove: (id: number): Promise<void> =>
    apiClient.delete(`/api/admin/patients/${id}`),
};
