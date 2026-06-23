"use client";

import { useState, useMemo, useCallback } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import type {
  DatesSetArg,
  EventClickArg,
  EventContentArg,
} from "@fullcalendar/core";
import esLocale from "@fullcalendar/core/locales/es";
import { useQueries } from "@tanstack/react-query";
import { format, eachMonthOfInterval } from "date-fns";
import { es } from "date-fns/locale";
import { User, Tag } from "lucide-react";
import { useSettings } from "@/hooks/use-settings";
import { appointmentsApi } from "@/lib/api/appointments";
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

// Hex colors for FullCalendar events (can't use CSS vars in FC event bg)
const STATUS_EVENT_BG: Record<string, string> = {
  [APPOINTMENT_STATUS.confirmed]: "#5A7A5C",
  [APPOINTMENT_STATUS.pending]: "#B07C2A",
  [APPOINTMENT_STATUS.cancelled]: "#9B3A3A",
  [APPOINTMENT_STATUS.completed]: "#476A7A",
  [APPOINTMENT_STATUS.no_show]: "#78716C",
};

function EventContent({ arg }: { arg: EventContentArg }) {
  const appt = arg.event.extendedProps.appt as AdminAppointment | undefined;
  if (!appt) return null;
  const isMonthView = arg.view.type === "dayGridMonth";
  if (isMonthView) {
    return (
      <div className="fc-event-therapy px-1 truncate text-[0.7rem] font-medium leading-5">
        {format(arg.event.start!, "HH:mm")} {appt.patient_name}
      </div>
    );
  }
  return (
    <div className="fc-event-therapy px-1.5 py-0.5 overflow-hidden h-full flex flex-col gap-0.5">
      <span className="font-semibold text-[0.7rem] leading-tight truncate">
        {appt.patient_name}
      </span>
      <span className="text-[0.62rem] leading-tight truncate opacity-85">
        {appt.specialty_name}
      </span>
    </div>
  );
}

export default function TurnosPage() {
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [visibleMonths, setVisibleMonths] = useState<string[]>([
    format(new Date(), "yyyy-MM"),
  ]);

  const { data: settings } = useSettings();

  const calendarQueries = useQueries({
    queries: visibleMonths.map((month) => ({
      queryKey: ["appointments", "calendar", month],
      queryFn: () => appointmentsApi.calendar(month),
    })),
  });

  const events = useMemo(() => {
    return calendarQueries
      .flatMap((q) => q.data?.days ?? [])
      .flatMap((day) => day.appointments)
      .map((appt) => ({
        id: String(appt.id),
        title: appt.patient_name,
        start: appt.start_at,
        end: appt.end_at,
        backgroundColor: STATUS_EVENT_BG[appt.status] ?? "#175b5b",
        borderColor: STATUS_EVENT_BG[appt.status] ?? "#175b5b",
        textColor: "#FAF8F5",
        extendedProps: { appt },
      }));
  }, [calendarQueries]);

  const { businessHours, slotMinTime, slotMaxTime } = useMemo(() => {
    const ranges = settings?.business_hours_ranges ?? [];
    const workDays = settings?.business_work_days ?? [1, 2, 3, 4, 5];
    if (ranges.length === 0) {
      return {
        businessHours: {
          daysOfWeek: workDays,
          startTime: "08:00",
          endTime: "19:00",
        },
        slotMinTime: "08:00:00",
        slotMaxTime: "19:00:00",
      };
    }
    const starts = [...ranges.map((r) => r.start)].sort();
    const ends = [...ranges.map((r) => r.end)].sort();
    return {
      businessHours: ranges.map((r) => ({
        daysOfWeek: workDays,
        startTime: r.start,
        endTime: r.end,
      })),
      slotMinTime: starts[0] + ":00",
      slotMaxTime: ends[ends.length - 1] + ":00",
    };
  }, [settings]);

  const handleDatesSet = useCallback((arg: DatesSetArg) => {
    const months = eachMonthOfInterval({
      start: arg.start,
      end: arg.end,
    }).map((d) => format(d, "yyyy-MM"));
    setVisibleMonths(months);
  }, []);

  const handleEventClick = useCallback((arg: EventClickArg) => {
    if (arg.event.start) {
      setSelectedDay(format(arg.event.start, "yyyy-MM-dd"));
    }
  }, []);

  const selectedDayAppts = useMemo((): AdminAppointment[] => {
    if (!selectedDay) return [];
    return (
      calendarQueries
        .flatMap((q) => q.data?.days ?? [])
        .find((d) => d.date === selectedDay)
        ?.appointments.slice()
        .sort((a, b) => a.start_at.localeCompare(b.start_at)) ?? []
    );
  }, [calendarQueries, selectedDay]);

  return (
    <div>
      <h1 className="font-display text-2xl text-[var(--text-emphasis)] mb-6">
        Turnos
      </h1>

      <div className="therapy-calendar bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg p-4 mb-6">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          locale={esLocale}
          firstDay={1}
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          height="auto"
          events={events}
          businessHours={businessHours}
          slotMinTime={slotMinTime}
          slotMaxTime={slotMaxTime}
          slotDuration="00:30:00"
          datesSet={handleDatesSet}
          eventClick={handleEventClick}
          dateClick={({ dateStr }) => setSelectedDay(dateStr.substring(0, 10))}
          selectable
          dayMaxEvents={3}
          eventContent={(arg) => <EventContent arg={arg} />}
        />
      </div>

      {selectedDay && selectedDayAppts.length > 0 && (
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg p-6">
          <h2 className="font-medium text-[var(--text-primary)] mb-4">
            Turnos del{" "}
            {format(new Date(selectedDay + "T00:00:00"), "EEEE d 'de' MMMM", {
              locale: es,
            })}
          </h2>
          <div className="space-y-3">
            {selectedDayAppts.map((appt) => (
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
