"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { TimeSelect } from "@/components/ui/time-select";
import { Specialty, SpecialtyCreateInput, SpecialtyUpdateInput } from "@/types/specialty";

const DAY_LABELS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

interface SpecialtyFormProps {
  initialData?: Specialty;
  onSubmit: (data: SpecialtyCreateInput | SpecialtyUpdateInput) => void;
  onCancel: () => void;
}

export function SpecialtyForm({ initialData, onSubmit, onCancel }: SpecialtyFormProps) {
  const [form, setForm] = useState({
    name: initialData?.name ?? "",
    description: initialData?.description ?? "",
    duration_min: initialData?.duration_min ?? 60,
    color: initialData?.color ?? "#7B8C76",
    max_slots: initialData?.max_slots ?? 1,
    schedule_days: initialData?.schedule_days ?? null as number[] | null,
    schedule_start: initialData?.schedule_start ?? "",
    schedule_end: initialData?.schedule_end ?? "",
  });

  const [showSchedule, setShowSchedule] = useState(
    !!(initialData?.schedule_days?.length || initialData?.schedule_start)
  );

  function toggleDay(day: number) {
    setForm((prev) => {
      const days = prev.schedule_days ?? [];
      const next = days.includes(day) ? days.filter((d) => d !== day) : [...days, day].sort();
      return { ...prev, schedule_days: next.length > 0 ? next : null };
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({
      name: form.name,
      description: form.description || null,
      duration_min: form.duration_min,
      color: form.color,
      max_slots: form.max_slots,
      schedule_days: showSchedule ? form.schedule_days : null,
      schedule_start: showSchedule && form.schedule_start ? form.schedule_start : null,
      schedule_end: showSchedule && form.schedule_end ? form.schedule_end : null,
    });
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

          <div>
            <label className="block text-sm font-medium mb-1 text-[var(--text-secondary)]">Cupos máx.</label>
            <input
              type="number"
              min={1}
              max={10}
              value={form.max_slots}
              onChange={(e) => setForm({ ...form, max_slots: Number(e.target.value) })}
              className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-md text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            />
            <p className="text-xs text-[var(--text-tertiary)] mt-1">
              Cantidad de pacientes que pueden reservar el mismo horario.
            </p>
          </div>

          <div className="border border-[var(--border-color)] rounded-md overflow-hidden">
            <button
              type="button"
              onClick={() => setShowSchedule(!showSchedule)}
              className="w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] transition-colors"
            >
              <span>Horario propio (opcional)</span>
              <span className="text-xs text-[var(--text-tertiary)]">{showSchedule ? "▲" : "▼"}</span>
            </button>

            {showSchedule && (
              <div className="p-3 border-t border-[var(--border-color)] space-y-3">
                <div>
                  <label className="block text-xs font-medium mb-1.5 text-[var(--text-tertiary)]">Días disponibles</label>
                  <div className="flex gap-1.5 flex-wrap">
                    {DAY_LABELS.map((label, day) => {
                      const selected = (form.schedule_days ?? []).includes(day);
                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() => toggleDay(day)}
                          className={`px-2.5 py-1 rounded text-xs font-medium transition-all border ${
                            selected
                              ? "bg-[var(--color-primary)] text-[var(--text-on-accent)] border-[var(--color-primary)]"
                              : "bg-[var(--bg-primary)] text-[var(--text-tertiary)] border-[var(--border-color-subtle)] hover:border-[var(--border-color)]"
                          }`}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1.5 text-[var(--text-tertiary)]">Rango horario</label>
                  <div className="flex items-center gap-2">
                    <TimeSelect
                      value={form.schedule_start}
                      onChange={(v) => setForm({ ...form, schedule_start: v })}
                      className="flex-1"
                    />
                    <span className="text-xs text-[var(--text-tertiary)]">–</span>
                    <TimeSelect
                      value={form.schedule_end}
                      onChange={(v) => setForm({ ...form, schedule_end: v })}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
            )}
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
