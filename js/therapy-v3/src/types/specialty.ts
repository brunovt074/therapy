export interface Specialty {
  id: number;
  name: string;
  description: string | null;
  duration_min: number;
  color: string;
  active: boolean;
  max_slots: number;
  available_slots: number;
  schedule_days: number[] | null;
  schedule_start: string | null;
  schedule_end: string | null;
  created_at: string;
  updated_at: string;
}

export interface SpecialtyCreateInput {
  name: string;
  description?: string | null;
  duration_min?: number;
  color?: string;
  max_slots?: number;
  schedule_days?: number[] | null;
  schedule_start?: string | null;
  schedule_end?: string | null;
}

export interface SpecialtyUpdateInput {
  name?: string;
  description?: string | null;
  duration_min?: number;
  color?: string;
  max_slots?: number;
  schedule_days?: number[] | null;
  schedule_start?: string | null;
  schedule_end?: string | null;
}
