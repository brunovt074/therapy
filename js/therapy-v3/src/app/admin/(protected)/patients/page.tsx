"use client";

import { useState } from "react";
import { usePatients, useCreatePatient, useUpdatePatient } from "@/hooks/use-patients";
import { Patient, PatientCreateInput, PatientUpdateInput } from "@/types/patient";
import { PatientForm } from "@/components/admin/patient-form";
import { Search, Plus, Pencil } from "lucide-react";

export default function PacientesPage() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Patient | null>(null);

  const { data, isLoading } = usePatients(debouncedQuery);
  const createPatient = useCreatePatient();
  const updatePatient = useUpdatePatient();

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setDebouncedQuery(query);
  }

  async function handleCreate(formData: PatientCreateInput) {
    try {
      await createPatient.mutateAsync(formData);
      setShowForm(false);
    } catch {
      // error toast handled in hook
    }
  }

  async function handleUpdate(data: PatientUpdateInput) {
    if (!editing) return;
    try {
      await updatePatient.mutateAsync({ id: editing.id, data });
      setEditing(null);
    } catch {
      // error toast handled in hook
    }
  }

  const patients = data?.items ?? [];
  const total = data?.total ?? 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl text-[var(--text-emphasis)]">
          Pacientes
        </h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-[var(--text-on-accent)] rounded-md text-sm font-medium hover:bg-[var(--color-primary-hover)]"
        >
          <Plus className="w-4 h-4" />
          Nuevo paciente
        </button>
      </div>

      <form onSubmit={handleSearch} className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
          <input
            type="text"
            placeholder="Buscar por nombre o email..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-md text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
          />
        </div>
      </form>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-[var(--bg-secondary)] rounded-lg animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border-color)]">
                  <th className="text-left px-4 py-3 text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wide">Nombre</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wide">Teléfono</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wide">Email</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {patients.map((p) => (
                  <tr
                    key={p.id}
                    onClick={() => setEditing(p)}
                    className="border-b border-[var(--border-color-subtle)] last:border-0 cursor-pointer hover:bg-[var(--bg-tertiary)]"
                  >
                    <td className="px-4 py-3">
                      <span className="font-medium text-[var(--text-primary)]">{p.full_name}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-[var(--text-secondary)]">{p.phone}</td>
                    <td className="px-4 py-3 text-sm text-[var(--text-secondary)]">{p.email ?? "—"}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <button
                          onClick={(e) => { e.stopPropagation(); setEditing(p); }}
                          className="p-1.5 text-[var(--text-tertiary)] hover:text-[var(--color-primary)] hover:bg-[var(--bg-tertiary)] rounded"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {patients.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-sm text-[var(--text-tertiary)]">
                      No hay pacientes registrados
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {total > 0 && (
            <p className="mt-3 text-xs text-[var(--text-tertiary)]">
              {total} paciente{total !== 1 ? "s" : ""} en total
            </p>
          )}
        </>
      )}

      {showForm && (
        <PatientForm
          onSubmit={(data) => handleCreate(data as PatientCreateInput)}
          onCancel={() => setShowForm(false)}
        />
      )}

      {editing && (
        <PatientForm
          initialData={editing}
          onSubmit={(data) => handleUpdate(data as PatientUpdateInput)}
          onCancel={() => setEditing(null)}
        />
      )}
    </div>
  );
}
