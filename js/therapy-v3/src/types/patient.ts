export interface Patient {
  id: number;
  full_name: string;
  phone: string;
  email: string | null;
  birth_date: string | null;
  notes: string | null;
  medical_history: string | null;
  created_at: string;
  updated_at: string;
}

export interface PatientUpdateInput {
  full_name?: string;
  phone?: string;
  email?: string | null;
  birth_date?: string | null;
  notes?: string | null;
  medical_history?: string | null;
}
