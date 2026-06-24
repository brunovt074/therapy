"use client";

import { useState, useEffect } from "react";
import { useSettings, useUpdateSettings } from "@/hooks/use-settings";
import { useAllSpecialties, useActivateSpecialty, useDeactivateSpecialty, useUpdateSpecialty } from "@/hooks/use-specialties";
import { useBlockedSlots, useCreateBlockedSlot, useDeleteBlockedSlot } from "@/hooks/use-blocked-slots";
import { Specialty, SpecialtyUpdateInput } from "@/types/specialty";
import { BlockedSlot } from "@/types/blocked-slot";
import { SpecialtyForm } from "@/components/admin/specialty-form";
import { TimeSelect } from "@/components/ui/time-select";
import { Save, Loader2, Plus, Trash2, Pencil, ChevronLeft, ChevronRight } from "lucide-react";
import { BusinessHoursRange } from "@/types/api";
import { toast } from "sonner";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  parseISO,
  getDay,
} from "date-fns";
import { es } from "date-fns/locale";

const DAY_LABELS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const ALL_DAYS = [0, 1, 2, 3, 4, 5, 6];

function mondayBasedDay(date: Date): number {
  return (getDay(date) + 6) % 7;
}

function dayOverlapsSlot(dateStr: string, slot: BlockedSlot): boolean {
  const dayStart = new Date(`${dateStr}T00:00:00.000Z`);
  const dayEnd = new Date(`${dateStr}T23:59:59.999Z`);
  return parseISO(slot.start_at) <= dayEnd && parseISO(slot.end_at) >= dayStart;
}

function SpecialtyToggle({ active, onToggle }: { active: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
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

function BlockedDaysCalendar() {
  const [calMonth, setCalMonth] = useState(new Date());
  const { data: blockedSlots = [] } = useBlockedSlots();
  const createSlot = useCreateBlockedSlot();
  const deleteSlot = useDeleteBlockedSlot();

  const monthStart = startOfMonth(calMonth);
  const monthEnd = endOfMonth(calMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const offset = mondayBasedDay(monthStart);

  async function toggleDay(day: Date) {
    const dateStr = format(day, "yyyy-MM-dd");
    const existing = blockedSlots.find((s) => dayOverlapsSlot(dateStr, s));
    if (existing) {
      try {
        await deleteSlot.mutateAsync(existing.id);
        toast.success("Día desbloqueado");
      } catch {
        toast.error("Error al desbloquear el día");
      }
    } else {
      try {
        await createSlot.mutateAsync({
          start_at: `${dateStr}T00:00:00Z`,
          end_at: `${dateStr}T23:59:59Z`,
          reason: "Día no disponible",
        });
        toast.success("Día bloqueado");
      } catch {
        toast.error("Error al bloquear el día");
      }
    }
  }

  const isBusy = createSlot.isPending || deleteSlot.isPending;

  return (
    <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg p-6 max-w-lg">
      <h2 className="font-medium text-[var(--text-primary)] mb-1">Días bloqueados</h2>
      <p className="text-xs text-[var(--text-tertiary)] mb-4">
        Hacé clic en un día para bloquearlo o desbloquearlo. Los días bloqueados no aparecerán disponibles para turnos.
      </p>

      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium capitalize text-[var(--text-primary)]">
          {format(calMonth, "MMMM yyyy", { locale: es })}
        </span>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => setCalMonth(subMonths(calMonth, 1))}
            className="w-7 h-7 rounded flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setCalMonth(addMonths(calMonth, 1))}
            className="w-7 h-7 rounded flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] transition-colors"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {DAY_LABELS.map((d) => (
          <div
            key={d}
            className="text-center text-[10px] font-semibold uppercase tracking-wide text-[var(--text-tertiary)] py-1"
          >
            {d}
          </div>
        ))}

        {Array.from({ length: offset }).map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}

        {days.map((day) => {
          const dateStr = format(day, "yyyy-MM-dd");
          const blocked = blockedSlots.some((s) => dayOverlapsSlot(dateStr, s));
          return (
            <button
              key={dateStr}
              type="button"
              disabled={isBusy}
              onClick={() => toggleDay(day)}
              title={blocked ? "Clic para desbloquear" : "Clic para bloquear"}
              className={`aspect-square rounded text-xs font-medium transition-all border
                ${
                  blocked
                    ? "bg-red-100 text-red-600 border-red-200 line-through opacity-70 hover:bg-red-200"
                    : "bg-[var(--bg-canvas)] text-[var(--text-secondary)] border-[var(--border-color-subtle)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                }
                disabled:cursor-not-allowed`}
            >
              {format(day, "d")}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function ConfiguracionPage() {
  const { data: settings, isLoading: loadingSettings } = useSettings();
  const { data: specialties, isLoading: loadingSpecialties } = useAllSpecialties();
  const updateSettingsMutation = useUpdateSettings();
  const activateSpecialty = useActivateSpecialty();
  const deactivateSpecialty = useDeactivateSpecialty();
  const updateSpecialty = useUpdateSpecialty();

  const [ranges, setRanges] = useState<BusinessHoursRange[]>([{ start: "09:00", end: "19:00" }]);
  const [workDays, setWorkDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [saved, setSaved] = useState(false);
  const [editingSpecialty, setEditingSpecialty] = useState<Specialty | null>(null);

  useEffect(() => {
    if (settings) {
      setRanges(settings.business_hours_ranges);
      setWorkDays(settings.business_work_days);
    }
  }, [settings]);

  function toggleDay(day: number) {
    setWorkDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()
    );
  }

  function updateRange(index: number, field: keyof BusinessHoursRange, value: string) {
    setRanges((prev) => prev.map((r, i) => (i === index ? { ...r, [field]: value } : r)));
  }

  function addRange() {
    setRanges((prev) => [...prev, { start: "08:00", end: "12:00" }]);
  }

  function removeRange(index: number) {
    setRanges((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSave() {
    setSaved(false);
    await updateSettingsMutation.mutateAsync({
      business_hours_ranges: ranges,
      business_work_days: workDays,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function handleSpecialtyToggle(s: Specialty) {
    try {
      if (s.active) {
        await deactivateSpecialty.mutateAsync(s.id);
        toast.success("Especialidad desactivada");
      } else {
        await activateSpecialty.mutateAsync(s.id);
        toast.success("Especialidad activada");
      }
    } catch {
      toast.error("Error al cambiar estado");
    }
  }

  async function handleSpecialtyUpdate(data: SpecialtyUpdateInput) {
    if (!editingSpecialty) return;
    try {
      await updateSpecialty.mutateAsync({ id: editingSpecialty.id, data });
      toast.success("Especialidad actualizada");
      setEditingSpecialty(null);
    } catch {
      toast.error("Error al actualizar especialidad");
    }
  }

  if (loadingSettings) {
    return (
      <div>
        <h1 className="font-display text-2xl text-[var(--text-emphasis)] mb-6">Configuración</h1>
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg p-6 max-w-lg mb-6 h-64 animate-pulse" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display text-2xl text-[var(--text-emphasis)] mb-6">Configuración</h1>

      <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg p-6 max-w-lg mb-6">
        <h2 className="font-medium text-[var(--text-primary)] mb-4">Parámetros del sistema</h2>

        <div className="space-y-5">
          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-1">Zona horaria</label>
            <input
              type="text"
              value={settings?.timezone ?? ""}
              disabled
              className="w-full px-3 py-2 rounded-md bg-[var(--bg-tertiary)] border border-[var(--border-color-subtle)] text-sm text-[var(--text-tertiary)] cursor-not-allowed"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm text-[var(--text-secondary)]">Rangos horarios</label>
              <button
                type="button"
                onClick={addRange}
                className="flex items-center gap-1 text-xs text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Agregar rango
              </button>
            </div>
            <div className="space-y-2">
              {ranges.map((range, i) => (
                <div key={i} className="flex items-center gap-2">
                  <TimeSelect
                    value={range.start}
                    onChange={(v) => updateRange(i, "start", v)}
                    className="flex-1"
                  />
                  <span className="text-xs text-[var(--text-tertiary)]">–</span>
                  <TimeSelect
                    value={range.end}
                    onChange={(v) => updateRange(i, "end", v)}
                    className="flex-1"
                  />
                  <button
                    type="button"
                    onClick={() => removeRange(i)}
                    disabled={ranges.length === 1}
                    className="p-1.5 rounded-md text-[var(--text-tertiary)] hover:text-red-500 hover:bg-red-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-2">Días laborables</label>
            <div className="flex gap-1.5 flex-wrap">
              {ALL_DAYS.map((day) => {
                const selected = workDays.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all border ${
                      selected
                        ? "bg-[var(--color-primary)] text-[var(--text-on-accent)] border-[var(--color-primary)]"
                        : "bg-[var(--bg-canvas)] text-[var(--text-tertiary)] border-[var(--border-color-subtle)] hover:border-[var(--border-color)] hover:text-[var(--text-secondary)]"
                    }`}
                  >
                    {DAY_LABELS[day]}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 mt-6">
          <button
            type="button"
            onClick={handleSave}
            disabled={updateSettingsMutation.isPending}
            className="flex items-center gap-2 px-4 py-2 rounded-md bg-[var(--color-primary)] text-[var(--text-on-accent)] text-sm font-medium hover:bg-[var(--color-primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {updateSettingsMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Guardar cambios
          </button>
          {saved && (
            <span className="text-sm text-green-600">Guardado correctamente</span>
          )}
          {updateSettingsMutation.isError && (
            <span className="text-sm text-red-500">Error al guardar</span>
          )}
        </div>
      </div>

      <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg p-6 max-w-lg mb-6">
        <h2 className="font-medium text-[var(--text-primary)] mb-1">Duración por especialidad</h2>
        <p className="text-xs text-[var(--text-tertiary)] mb-4">
          Configuración de duración, cupos y horario por especialidad.
        </p>

        {loadingSpecialties ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-9 bg-[var(--bg-tertiary)] rounded animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-1">
            {(specialties ?? []).map((s) => (
              <div
                key={s.id}
                className="flex justify-between items-center py-2 border-b border-[var(--border-color-subtle)] last:border-0"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
                  <span className={`text-sm truncate ${s.active ? "text-[var(--text-primary)]" : "text-[var(--text-tertiary)]"}`}>
                    {s.name}
                  </span>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0 ml-2">
                  <span className="text-xs text-[var(--text-tertiary)]">{s.duration_min} min · {s.max_slots} cupo{s.max_slots !== 1 ? "s" : ""}</span>
                  <button
                    onClick={() => setEditingSpecialty(s)}
                    className="p-1 text-[var(--text-tertiary)] hover:text-[var(--color-primary)] hover:bg-[var(--bg-tertiary)] rounded"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <SpecialtyToggle active={s.active} onToggle={() => handleSpecialtyToggle(s)} />
                </div>
              </div>
            ))}
            {(specialties ?? []).length === 0 && (
              <p className="text-sm text-[var(--text-tertiary)] italic">No hay especialidades registradas.</p>
            )}
          </div>
        )}
      </div>

      {/* <BlockedDaysCalendar /> */}

      {editingSpecialty && (
        <SpecialtyForm
          initialData={editingSpecialty}
          onSubmit={handleSpecialtyUpdate}
          onCancel={() => setEditingSpecialty(null)}
        />
      )}
    </div>
  );
}
