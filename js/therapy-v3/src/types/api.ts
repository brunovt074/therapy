export interface TimeSlot {
  start_at: string;
  end_at: string;
  available: boolean;
}

export interface Stats {
  appointments_today: number;
  appointments_week: number;
  pending_today: number;
  confirmed_today: number;
  total_patients: number;
  next_appointment: {
    id: number;
    patient_id: number;
    specialty_id: number;
    start_at: string;
    status: string;
  } | null;
}

export interface ApiError {
  detail: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface User {
  user_id: string;
  role: string;
}

export interface AdminAppointment {
  id: number;
  patient_id: number;
  patient_name: string;
  specialty_id: number;
  specialty_name: string;
  start_at: string;
  end_at: string;
  status: string;
  notes: string | null;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CalendarDay {
  date: string;
  day_of_week: number;
  appointments: AdminAppointment[];
}

export interface CalendarResponse {
  month: string;
  days: CalendarDay[];
}

export interface Settings {
  timezone: string;
  business_hours_start: string;
  business_hours_end: string;
  business_work_days: number[];
}
