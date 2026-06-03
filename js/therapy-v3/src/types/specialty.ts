export interface Specialty {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  duration_min: number;
  color: string;
  active: boolean;
  max_slots: number;
  available_slots: number;
  created_at: string;
  updated_at: string;
}

export interface SpecialtyCreateInput {
  name: string;
  slug: string;
  description?: string | null;
  duration_min?: number;
  color?: string;
  max_slots?: number;
  available_slots?: number;
}

export interface SpecialtyUpdateInput {
  name?: string;
  slug?: string;
  description?: string | null;
  duration_min?: number;
  color?: string;
  max_slots?: number;
  available_slots?: number;
}
