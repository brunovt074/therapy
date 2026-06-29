"use client";

import { useState } from "react";
import {
  useAllSpecialties,
  useCreateSpecialty,
  useUpdateSpecialty,
  useActivateSpecialty,
  useDeactivateSpecialty,
} from "@/hooks/use-specialties";
import { Specialty, SpecialtyCreateInput, SpecialtyUpdateInput } from "@/types/specialty";
import { SpecialtyForm } from "@/components/admin/specialty-form";
import { ResponsiveTable, type Column } from "@/components/ui/responsive-table";
import { Plus } from "lucide-react";
import { toast } from "sonner";

function ToggleButton({ active, onToggle }: { active: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); onToggle(); }}
      title={active ? "Desactivar" : "Activar"}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${
        active ? "bg-[var(--color-success)]" : "bg-[var(--border-color)]"
      }`}
    >
      <span
        className={`inline-block h-3 w-3 transform rounded-full bg-white shadow transition-transform ${
          active ? "translate-x-5" : "translate-x-1"
        }`}
      />
    </button>
  );
}

export default function EspecialidadesPage() {
  const { data: specialties, isLoading } = useAllSpecialties();
  const createSpecialty = useCreateSpecialty();
  const updateSpecialty = useUpdateSpecialty();
  const activateSpecialty = useActivateSpecialty();
  const deactivateSpecialty = useDeactivateSpecialty();

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Specialty | null>(null);

  async function handleCreate(data: SpecialtyCreateInput | SpecialtyUpdateInput) {
    try {
      await createSpecialty.mutateAsync(data as SpecialtyCreateInput);
      toast.success("Especialidad creada");
      setShowForm(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al crear");
    }
  }

  async function handleUpdate(data: SpecialtyUpdateInput) {
    if (!editing) return;
    try {
      await updateSpecialty.mutateAsync({ id: editing.id, data });
      toast.success("Especialidad actualizada");
      setEditing(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al actualizar");
    }
  }

  async function handleToggle(s: Specialty) {
    try {
      if (s.active) {
        await deactivateSpecialty.mutateAsync(s.id);
        toast.success("Especialidad desactivada");
      } else {
        await activateSpecialty.mutateAsync(s.id);
        toast.success("Especialidad activada");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al cambiar estado");
    }
  }

  const columns: Column<Specialty>[] = [
    {
      key: "name",
      header: "Nombre",
      cell: (s) => (
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full shrink-0"
            style={{ backgroundColor: s.color }}
          />
          <span
            className={`font-medium ${
              s.active ? "text-[var(--text-primary)]" : "text-[var(--text-tertiary)]"
            }`}
          >
            {s.name}
          </span>
        </div>
      ),
    },
    {
      key: "duration",
      header: "Duración",
      cell: (s) => `${s.duration_min} min`,
    },
    {
      key: "slots",
      header: "Cupos",
      cell: (s) => s.max_slots,
    },
    {
      key: "active",
      header: "Activa",
      cell: (s) => (
        <ToggleButton active={s.active} onToggle={() => handleToggle(s)} />
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl text-[var(--text-emphasis)]">
          Especialidades
        </h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-[var(--text-on-accent)] rounded-md text-sm font-medium hover:bg-[var(--color-primary-hover)]"
        >
          <Plus className="w-4 h-4" />
          Nueva
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-16 bg-[var(--bg-secondary)] rounded-lg animate-pulse"
            />
          ))}
        </div>
      ) : (
        <ResponsiveTable
          columns={columns}
          rows={specialties ?? []}
          rowKey={(s) => s.id}
          emptyMessage="No hay especialidades registradas."
          onRowClick={(s) => setEditing(s)}
        />
      )}

      {showForm && (
        <SpecialtyForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} />
      )}

      {editing && (
        <SpecialtyForm
          initialData={editing}
          onSubmit={handleUpdate}
          onCancel={() => setEditing(null)}
        />
      )}
    </div>
  );
}
