"use client";

import { useState, useEffect } from "react";
import { usePatients, useCreatePatient, useUpdatePatient, useDeletePatient } from "@/hooks/use-patients";
import { PatientForm } from "@/components/admin/patient-form";
import { ResponsiveTable, type Column } from "@/components/ui/responsive-table";
import { Plus, Search, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { Patient, PatientCreateInput, PatientUpdateInput } from "@/types/patient";

export default function PacientesPage() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Patient | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(t);
  }, [query]);

  const { data: patients, isLoading } = usePatients(debouncedQuery);
  const createPatient = useCreatePatient();
  const updatePatient = useUpdatePatient();
  const deletePatient = useDeletePatient();

  async function handleCreate(data: PatientCreateInput | PatientUpdateInput) {
    try {
      await createPatient.mutateAsync(data as PatientCreateInput);
      toast.success("Paciente creado");
      setShowForm(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al crear");
    }
  }

  async function handleUpdate(data: PatientCreateInput | PatientUpdateInput) {
    if (!editing) return;
    try {
      await updatePatient.mutateAsync({ id: editing.id, data: data as PatientUpdateInput });
      toast.success("Paciente actualizado");
      setEditing(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al actualizar");
    }
  }

  async function handleDelete(id: number) {
    try {
      await deletePatient.mutateAsync(id);
      toast.success("Paciente eliminado");
      setEditing(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al eliminar");
    }
  }

  const columns: Column<Patient>[] = [
    {
      key: "name",
      header: "Nombre",
      cell: (p) => (
        <span className="font-medium text-[var(--text-primary)]">{p.full_name}</span>
      ),
    },
    {
      key: "phone",
      header: "Teléfono",
      cell: (p) => p.phone,
    },
    {
      key: "email",
      header: "Email",
      cell: (p) => p.email ?? "—",
      mobileHidden: true,
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl text-[var(--text-emphasis)]">Pacientes</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-[var(--text-on-accent)] rounded-md text-sm font-medium hover:bg-[var(--color-primary-hover)]"
        >
          <Plus className="w-4 h-4" />
          Nuevo
        </button>
      </div>

      <div className="relative w-full sm:max-w-md mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
        <input
          type="text"
          placeholder="Buscar por nombre o email..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-md text-base text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-[var(--color-primary)]" />
        </div>
      ) : (
        <ResponsiveTable
          columns={columns}
          rows={patients ?? []}
          rowKey={(p) => p.id}
          emptyMessage="No se encontraron pacientes."
          onRowClick={(p) => setEditing(p)}
        />
      )}

      {showForm && (
        <PatientForm
          onSubmit={handleCreate}
          onCancel={() => setShowForm(false)}
        />
      )}

      {editing && (
        <PatientForm
          initialData={editing}
          onSubmit={handleUpdate}
          onCancel={() => setEditing(null)}
          onDelete={() => handleDelete(editing.id)}
        />
      )}
    </div>
  );
}
