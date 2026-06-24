import { useQuery } from "@tanstack/react-query";
import { availabilityApi } from "@/lib/api/availability";

export function useAvailableSlots(date: string, specialtyId: number) {
  return useQuery({
    queryKey: ["availability", date, specialtyId],
    queryFn: () => availabilityApi.getSlots(date, specialtyId),
    enabled: !!date && !!specialtyId,
  });
}

export function useMonthAvailableDays(month: string, specialtyId: number) {
  return useQuery({
    queryKey: ["availability-days", month, specialtyId],
    queryFn: () => availabilityApi.getDays(month, specialtyId),
    enabled: !!month && specialtyId > 0,
  });
}
