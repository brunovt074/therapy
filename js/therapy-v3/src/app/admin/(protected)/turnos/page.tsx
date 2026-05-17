"use client";

import { useState } from "react";
import { useCalendar } from "@/hooks/use-appointments";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isToday,
  startOfDay,
  getDay,
} from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Clock, User, Tag } from "lucide-react";
import { APPOINTMENT_STATUS } from "@/lib/constants";
import type { AdminAppointment } from "@/types/api";

const STATUS_COLORS: Record<string, string> = {
  [APPOINTMENT_STATUS.confirmed]: "bg-emerald-100 text-emerald-700",
  [APPOINTMENT_STATUS.pending]: "bg-amber-100 text-amber-700",
  [APPOINTMENT_STATUS.cancelled]: "bg-red-100 text-red-600",
  [APPOINTMENT_STATUS.completed]: "bg-blue-100 text-blue-700",
  [APPOINTMENT_STATUS.no_show]: "bg-gray-100 text-gray-600",
};

const STATUS_LABELS: Record<string, string> = {
  [APPOINTMENT_STATUS.confirmed]: "Confirmado",
  [APPOINTMENT_STATUS.pending]: "Pendiente",
  [APPOINTMENT_STATUS.cancelled]: "Cancelado",
  [APPOINTMENT_STATUS.completed]: "Completado",
  [APPOINTMENT_STATUS.no_show]: "No asistió",
};

function mondayBasedDay(date: Date): number {
  return (getDay(date) + 6) % 7;
}

export default function TurnosPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const monthKey = format(currentMonth, "yyyy-MM");
  const { data: calendar, isLoading } = useCalendar(monthKey);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const offset = mondayBasedDay(monthStart);
  const today = startOfDay(new Date());

  const appointmentsByDay: Record<string, AdminAppointment[]> = {};
  for (const day of calendar?.days ?? []) {
    appointmentsByDay[day.date] = day.appointments;
  }

  return (
    <div>
      <h1 className="font-display text-2xl text-[var(--text-emphasis)] mb-6">Turnos</h1>

      <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-display text-[1.2rem] font-medium capitalize tracking-tight">
            {format(currentMonth, "MMMM yyyy", { locale: es })}
          </h3>
          <div className="flex gap-1.5">
            <button
              type="button"
              aria-label="Mes anterior"
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="w-9 h-9 rounded-md bg-[var(--bg-canvas)] border border-[var(--border-color-subtle)] flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              aria-label="Volver al mes actual"
              onClick={() => setCurrentMonth(new Date())}
              className="px-3 h-9 rounded-md bg-[var(--bg-canvas)] border border-[var(--border-color-subtle)] text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] transition-colors"
            >
              Hoy
            </button>
            <button
              type="button"
              aria-label="Mes siguiente"
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="w-9 h-9 rounded-md bg-[var(--bg-canvas)] border border-[var(--border-color-subtle)] flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="h-[400px] bg-[var(--bg-tertiary)] rounded animate-pulse" />
        ) : (
          <div className="grid grid-cols-7 gap-1.5">
            {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((d) => (
              <div
                key={d}
                className="text-center font-semibold text-xs tracking-wide uppercase text-[var(--text-secondary)] py-2"
              >
                {d}
              </div>
            ))}

            {Array.from({ length: offset }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}

            {days.map((day) => {
              const dateKey = format(day, "yyyy-MM-dd");
              const appts = appointmentsByDay[dateKey] ?? [];
              const isSelected = selectedDay === dateKey;
              const todayMark = isToday(day);

              return (
                <button
                  key={dateKey}
                  type="button"
                  onClick={() => setSelectedDay(isSelected ? null : dateKey)}
                  className={`aspect-square rounded-md flex flex-col items-center justify-center text-[0.95rem] font-medium transition-all border relative ${
                    isSelected
                      ? "bg-[var(--color-primary)] text-[var(--text-on-accent)] border-[var(--color-primary)]"
                      : todayMark
                      ? "bg-[var(--bg-canvas)] text-[var(--color-primary)] border-[var(--color-primary)]"
                      : "bg-[var(--bg-canvas)] text-[var(--text-primary)] border-[var(--border-color-subtle)] hover:border-[var(--border-color)]"
                  }`}
                >
                  <span>{format(day, "d")}</span>
                  {appts.length > 0 && (
                    <span
                      className={`text-[0.65rem] font-semibold mt-0.5 px-1.5 py-px rounded-full ${
                        isSelected
                          ? "bg-white/20 text-white"
                          : "bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
                      }`}
                    >
                      {appts.length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {selectedDay && appointmentsByDay[selectedDay] && (
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg p-6">
          <h2 className="font-medium text-[var(--text-primary)] mb-4">
            Turnos del{" "}
            {format(new Date(selectedDay + "T00:00:00"), "EEEE d 'de' MMMM", { locale: es })}
          </h2>
          <div className="space-y-3">
            {appointmentsByDay[selectedDay]
              .sort((a, b) => a.start_at.localeCompare(b.start_at))
              .map((appt) => (
                <div
                  key={appt.id}
                  className="bg-[var(--bg-canvas)] border border-[var(--border-color-subtle)] rounded-lg p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="flex flex-col items-center bg-[var(--bg-tertiary)] rounded-md px-2.5 py-1.5 flex-shrink-0">
                      <span className="text-sm font-semibold tabular-nums text-[var(--text-emphasis)]">
                        {format(new Date(appt.start_at), "HH:mm")}
                      </span>
                      <span className="text-[0.65rem] text-[var(--text-tertiary)] tabular-nums">
                        {format(new Date(appt.end_at), "HH:mm")}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-[var(--text-tertiary)] flex-shrink-0" />
                        <span className="font-medium text-sm text-[var(--text-primary)] truncate">
                          {appt.patient_name}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-1">
                        <Tag className="w-3.5 h-3.5 text-[var(--text-tertiary)] flex-shrink-0" />
                        <span className="text-xs text-[var(--text-secondary)] truncate">
                          {appt.specialty_name}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[appt.status] ?? "bg-gray-100 text-gray-600"}`}
                    >
                      {STATUS_LABELS[appt.status] ?? appt.status}
                    </span>
                    {appt.notes && (
                      <span className="text-xs text-[var(--text-tertiary)] italic hidden sm:inline">
                        {appt.notes}
                      </span>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
