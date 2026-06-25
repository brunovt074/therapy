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

export interface PatientDetail extends Patient {
  appointment_count: number;
}

export interface PatientCreateInput {
  full_name: string;
  phone: string;
  email?: string | null;
  birth_date?: string | null;
  notes?: string | null;
  medical_history?: string | null;
}

export interface PatientUpdateInput {
  full_name?: string;
  phone?: string;
  email?: string | null;
  birth_date?: string | null;
  notes?: string | null;
  medical_history?: string | null;
}

export interface PatientPaginatedResponse {
  total: number;
  items: Patient[];
  page: number;
  page_size: number;
}
