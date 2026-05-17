"use client";

import { useState } from "react";
import { useBookingStore } from "@/stores/use-booking-store";
import { useCreateAppointment } from "@/hooks/use-appointments";
import { ArrowLeft, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

export function PatientStep() {
  const selectedSpecialty = useBookingStore((s) => s.selectedSpecialty);
  const selectedSlot = useBookingStore((s) => s.selectedSlot);
  const prevStep = useBookingStore((s) => s.prevStep);
  const setAppointmentResult = useBookingStore((s) => s.setAppointmentResult);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  const createAppointment = useCreateAppointment();

  if (!selectedSpecialty || !selectedSlot) {
    prevStep();
    return null;
  }

  const slotDate = parseISO(selectedSlot.start_at);

  function validate(): string | null {
    if (!fullName.trim()) return "El nombre es obligatorio";
    if (!phone.trim()) return "El teléfono es obligatorio";
    if (!/^[\d\s\-()+]{6,20}$/.test(phone.replace(/\s+/g, "")))
      return "El teléfono no es válido";
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      return "El correo no es válido";
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);

    try {
      const appointment = await createAppointment.mutateAsync({
        patient_full_name: fullName.trim(),
        patient_phone: phone.trim(),
        patient_email: email.trim() || null,
        specialty_id: selectedSpecialty!.id,
        start_at: selectedSlot!.start_at,
      });

      setAppointmentResult(appointment); // store avanza a step 4
      toast.success("Turno reservado con éxito");
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Error al reservar turno";
      setError(msg);
      toast.error(msg);
    }
  }

  return (
    <section>
      <div className="mb-7">
        <h2 className="font-display text-[1.85rem] font-medium text-[var(--text-emphasis)] mb-1 tracking-tight">
          Confirmá tu reserva
        </h2>
        <p className="text-[var(--text-tertiary)]">
          Revisá los detalles y completá tus datos
        </p>
      </div>

      {/* Resumen */}
      <div className="bg-[var(--bg-canvas)] border border-[var(--border-color)] rounded-lg px-7 py-2 mb-6">
        <SummaryRow label="Especialidad" value={selectedSpecialty.name} />
        <SummaryRow
          label="Duración"
          value={`${selectedSpecialty.duration_min} min`}
        />
        <SummaryRow
          label="Fecha"
          value={format(slotDate, "EEEE d 'de' MMMM", { locale: es })}
          capitalize
        />
        <SummaryRow label="Hora" value={format(slotDate, "HH:mm 'h'")} />
      </div>

      {/* Descripción del tratamiento */}
      {selectedSpecialty.description && (
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-color-subtle)] rounded-lg px-7 py-6 mb-8">
          <h3 className="font-display text-[1.05rem] font-medium text-[var(--text-emphasis)] mb-2.5 pb-2.5 border-b border-[var(--border-color-subtle)] tracking-tight">
            Sobre el tratamiento
          </h3>
          <p className="text-[0.93rem] text-[var(--text-secondary)] leading-relaxed">
            {selectedSpecialty.description}
          </p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div className="mb-8">
          <h4 className="eyebrow mb-4">Tus datos</h4>

          <Field
            id="name"
            label="Nombre completo"
            value={fullName}
            onChange={setFullName}
            placeholder="Ingresá tu nombre"
            maxLength={255}
            required
            autoComplete="name"
          />
          <Field
            id="phone"
            label="Teléfono"
            type="tel"
            value={phone}
            onChange={setPhone}
            placeholder="Tu número de contacto"
            maxLength={20}
            required
            autoComplete="tel"
          />
          <Field
            id="email"
            label="Correo electrónico"
            optional
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="correo@ejemplo.com"
            maxLength={255}
            autoComplete="email"
          />
        </div>

        {error && (
          <div className="mb-5 px-4 py-3 bg-[var(--color-error-bg)] text-[var(--color-error)] border border-[rgba(155,58,58,0.2)] rounded-md text-sm">
            {error}
          </div>
        )}

        <div className="flex justify-between items-center mt-8">
          <button
            type="button"
            onClick={prevStep}
            className="flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--color-primary)] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver
          </button>
          <button
            type="submit"
            disabled={createAppointment.isPending}
            className="flex items-center gap-2 px-5 py-2.5 bg-[var(--color-primary)] text-[var(--text-on-accent)] rounded-md font-semibold text-[0.95rem] shadow-[0_4px_14px_rgba(184,92,56,0.22)] hover:bg-[var(--color-primary-hover)] hover:-translate-y-px hover:shadow-[0_6px_18px_rgba(184,92,56,0.28)] disabled:opacity-65 disabled:cursor-not-allowed disabled:transform-none transition-all"
          >
            {createAppointment.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Reservando...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Confirmar reserva
              </>
            )}
          </button>
        </div>
      </form>
    </section>
  );
}

function SummaryRow({
  label,
  value,
  capitalize = false,
}: {
  label: string;
  value: string;
  capitalize?: boolean;
}) {
  return (
    <div className="flex justify-between items-baseline gap-4 py-3.5 border-b border-[var(--border-color-subtle)] last:border-b-0">
      <span className="text-[var(--text-tertiary)] text-[0.9rem]">{label}</span>
      <span
        className={`font-semibold text-[var(--text-primary)] text-right tabular-nums ${
          capitalize ? "first-letter:uppercase" : ""
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
  optional = false,
  maxLength,
  autoComplete,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  optional?: boolean;
  maxLength?: number;
  autoComplete?: string;
}) {
  return (
    <div className="mb-4">
      <label
        htmlFor={id}
        className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5"
      >
        {label}
        {optional && (
          <span className="text-xs font-normal text-[var(--text-tertiary)] ml-1">
            (opcional)
          </span>
        )}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        required={required}
        autoComplete={autoComplete}
        className="w-full px-4 py-2.5 bg-[var(--bg-canvas)] border border-[var(--border-color)] rounded-md text-[0.95rem] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-[3px] focus:ring-[rgba(184,92,56,0.12)] transition-all"
      />
    </div>
  );
}
