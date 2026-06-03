"use client";

import { useParams } from "next/navigation";
import { usePatient } from "@/hooks/use-patients";
import { Loader2 } from "lucide-react";

export default function PatientDetailPage() {
  const params = useParams();
  const id = Number(params.id);
  const { data: patient, isLoading } = usePatient(id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-[var(--color-primary)]" />
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="text-center py-12 text-[var(--text-tertiary)]">
        Paciente no encontrado.
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display text-2xl text-[var(--text-emphasis)] mb-6">
        {patient.full_name}
      </h1>

      <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg p-6 max-w-lg">
        <div className="space-y-4">
          <div className="flex justify-between py-2 border-b border-[var(--border-color-subtle)]">
            <span className="text-sm text-[var(--text-secondary)]">Teléfono</span>
            <span className="text-sm font-medium text-[var(--text-primary)]">{patient.phone}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-[var(--border-color-subtle)]">
            <span className="text-sm text-[var(--text-secondary)]">Email</span>
            <span className="text-sm font-medium text-[var(--text-primary)]">{patient.email ?? "—"}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-[var(--border-color-subtle)]">
            <span className="text-sm text-[var(--text-secondary)]">Fecha de nacimiento</span>
            <span className="text-sm font-medium text-[var(--text-primary)]">{patient.birth_date ?? "—"}</span>
          </div>
          <div className="py-2">
            <span className="text-sm text-[var(--text-secondary)] block mb-1">Notas</span>
            <p className="text-sm text-[var(--text-primary)]">{patient.notes ?? "Sin notas"}</p>
          </div>
          <div className="py-2">
            <span className="text-sm text-[var(--text-secondary)] block mb-1">Historia clínica</span>
            <p className="text-sm text-[var(--text-primary)]">{patient.medical_history ?? "Sin historia clínica"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
