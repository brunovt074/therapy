import { apiClient } from "./client";
import { BlockedSlot, BlockedSlotCreateInput } from "@/types/blocked-slot";

export const blockedSlotsApi = {
  list: (): Promise<BlockedSlot[]> =>
    apiClient.get<BlockedSlot[]>("/api/admin/blocked-slots"),

  create: (data: BlockedSlotCreateInput): Promise<BlockedSlot> =>
    apiClient.post<BlockedSlot>("/api/admin/blocked-slots", data),

  delete: (id: number): Promise<void> =>
    apiClient.delete(`/api/admin/blocked-slots/${id}`),
};
