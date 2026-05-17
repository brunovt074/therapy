import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { blockedSlotsApi } from "@/lib/api/blocked-slots";

export function useBlockedSlots() {
  return useQuery({
    queryKey: ["blocked-slots"],
    queryFn: blockedSlotsApi.list,
  });
}

export function useCreateBlockedSlot() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: blockedSlotsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blocked-slots"] });
    },
  });
}

export function useDeleteBlockedSlot() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: blockedSlotsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blocked-slots"] });
    },
  });
}
