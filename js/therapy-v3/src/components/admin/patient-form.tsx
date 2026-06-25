"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { PatientCreateInput, PatientUpdateInput } from "@/types/patient";

interface PatientFormProps {
  initialData?: {
    full_name: string;
    phone: string;
    email?: string | null;
    birth_date?: string | null;
    notes?: string | null;
    medical_history?: string | null;
  };
  onSubmit: (data: PatientCreateInput | PatientUpdateInput) => void;
  onCancel: () => void;
}

export function PatientForm({ initialData, onSubmit, onCancel }: PatientFormProps) {
  const [form, setForm] = useState({
    full_name: initialData?.full_name ?? "",
    phone: initialData?.phone ?? "",
    email: initialData?.email ?? "",
    birth_date: initialData?.birth_date ?? "",
    notes: initialData?.notes ?? "",
    medical_history: initialData?.medical_history ?? "",
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({
      full_name: form.full_name,
      phone: form.phone,
      email: form.email || null,
      birth_date: form.birth_date || null,
      notes: form.notes || null,
      medical_history: form.medical_history || null,
    });
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)] w-full max-w-lg max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between p-4 border-b border-[var(--border-color)]">
          <h3 className="font-medium text-[var(--text-primary)]">
            {initialData ? "Editar paciente" : "Nuevo paciente"}
          </h3>
          <button onClick={onCancel} className="p-1 hover:bg-[var(--bg-tertiary)] rounded">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-[var(--text-secondary)]">
              Nombre completo *
            </label>
            <input
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-md text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-[var(--text-secondary)]">
              Teléfono *
            </label>
            <input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-md text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-[var(--text-secondary)]">
              Email
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-md text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-[var(--text-secondary)]">
              Fecha de nacimiento
            </label>
            <input
              type="date"
              value={form.birth_date}
              onChange={(e) => setForm({ ...form, birth_date: e.target.value })}
              className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-md text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-[var(--text-secondary)]">
              Observaciones
            </label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-md text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-[var(--text-secondary)]">
              Historia clínica
            </label>
            <textarea
              value={form.medical_history}
              onChange={(e) => setForm({ ...form, medical_history: e.target.value })}
              className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-md text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[var(--color-primary)] text-[var(--text-on-accent)] rounded-md text-sm font-medium hover:bg-[var(--color-primary-hover)]"
            >
              {initialData ? "Guardar" : "Crear"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
