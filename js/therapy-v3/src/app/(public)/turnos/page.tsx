"use client";

import { useBookingStore } from "@/stores/use-booking-store";
import { ServiceStep } from "@/components/booking/service-step";
import { CalendarStep } from "@/components/booking/calendar-step";
import { PatientStep } from "@/components/booking/patient-step";
import { ConfirmationStep } from "@/components/booking/confirmation-step";
import { Check } from "lucide-react";

const STEPS = [1, 2, 3, 4] as const;

export default function TurnosPage() {
  const step = useBookingStore((s) => s.step);

  return (
    <main className="max-w-[720px] mx-auto px-5 pt-28 pb-16">
        {/* Intro */}
        <div className="mb-8">
          <span className="eyebrow mb-2">Turnos online</span>
          <h1 className="font-display text-4xl font-medium italic text-[var(--text-emphasis)] mb-2 tracking-tight">
            Reservá tu sesión
          </h1>
          <p className="text-[var(--text-secondary)] text-[1.05rem] max-w-lg">
            Completá los pasos para reservar tu consulta. Recibirás un email con
            el enlace para confirmar o cancelar.
          </p>
        </div>

        {/* Progress bar — círculos numerados conectados */}
        <div className="relative flex justify-between items-center my-10 mb-12">
          <div className="absolute top-1/2 left-5 right-5 h-px bg-[var(--border-color)] -translate-y-1/2 z-0" />
          {STEPS.map((n) => {
            const state =
              n < step ? "completed" : n === step ? "active" : "pending";
            return (
              <div
                key={n}
                className={`relative z-10 w-10 h-10 rounded-full border flex items-center justify-center font-semibold text-[0.95rem] transition-all duration-300
                  ${
                    state === "active"
                      ? "bg-[var(--color-primary)] border-[var(--color-primary)] text-[var(--text-on-accent)] scale-110 shadow-[var(--shadow-accent)]"
                      : state === "completed"
                      ? "bg-[var(--color-success)] border-[var(--color-success)] text-[var(--text-on-accent)]"
                      : "bg-[var(--bg-canvas)] border-[var(--border-color)] text-[var(--text-tertiary)]"
                  }`}
              >
                {state === "completed" ? <Check className="w-4 h-4" /> : n}
              </div>
            );
          })}
        </div>

        {/* Step content */}
        {step === 1 && <ServiceStep />}
        {step === 2 && <CalendarStep />}
        {step === 3 && <PatientStep />}
        {step === 4 && <ConfirmationStep />}
    </main>
  );
}
