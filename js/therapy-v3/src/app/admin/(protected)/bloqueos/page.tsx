"use client";

import { useState } from "react";
import {
  useBlockedSlots,
  useCreateBlockedSlot,
  useDeleteBlockedSlot,
} from "@/hooks/use-blocked-slots";
import { Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

function BlockedSlotForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (data: { start_at: string; end_at: string; reason: string; recurring: boolean }) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    start_at: "",
    end_at: "",
    reason: "",
    recurring: false,
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit(form);
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)] w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b border-[var(--border-color)]">
          <h3 className="font-medium text-[var(--text-primary)]">Nuevo bloqueo</h3>
          <button onClick={onCancel} className="p-1 hover:bg-[var(--bg-tertiary)] rounded">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-[var(--text-secondary)]">Inicio</label>
            <input
              type="datetime-local"
              value={form.start_at}
              onChange={(e) => setForm({ ...form, start_at: e.target.value })}
              className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-md text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-[var(--text-secondary)]">Fin</label>
            <input
              type="datetime-local"
              value={form.end_at}
              onChange={(e) => setForm({ ...form, end_at: e.target.value })}
              className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-md text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-[var(--text-secondary)]">Motivo</label>
            <input
              type="text"
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-md text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="recurring"
              checked={form.recurring}
              onChange={(e) => setForm({ ...form, recurring: e.target.checked })}
              className="w-4 h-4"
            />
            <label htmlFor="recurring" className="text-sm text-[var(--text-secondary)]">Recurrente</label>
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
              Crear
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function BloqueosPage() {
  const { data: slots, isLoading } = useBlockedSlots();
  const createSlot = useCreateBlockedSlot();
  const deleteSlot = useDeleteBlockedSlot();

  const [showForm, setShowForm] = useState(false);

  async function handleCreate(data: { start_at: string; end_at: string; reason: string; recurring: boolean }) {
    try {
      await createSlot.mutateAsync(data);
      toast.success("Bloqueo creado");
      setShowForm(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al crear");
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("¿Eliminar este bloqueo?")) return;
    try {
      await deleteSlot.mutateAsync(id);
      toast.success("Bloqueo eliminado");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al eliminar");
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl text-[var(--text-emphasis)]">Bloqueos</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-[var(--text-on-accent)] rounded-md text-sm font-medium hover:bg-[var(--color-primary-hover)]"
        >
          <Plus className="w-4 h-4" />
          Nuevo
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-16 bg-[var(--bg-secondary)] rounded-lg animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--border-color)]">
                <th className="text-left px-4 py-3 text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wide">Inicio</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wide">Fin</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wide">Motivo</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wide">Recurrente</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {slots?.map((s) => (
                <tr key={s.id} className="border-b border-[var(--border-color-subtle)] last:border-0">
                  <td className="px-4 py-3 text-sm text-[var(--text-primary)]">
                    {format(parseISO(s.start_at), "dd/MM/yyyy HH:mm", { locale: es })}
                  </td>
                  <td className="px-4 py-3 text-sm text-[var(--text-secondary)]">
                    {format(parseISO(s.end_at), "dd/MM/yyyy HH:mm", { locale: es })}
                  </td>
                  <td className="px-4 py-3 text-sm text-[var(--text-secondary)]">{s.reason ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                      s.recurring
                        ? "bg-[var(--color-info-bg)] text-[var(--color-info)]"
                        : "bg-[var(--bg-tertiary)] text-[var(--text-tertiary)]"
                    }`}>
                      {s.recurring ? "Sí" : "No"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleDelete(s.id)}
                      className="p-1.5 text-[var(--text-tertiary)] hover:text-[var(--color-error)] hover:bg-[var(--bg-tertiary)] rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <BlockedSlotForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} />
      )}
    </div>
  );
}
