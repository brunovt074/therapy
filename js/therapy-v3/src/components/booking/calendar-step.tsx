"use client";

import { useState, useEffect } from "react";
import { useBookingStore } from "@/stores/use-booking-store";
import { useAvailableSlots } from "@/hooks/use-availability";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isToday,
  isBefore,
  startOfDay,
  parseISO,
  getDay,
} from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react";

/** Lunes=0 .. Domingo=6 */
function mondayBasedDay(date: Date): number {
  return (getDay(date) + 6) % 7;
}

export function CalendarStep() {
  const [currentMonth, setCurrentMonth] = useState<Date | null>(null);
  const [today, setToday] = useState<Date | null>(null);
  const selectedSpecialty = useBookingStore((s) => s.selectedSpecialty);
  const selectedDate = useBookingStore((s) => s.selectedDate);
  const selectedSlot = useBookingStore((s) => s.selectedSlot);
  const setDate = useBookingStore((s) => s.setDate);
  const setSlot = useBookingStore((s) => s.setSlot);
  const prevStep = useBookingStore((s) => s.prevStep);

  useEffect(() => {
    const now = new Date();
    setCurrentMonth(now);
    setToday(startOfDay(now));
  }, []);

  const { data: slots, isLoading: loadingSlots } = useAvailableSlots(
    selectedDate ?? "",
    selectedSpecialty?.id ?? 0
  );

  // Loading skeleton mientras hidrata en cliente (evita SSR mismatch)
  if (!currentMonth || !today) {
    return (
      <section>
        <div className="mb-7">
          <h2 className="font-display text-[1.85rem] font-medium text-[var(--text-emphasis)] mb-1 tracking-tight">
            Elegí fecha y hora
          </h2>
          <p className="text-[var(--text-tertiary)]">
            Seleccioná el día y horario que prefieras
          </p>
        </div>
        <div className="bg-[var(--bg-canvas)] border border-[var(--border-color)] rounded-lg p-6 h-[480px] animate-pulse" />
      </section>
    );
  }

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const offset = mondayBasedDay(monthStart);
  const isViewingCurrentMonth =
    format(currentMonth, "yyyy-MM") === format(today, "yyyy-MM");

  function handleDateSelect(day: Date) {
    setDate(format(day, "yyyy-MM-dd"));
  }

  function handleSlotSelect(slot: { start_at: string; end_at: string }) {
    setSlot(slot); // el store avanza a step 3
  }

  const availableSlots = (slots ?? []).filter((s) => s.available);

  return (
    <section>
      {/* Header */}
      <div className="mb-7">
        <h2 className="font-display text-[1.85rem] font-medium text-[var(--text-emphasis)] mb-1 tracking-tight">
          Elegí fecha y hora
        </h2>
        <p className="text-[var(--text-tertiary)]">
          Seleccioná el día y horario que prefieras{" "}
          {selectedSpecialty && (
            <span className="text-[var(--text-secondary)]">
              · {selectedSpecialty.name}
            </span>
          )}
        </p>
      </div>

      {/* Calendar card */}
      <div className="bg-[var(--bg-canvas)] border border-[var(--border-color)] rounded-lg p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-display text-[1.2rem] font-medium capitalize tracking-tight">
            {format(currentMonth, "MMMM yyyy", { locale: es })}
          </h3>
          <div className="flex gap-1.5">
            <button
              type="button"
              aria-label="Mes anterior"
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              disabled={isViewingCurrentMonth}
              className="w-9 h-9 rounded-md bg-[var(--bg-secondary)] border border-[var(--border-color-subtle)] flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              aria-label="Mes siguiente"
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="w-9 h-9 rounded-md bg-[var(--bg-secondary)] border border-[var(--border-color-subtle)] flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Day name row */}
        <div className="grid grid-cols-7 gap-1.5">
          {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((d) => (
            <div
              key={d}
              className="text-center font-semibold text-xs tracking-wide uppercase text-[var(--text-secondary)] py-1.5"
            >
              {d}
            </div>
          ))}

          {/* Padding empty cells antes del día 1 */}
          {Array.from({ length: offset }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}

          {days.map((day) => {
            const isPast = isBefore(day, today);
            // Heurística local: laborables = Mon-Fri. La disponibilidad real
            // se confirma cuando el usuario elige el día (useAvailableSlots).
            const dow = day.getDay();
            const isWorkDay = dow >= 1 && dow <= 5;
            const available = isWorkDay && !isPast;
            const isSelected =
              selectedDate === format(day, "yyyy-MM-dd");
            const todayMark = isToday(day);

            return (
              <button
                key={day.toISOString()}
                type="button"
                disabled={!available}
                onClick={() => handleDateSelect(day)}
                className={`aspect-square rounded-md text-[0.95rem] font-medium font-body transition-all border
                  ${
                    isSelected
                      ? "bg-[var(--color-primary)] text-[var(--text-on-accent)] border-[var(--color-primary)] shadow-[0_4px_12px_rgba(184,92,56,0.30)]"
                      : available
                      ? `bg-[rgba(184,92,56,0.10)] text-[var(--color-primary)] border-transparent hover:bg-[rgba(184,92,56,0.18)] hover:-translate-y-px ${
                          todayMark ? "border-[var(--color-primary)]" : ""
                        }`
                      : "bg-[var(--bg-secondary)] text-[var(--text-tertiary)] border-transparent opacity-45 cursor-not-allowed"
                  }`}
              >
                {format(day, "d")}
              </button>
            );
          })}
        </div>

        {/* Time slots */}
        {selectedDate && (
          <div className="mt-7 pt-6 border-t border-[var(--border-color-subtle)]">
            <p className="text-sm text-[var(--text-secondary)] mb-3 font-medium">
              Horarios disponibles —{" "}
              <span className="text-[var(--text-primary)]">
                {format(parseISO(selectedDate), "EEEE d 'de' MMMM", {
                  locale: es,
                })}
              </span>
            </p>

            {loadingSlots ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2.5">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-11 bg-[var(--bg-secondary)] rounded-md animate-pulse"
                  />
                ))}
              </div>
            ) : availableSlots.length === 0 ? (
              <p className="text-[var(--text-tertiary)] italic text-center py-6">
                No hay horarios disponibles para esta fecha.
              </p>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2.5">
                {availableSlots.map((slot) => {
                  const time = format(parseISO(slot.start_at), "HH:mm");
                  const isSelected =
                    selectedSlot?.start_at === slot.start_at;
                  return (
                    <button
                      key={slot.start_at}
                      type="button"
                      onClick={() => handleSlotSelect(slot)}
                      className={`h-11 rounded-md text-[0.95rem] font-medium tabular-nums transition-all border
                        ${
                          isSelected
                            ? "bg-[var(--color-primary)] border-[var(--color-primary)] text-[var(--text-on-accent)]"
                            : "bg-[var(--bg-canvas)] border-[var(--border-color)] text-[var(--text-primary)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] hover:-translate-y-px"
                        }`}
                    >
                      {time}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex justify-between items-center mt-6">
        <button
          type="button"
          onClick={prevStep}
          className="flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--color-primary)] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver
        </button>
      </div>
    </section>
  );
}
