"use client";

import { useActiveSpecialties } from "@/hooks/use-specialties";
import { FadeIn } from "./fade-in";

export function ServicesSection() {
  const { data: specialties, isLoading } = useActiveSpecialties();

  return (
    <section
      id="servicios"
      className="section"
      style={{ backgroundColor: "var(--bg-secondary)" }}
    >
      <div className="container">
        <FadeIn className="text-center mb-12">
          <span className="eyebrow mb-3 block">Nuestros servicios</span>
          <h2
            className="font-display text-[var(--text-emphasis)]"
            style={{ fontSize: "var(--text-3xl)" }}
          >
            Tratamientos especializados
          </h2>
          <p
            className="mt-4 mx-auto text-[var(--text-secondary)]"
            style={{ maxWidth: "52ch", fontSize: "var(--text-lg)" }}
          >
            Cada servicio está diseñado para atender tus necesidades con la más alta
            formación clínica y un enfoque 100% personalizado.
          </p>
        </FadeIn>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-48 rounded-[var(--radius-xl)] animate-pulse"
                style={{ backgroundColor: "var(--bg-canvas)" }}
              />
            ))}
          </div>
        ) : !specialties || specialties.length === 0 ? (
          <p
            className="text-center italic"
            style={{ color: "var(--text-tertiary)" }}
          >
            No hay especialidades disponibles por el momento.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {specialties.map((svc, i) => (
              <FadeIn key={svc.id} delay={i * 0.07}>
                <article
                  className="group h-full flex flex-col rounded-[var(--radius-xl)] overflow-hidden transition-all duration-300 hover:shadow-[var(--shadow-md)] hover:-translate-y-0.5"
                  style={{
                    backgroundColor: "var(--bg-canvas)",
                    border: "1px solid var(--border-color-subtle)",
                  }}
                >
                  <div
                    className="h-1.5 w-full"
                    style={{ backgroundColor: svc.color || "var(--color-primary)" }}
                  />
                  <div className="flex flex-col flex-1 p-7">
                    <h3
                      className="font-display text-[var(--text-emphasis)] mb-2"
                      style={{ fontSize: "var(--text-xl)", fontWeight: "var(--weight-medium)" }}
                    >
                      {svc.name}
                    </h3>
                    {svc.description && (
                      <p
                        className="text-[var(--text-secondary)] leading-relaxed"
                        style={{ fontSize: "var(--text-sm)" }}
                      >
                        {svc.description}
                      </p>
                    )}
                  </div>
                </article>
              </FadeIn>
            ))}

            {/* CTA card */}
            <FadeIn delay={specialties.length * 0.07}>
              <div
                className="h-full flex flex-col justify-between p-7 rounded-[var(--radius-xl)]"
                style={{
                  backgroundColor: "var(--color-primary)",
                  border: "1px solid var(--color-primary)",
                }}
              >
                <div>
                  <span
                    className="text-xs font-semibold uppercase tracking-widest block mb-3"
                    style={{ color: "rgba(250,248,245,0.7)" }}
                  >
                    ¿Tenés dudas?
                  </span>
                  <p
                    className="font-display"
                    style={{
                      color: "var(--text-on-accent)",
                      fontSize: "var(--text-xl)",
                      fontWeight: "var(--weight-medium)",
                      lineHeight: "var(--leading-snug)",
                    }}
                  >
                    Reservá una consulta y te asesoramos sin compromiso.
                  </p>
                </div>
                <a
                  href="/turnos"
                  className="mt-6 inline-flex items-center justify-center py-3 px-5 rounded-[var(--radius-md)] font-semibold no-underline transition-colors duration-200"
                  style={{
                    backgroundColor: "var(--bg-canvas)",
                    color: "var(--color-primary)",
                  }}
                >
                  Reservar turno
                </a>
              </div>
            </FadeIn>
          </div>
        )}
      </div>
    </section>
  );
}
