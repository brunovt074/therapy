"use client";

import { useActiveSpecialties } from "@/hooks/use-specialties";
import { useBookingStore } from "@/stores/use-booking-store";
import { Clock, ArrowRight } from "lucide-react";

/** Aclara/oscurece un hex `#RRGGBB` en X% (negativo = más oscuro). */
function shade(hex: string, percent: number): string {
  const n = parseInt(hex.replace("#", ""), 16);
  let r = (n >> 16) & 255,
    g = (n >> 8) & 255,
    b = n & 255;
  const f = 1 + percent / 100;
  r = Math.max(0, Math.min(255, Math.round(r * f)));
  g = Math.max(0, Math.min(255, Math.round(g * f)));
  b = Math.max(0, Math.min(255, Math.round(b * f)));
  return (
    "#" +
    [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")
  );
}

export function ServiceStep() {
  const { data: specialties, isLoading } = useActiveSpecialties();
  const setSpecialty = useBookingStore((s) => s.setSpecialty);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-56 bg-[var(--bg-secondary)] rounded-lg animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (!specialties || specialties.length === 0) {
    return (
      <div className="text-center py-16 text-[var(--text-tertiary)] italic">
        No hay especialidades disponibles por el momento.
      </div>
    );
  }

  return (
    <section>
      <div className="mb-7">
        <h2 className="font-display text-[1.85rem] font-medium text-[var(--text-emphasis)] mb-1 tracking-tight">
          Elegí tu especialidad
        </h2>
        <p className="text-[var(--text-tertiary)]">
          Seleccioná el tratamiento que querés reservar
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {specialties.map((s) => {
          const color = s.color || "#B85C38";
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => setSpecialty(s)}
              className="group text-left flex flex-col w-full bg-[var(--bg-secondary)] border border-[var(--border-color-subtle)] rounded-lg overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:border-[var(--border-color-emphasis)]"
            >
              {/* Swatch con color propio de la especialidad */}
              <div
                className="relative h-[90px] flex items-end px-5 py-4 text-[var(--text-on-accent)]"
                style={{
                  background: `linear-gradient(135deg, ${color}, ${shade(color, -14)})`,
                }}
              >
                <div className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[rgba(250,248,245,0.18)] backdrop-blur flex items-center justify-center text-sm font-medium">
                  {s.duration_min}′
                </div>
                <div className="text-[0.7rem] font-semibold tracking-[0.15em] uppercase opacity-90">
                  Especialidad
                </div>
              </div>

              <div className="flex flex-col flex-1 px-5 pt-[1.1rem] pb-5">
                <h3 className="font-display text-[1.2rem] font-medium text-[var(--text-emphasis)] mb-2 leading-snug tracking-tight">
                  {s.name}
                </h3>
                {s.description && (
                  <p className="text-sm text-[var(--text-tertiary)] leading-[1.55] mb-4 flex-1">
                    {s.description}
                  </p>
                )}
                <div className="flex justify-between items-center pt-3.5 border-t border-[var(--border-color-subtle)] text-sm text-[var(--text-secondary)]">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
                    {s.duration_min} min
                  </span>
                  <span className="text-xs text-[var(--text-tertiary)] tabular-nums">
                    {s.available_slots} {s.available_slots === 1 ? "Lugar" : "Lugares"}
                  </span>
                  <span className="flex items-center gap-1.5 text-[var(--color-primary)] opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all">
                    Continuar
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
