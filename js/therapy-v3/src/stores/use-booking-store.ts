import { create } from "zustand";
import { Specialty } from "@/types/specialty";
import { Appointment } from "@/types/appointment";

interface PatientData {
  full_name: string;
  phone: string;
  email?: string;
}

interface BookingState {
  step: number;
  selectedSpecialty: Specialty | null;
  selectedDate: string | null;
  selectedSlot: { start_at: string; end_at: string } | null;
  patientData: PatientData | null;
  appointmentResult: Appointment | null;

  setSpecialty: (specialty: Specialty) => void;
  setDate: (date: string) => void;
  setSlot: (slot: { start_at: string; end_at: string }) => void;
  clearSlot: () => void;
  setPatientData: (data: PatientData) => void;
  setAppointmentResult: (appointment: Appointment) => void;
  nextStep: () => void;
  prevStep: () => void;
  reset: () => void;
}

export const useBookingStore = create<BookingState>((set) => ({
  step: 1,
  selectedSpecialty: null,
  selectedDate: null,
  selectedSlot: null,
  patientData: null,
  appointmentResult: null,

  setSpecialty: (specialty) =>
    set({ selectedSpecialty: specialty, step: 2 }),

  setDate: (date) => set({ selectedDate: date }),

  setSlot: (slot) => set({ selectedSlot: slot, step: 3 }),

  clearSlot: () => set({ selectedSlot: null }),

  setPatientData: (data) => set({ patientData: data }),

  setAppointmentResult: (appointment) =>
    set({ appointmentResult: appointment, step: 4 }),

  nextStep: () => set((state) => ({ step: Math.min(state.step + 1, 4) })),

  prevStep: () => set((state) => ({ step: Math.max(state.step - 1, 1) })),

  reset: () =>
    set({
      step: 1,
      selectedSpecialty: null,
      selectedDate: null,
      selectedSlot: null,
      patientData: null,
      appointmentResult: null,
    }),
}));
