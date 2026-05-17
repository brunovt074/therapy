"use client";

import { useBookingStore } from "@/stores/use-booking-store";
import { ServiceStep } from "@/components/booking/service-step";
import { CalendarStep } from "@/components/booking/calendar-step";
import { PatientStep } from "@/components/booking/patient-step";
import { ConfirmationStep } from "@/components/booking/confirmation-step";
import { Check, MapPin } from "lucide-react";

const STEPS = [1, 2, 3, 4] as const;

export default function TurnosPage() {
  const step = useBookingStore((s) => s.step);

  return (
    <>
      {/* Clinic header — centrado, inspirado en jofrestudio */}
      <div className="border-b border-[var(--border-color-subtle)] bg-[var(--bg-canvas)] py-7 px-5">
        <div className="max-w-[720px] mx-auto flex items-center justify-center gap-4">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center font-display font-semibold text-[1.35rem] text-[var(--text-on-accent)] shadow-sm border border-[rgba(15,13,12,0.06)]"
            style={{
              background:
                "linear-gradient(135deg, var(--color-terracota), var(--color-bisque))",
            }}
          >
            T
          </div>
          <div>
            <h2 className="font-display text-[1.4rem] font-medium text-[var(--text-emphasis)] m-0 leading-tight">
              Therapy<em className="not-italic text-[var(--color-primary)] font-normal italic">.</em>
            </h2>
            <p className="text-sm text-[var(--text-tertiary)] mt-0.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[var(--color-salvia)]" />
              Kinesiología &amp; Fisioterapia
            </p>
          </div>
        </div>
      </div>

      <main className="max-w-[720px] mx-auto px-5 py-10 pb-16">
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
                      ? "bg-[var(--color-primary)] border-[var(--color-primary)] text-[var(--text-on-accent)] scale-110 shadow-[0_6px_16px_rgba(184,92,56,0.25)]"
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
    </>
  );
}
