import { apiClient } from "./client";
import { TimeSlot } from "@/types/api";

export const availabilityApi = {
  getSlots: (date: string, specialtyId: number): Promise<TimeSlot[]> => {
    const params = new URLSearchParams({
      date,
      specialty_id: String(specialtyId),
    });
    return apiClient.get<TimeSlot[]>(`/api/availability?${params.toString()}`);
  },
};
