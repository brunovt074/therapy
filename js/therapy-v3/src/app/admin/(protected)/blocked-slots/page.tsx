"use client";

import { useState } from "react";
import {
  useBlockedSlots,
  useCreateBlockedSlot,
  useDeleteBlockedSlot,
} from "@/hooks/use-blocked-slots";
import { ResponsiveTable, type Column } from "@/components/ui/responsive-table";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import type { BlockedSlot } from "@/types/blocked-slot";

function BlockedSlotForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (data: {
    start_at: string;
    end_at: string;
    reason: string;
    recurring: boolean;
  }) => void;
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
          <h3 className="font-medium text-[var(--text-primary)]">
            Nuevo bloqueo
          </h3>
          <button
            onClick={onCancel}
            className="p-1 hover:bg-[var(--bg-tertiary)] rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-[var(--text-secondary)]">
              Inicio
            </label>
            <input
              type="datetime-local"
              value={form.start_at}
              onChange={(e) => setForm({ ...form, start_at: e.target.value })}
              className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-md text-base text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-[var(--text-secondary)]">
              Fin
            </label>
            <input
              type="datetime-local"
              value={form.end_at}
              onChange={(e) => setForm({ ...form, end_at: e.target.value })}
              className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-md text-base text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-[var(--text-secondary)]">
              Motivo
            </label>
            <input
              type="text"
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-md text-base text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="recurring"
              checked={form.recurring}
              onChange={(e) =>
                setForm({ ...form, recurring: e.target.checked })
              }
              className="w-4 h-4"
            />
            <label
              htmlFor="recurring"
              className="text-sm text-[var(--text-secondary)]"
            >
              Recurrente
            </label>
          </div>
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-2">
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

  async function handleCreate(data: {
    start_at: string;
    end_at: string;
    reason: string;
    recurring: boolean;
  }) {
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

  const columns: Column<BlockedSlot>[] = [
    {
      key: "start",
      header: "Inicio",
      cell: (s) =>
        format(parseISO(s.start_at), "dd/MM/yyyy HH:mm", { locale: es }),
    },
    {
      key: "end",
      header: "Fin",
      cell: (s) =>
        format(parseISO(s.end_at), "dd/MM/yyyy HH:mm", { locale: es }),
    },
    {
      key: "reason",
      header: "Motivo",
      cell: (s) => s.reason ?? "—",
    },
    {
      key: "recurring",
      header: "Recurrente",
      cell: (s) => (
        <Badge variant={s.recurring ? "info" : "neutral"}>
          {s.recurring ? "Sí" : "No"}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "",
      cell: (s) => (
        <button
          onClick={() => handleDelete(s.id)}
          className="p-1.5 text-[var(--text-tertiary)] hover:text-[var(--color-error)] hover:bg-[var(--bg-tertiary)] rounded"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl text-[var(--text-emphasis)]">
          Bloqueos
        </h1>
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
            <div
              key={i}
              className="h-16 bg-[var(--bg-secondary)] rounded-lg animate-pulse"
            />
          ))}
        </div>
      ) : (
        <ResponsiveTable
          columns={columns}
          rows={slots ?? []}
          rowKey={(s) => s.id}
          emptyMessage="No hay bloqueos registrados."
        />
      )}

      {showForm && (
        <BlockedSlotForm
          onSubmit={handleCreate}
          onCancel={() => setShowForm(false)}
        />
      )}
    </div>
  );
}
