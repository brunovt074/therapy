export interface BlockedSlot {
  id: number;
  start_at: string;
  end_at: string;
  reason: string | null;
  recurring: boolean;
  created_at: string;
}

export interface BlockedSlotCreateInput {
  start_at: string;
  end_at: string;
  reason?: string | null;
  recurring?: boolean;
}
