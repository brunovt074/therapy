"use client";

import { useBookingStore } from "@/stores/use-booking-store";
import { Check } from "lucide-react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import Link from "next/link";

export function ConfirmationStep() {
  const appointment = useBookingStore((s) => s.appointmentResult);
  const selectedSpecialty = useBookingStore((s) => s.selectedSpecialty);
  const reset = useBookingStore((s) => s.reset);

  if (!appointment) {
    return (
      <div className="text-center py-16">
        <p className="text-[var(--text-tertiary)] italic">
          No hay información de turno.
        </p>
        <button
          onClick={reset}
          className="mt-4 text-[var(--color-primary)] hover:underline"
        >
          Volver a empezar
        </button>
      </div>
    );
  }

  const start = parseISO(appointment.start_at);

  return (
    <section className="text-center pt-10 pb-4">
      <div className="inline-flex w-[84px] h-[84px] rounded-full bg-[var(--color-success-bg)] border border-[rgba(90,122,92,0.3)] text-[var(--color-success)] items-center justify-center mb-6">
        <Check className="w-9 h-9" strokeWidth={2.5} />
      </div>

      <h2 className="font-display text-[2.5rem] font-normal italic text-[var(--text-emphasis)] tracking-[-0.03em] mb-3">
        ¡Turno reservado!
      </h2>
      <p className="text-[var(--text-secondary)] text-[1.05rem] max-w-md mx-auto mb-6">
        Recibirás un email con los detalles y el enlace para confirmar o
        cancelar tu reserva.
      </p>

      <div className="text-left max-w-md mx-auto bg-[var(--bg-secondary)] border border-[var(--border-color-subtle)] rounded-lg px-7 py-6 mb-8">
        <DetailRow
          label="Fecha y hora"
          value={
            format(start, "EEEE d 'de' MMMM", { locale: es }) +
            " · " +
            format(start, "HH:mm 'h'")
          }
          capitalize
        />
        {selectedSpecialty && (
          <DetailRow label="Especialidad" value={selectedSpecialty.name} />
        )}
        <DetailRow
          label="Estado"
          value={statusLabel(appointment.status)}
        />
        <DetailRow
          label="Nº de reserva"
          value={`#${appointment.id}`}
          mono
        />
      </div>

      <Link
        href="/"
        onClick={reset}
        className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--color-primary)] text-[var(--text-on-accent)] rounded-md font-semibold no-underline shadow-[0_4px_14px_rgba(184,92,56,0.22)] hover:bg-[var(--color-primary-hover)] hover:-translate-y-px hover:shadow-[0_6px_18px_rgba(184,92,56,0.28)] transition-all"
      >
        Volver al inicio
      </Link>
    </section>
  );
}

function DetailRow({
  label,
  value,
  capitalize = false,
  mono = false,
}: {
  label: string;
  value: string;
  capitalize?: boolean;
  mono?: boolean;
}) {
  return (
    <div className="mb-4 last:mb-0">
      <div className="text-[0.72rem] font-semibold tracking-[0.14em] uppercase text-[var(--text-tertiary)] mb-1">
        {label}
      </div>
      <div
        className={`font-display text-[1.1rem] font-medium text-[var(--text-emphasis)] ${
          capitalize ? "first-letter:uppercase" : ""
        } ${mono ? "font-body tabular-nums text-[var(--color-primary)] text-[1rem]" : ""}`}
      >
        {value}
      </div>
    </div>
  );
}

function statusLabel(s: string): string {
  switch (s) {
    case "pending":
      return "Pendiente de confirmación";
    case "confirmed":
      return "Confirmado";
    case "cancelled":
      return "Cancelado";
    case "completed":
      return "Completado";
    default:
      return s;
  }
}
