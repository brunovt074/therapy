export type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "cancelled"
  | "completed"
  | "no_show";

export interface Appointment {
  id: number;
  patient_id: number;
  specialty_id: number;
  start_at: string;
  end_at: string;
  status: AppointmentStatus;
  notes: string | null;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface AppointmentCreateInput {
  patient_full_name: string;
  patient_phone: string;
  patient_email?: string | null;
  specialty_id: number;
  start_at: string;
}

export interface AppointmentUpdateInput {
  status?: AppointmentStatus;
  notes?: string | null;
  admin_notes?: string | null;
  confirmed_by?: number | null;
}
