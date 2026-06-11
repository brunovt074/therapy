import { Activity, Dumbbell, Stethoscope, PersonStanding, Sparkles } from "lucide-react";
import { FadeIn } from "./fade-in";

const SERVICES = [
  {
    Icon: Activity,
    title: "Kinesiología Traumatológica",
    description:
      "Tratamiento de lesiones musculares, articulares y óseas post-traumáticas. Evaluación, diagnóstico funcional y plan de rehabilitación individualizado.",
  },
  {
    Icon: Dumbbell,
    title: "Kinesiología Deportiva",
    description:
      "Prevención y recuperación de lesiones asociadas a la práctica deportiva. Vuelta al rendimiento óptimo para atletas de todos los niveles.",
  },
  {
    Icon: Stethoscope,
    title: "Rehabilitación Postquirúrgica",
    description:
      "Acompañamiento especializado tras cirugías ortopédicas de cadera, rodilla y hombro. Protocolos de recuperación según indicación del cirujano.",
  },
  {
    Icon: PersonStanding,
    title: "Pilates Terapéutico",
    description:
      "Método Pilates adaptado para rehabilitación y corrección postural, en Reformer y mat. Supervisado por instructoras certificadas con enfoque clínico.",
  },
  {
    Icon: Sparkles,
    title: "Terapias Wellness",
    description:
      "Masoterapia, drenaje linfático manual, cosmetología corporal y stretching para el bienestar integral del cuerpo.",
  },
];

export function ServicesSection() {
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {SERVICES.map((svc, i) => (
            <FadeIn key={svc.title} delay={i * 0.07}>
              <article
                className="group h-full flex flex-col p-7 rounded-[var(--radius-xl)] transition-all duration-300 hover:shadow-[var(--shadow-md)] hover:-translate-y-0.5"
                style={{
                  backgroundColor: "var(--bg-canvas)",
                  border: "1px solid var(--border-color-subtle)",
                }}
              >
                <div
                  className="mb-5 inline-flex p-3 rounded-[var(--radius-lg)]"
                  style={{ backgroundColor: "var(--bg-tertiary)" }}
                >
                  <svc.Icon
                    size={22}
                    style={{ color: "var(--color-primary)" }}
                    strokeWidth={1.75}
                  />
                </div>
                <h3
                  className="font-display text-[var(--text-emphasis)] mb-2"
                  style={{ fontSize: "var(--text-xl)", fontWeight: "var(--weight-medium)" }}
                >
                  {svc.title}
                </h3>
                <p
                  className="text-[var(--text-secondary)] leading-relaxed"
                  style={{ fontSize: "var(--text-sm)" }}
                >
                  {svc.description}
                </p>
              </article>
            </FadeIn>
          ))}

          {/* CTA card */}
          <FadeIn delay={SERVICES.length * 0.07}>
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
      </div>
    </section>
  );
}
