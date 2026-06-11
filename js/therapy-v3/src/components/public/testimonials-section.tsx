import { Star } from "lucide-react";
import { FadeIn } from "./fade-in";

const TESTIMONIALS = [
  {
    name: "María González",
    treatment: "Rehabilitación postquirúrgica de rodilla",
    text: "Después de mi operación de rodilla, Florencia me ayudó a recuperar la movilidad completa en tiempo récord. El seguimiento personalizado hizo toda la diferencia.",
  },
  {
    name: "Carlos Pérez",
    treatment: "Kinesiología Deportiva",
    text: "Tenía una lesión de hombro que no mejoraba con nada. Con el tratamiento personalizado pude volver a entrenar en menos de dos meses. Excelentes profesionales.",
  },
  {
    name: "Luciana Morales",
    treatment: "Pilates Terapéutico",
    text: "Las sesiones de Pilates Terapéutico transformaron mi postura y el dolor de espalda que me molestaba hace años desapareció. Lo recomiendo sin dudarlo.",
  },
  {
    name: "Roberto Sánchez",
    treatment: "Terapias Wellness — Drenaje Linfático",
    text: "Yanina es una profesional increíble. El drenaje linfático me ayudó enormemente después de una cirugía. Atención de primera, ambiente muy cálido.",
  },
];

function Stars() {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={14}
          fill="var(--color-bisque)"
          style={{ color: "var(--color-bisque)" }}
        />
      ))}
    </div>
  );
}

export function TestimonialsSection() {
  return (
    <section
      className="section"
      style={{ backgroundColor: "var(--bg-secondary)" }}
    >
      <div className="container">
        <FadeIn className="text-center mb-12">
          <span className="eyebrow mb-3 block">Testimonios</span>
          <h2
            className="font-display text-[var(--text-emphasis)]"
            style={{ fontSize: "var(--text-3xl)" }}
          >
            Lo que dicen nuestros pacientes
          </h2>
        </FadeIn>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-4xl mx-auto">
          {TESTIMONIALS.map((t, i) => (
            <FadeIn key={t.name} delay={i * 0.08}>
              <blockquote
                className="flex flex-col gap-4 h-full p-7 rounded-[var(--radius-xl)]"
                style={{
                  backgroundColor: "var(--bg-canvas)",
                  border: "1px solid var(--border-color-subtle)",
                }}
              >
                <Stars />
                <p
                  className="flex-1 text-[var(--text-secondary)] leading-relaxed"
                  style={{ fontSize: "var(--text-sm)" }}
                >
                  &ldquo;{t.text}&rdquo;
                </p>
                <footer>
                  <p className="font-semibold text-sm text-[var(--text-emphasis)]">{t.name}</p>
                  <p className="text-xs text-[var(--text-tertiary)] mt-0.5">{t.treatment}</p>
                </footer>
              </blockquote>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
