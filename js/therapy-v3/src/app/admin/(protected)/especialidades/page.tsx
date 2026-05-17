"use client";

import { useState } from "react";
import {
  useAllSpecialties,
  useCreateSpecialty,
  useUpdateSpecialty,
  useDeactivateSpecialty,
} from "@/hooks/use-specialties";
import { Specialty, SpecialtyCreateInput, SpecialtyUpdateInput } from "@/types/specialty";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { toast } from "sonner";

function SpecialtyForm({
  initialData,
  onSubmit,
  onCancel,
}: {
  initialData?: Specialty;
  onSubmit: (data: SpecialtyCreateInput | SpecialtyUpdateInput) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    name: initialData?.name ?? "",
    slug: initialData?.slug ?? "",
    description: initialData?.description ?? "",
    duration_min: initialData?.duration_min ?? 45,
    color: initialData?.color ?? "#7B8C76",
    max_slots: initialData?.max_slots ?? 1,
    available_slots: initialData?.available_slots ?? 1,
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit(form);
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)] w-full max-w-lg max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between p-4 border-b border-[var(--border-color)]">
          <h3 className="font-medium text-[var(--text-primary)]">
            {initialData ? "Editar especialidad" : "Nueva especialidad"}
          </h3>
          <button onClick={onCancel} className="p-1 hover:bg-[var(--bg-tertiary)] rounded">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-[var(--text-secondary)]">Nombre *</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-md text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-[var(--text-secondary)]">Slug *</label>
            <input
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-md text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-[var(--text-secondary)]">Descripción</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-md text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              rows={2}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-[var(--text-secondary)]">Duración (min)</label>
              <input
                type="number"
                min={15}
                max={180}
                value={form.duration_min}
                onChange={(e) => setForm({ ...form, duration_min: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-md text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-[var(--text-secondary)]">Color</label>
              <input
                type="color"
                value={form.color}
                onChange={(e) => setForm({ ...form, color: e.target.value })}
                className="w-full h-10 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-md"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-[var(--text-secondary)]">Max slots</label>
              <input
                type="number"
                min={1}
                max={10}
                value={form.max_slots}
                onChange={(e) => setForm({ ...form, max_slots: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-md text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-[var(--text-secondary)]">Disponibles</label>
              <input
                type="number"
                min={1}
                max={10}
                value={form.available_slots}
                onChange={(e) => setForm({ ...form, available_slots: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-md text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              />
            </div>
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

export default function EspecialidadesPage() {
  const { data: specialties, isLoading } = useAllSpecialties();
  const createSpecialty = useCreateSpecialty();
  const updateSpecialty = useUpdateSpecialty();
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

  async function handleDeactivate(id: number) {
    if (!confirm("¿Desactivar esta especialidad?")) return;
    try {
      await deactivateSpecialty.mutateAsync(id);
      toast.success("Especialidad desactivada");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al desactivar");
    }
  }

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
            <div key={i} className="h-16 bg-[var(--bg-secondary)] rounded-lg animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--border-color)]">
                <th className="text-left px-4 py-3 text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wide">Nombre</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wide">Duración</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wide">Slots</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wide">Estado</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {specialties?.map((s) => (
                <tr key={s.id} className="border-b border-[var(--border-color-subtle)] last:border-0">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: s.color }}
                      />
                      <span className="font-medium text-[var(--text-primary)]">{s.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-[var(--text-secondary)]">{s.duration_min} min</td>
                  <td className="px-4 py-3 text-sm text-[var(--text-secondary)]">{s.available_slots}/{s.max_slots}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                      s.active
                        ? "bg-[var(--color-success-bg)] text-[var(--color-success)]"
                        : "bg-[var(--color-error-bg)] text-[var(--color-error)]"
                    }`}>
                      {s.active ? "Activa" : "Inactiva"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <button
                        onClick={() => setEditing(s)}
                        className="p-1.5 text-[var(--text-tertiary)] hover:text-[var(--color-primary)] hover:bg-[var(--bg-tertiary)] rounded"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeactivate(s.id)}
                        className="p-1.5 text-[var(--text-tertiary)] hover:text-[var(--color-error)] hover:bg-[var(--bg-tertiary)] rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <SpecialtyForm
          onSubmit={handleCreate}
          onCancel={() => setShowForm(false)}
        />
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
