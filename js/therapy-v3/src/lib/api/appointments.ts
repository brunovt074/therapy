import { apiClient } from "./client";
import {
  Appointment,
  AppointmentCreateInput,
  AppointmentUpdateInput,
} from "@/types/appointment";
import { CalendarResponse } from "@/types/api";

export const appointmentsApi = {
  create: (data: AppointmentCreateInput): Promise<Appointment> =>
    apiClient.post<Appointment>("/api/appointments", data),

  confirm: (token: string): Promise<{ message: string }> =>
    apiClient.get<{ message: string }>(`/api/appointments/confirm/${token}`),

  cancel: (token: string): Promise<{ message: string }> =>
    apiClient.get<{ message: string }>(`/api/appointments/cancel/${token}`),

  list: (): Promise<Appointment[]> =>
    apiClient.get<Appointment[]>("/api/admin/appointments"),

  get: (id: number): Promise<Appointment> =>
    apiClient.get<Appointment>(`/api/admin/appointments/${id}`),

  update: (id: number, data: AppointmentUpdateInput): Promise<Appointment> =>
    apiClient.patch<Appointment>(`/api/admin/appointments/${id}`, data),

  delete: (id: number): Promise<void> =>
    apiClient.delete(`/api/admin/appointments/${id}`),

  calendar: (month: string): Promise<CalendarResponse> =>
    apiClient.get<CalendarResponse>(`/api/admin/appointments/calendar?month=${month}`),
};
