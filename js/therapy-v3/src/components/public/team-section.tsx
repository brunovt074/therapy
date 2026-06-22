import { CheckCircle2 } from "lucide-react";
import { FadeIn } from "./fade-in";

const TEAM = [
  {
    initials: "FS",
    name: "Florencia Sanchez",
    role: "Kinesióloga",
    credentials: [
      "Diplomatura en Deporte y Dolor Musculoesquelético",
      "Posgrado en Neurodinamia",
      "Técnica en PNF (FNP) y MEP",
      "Drenaje Linfático Manual",
      "Posgrado en Artroplastia de Cadera, Rodilla y Hombro",
      "Instructora de Pilates Reformer",
    ],
  },
  {
    initials: "YC",
    name: "Yanina Castro",
    role: "Masoterapéuta & Cosmiatra",
    credentials: [
      "Masoterapéuta",
      "Dermatocosmiatra",
      "Cosmetóloga",
      "Esteticista Corporal",
      "Drenaje Linfático Manual",
      "Stretching",
      "Instructora de Pilates Reformer",
    ],
  },
];

export function TeamSection() {
  return (
    <section
      id="nosotros"
      className="section"
      style={{ backgroundColor: "var(--bg-canvas)" }}
    >
      <div className="container">
        <FadeIn className="text-center mb-12">
          <span className="eyebrow mb-3 block">El equipo</span>
          <h2
            className="font-display text-[var(--text-emphasis)]"
            style={{ fontSize: "var(--text-3xl)" }}
          >
            Profesionales que te cuidan
          </h2>
          <p
            className="mt-4 mx-auto text-[var(--text-secondary)]"
            style={{ maxWidth: "52ch", fontSize: "var(--text-lg)" }}
          >
            Formación continua y dedicación real. Cada profesional trabaja con vos,
            no para un protocolo genérico.
          </p>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {TEAM.map((member, i) => (
            <FadeIn key={member.name} delay={i * 0.12} direction={i === 0 ? "left" : "right"}>
              <article
                className="p-8 rounded-[var(--radius-xl)]"
                style={{
                  backgroundColor: "var(--bg-secondary)",
                  border: "1px solid var(--border-color-subtle)",
                }}
              >
                {/* Avatar */}
                <div className="flex items-center gap-5 mb-6">
                  <div
                    className="flex items-center justify-center shrink-0 w-16 h-16 rounded-full font-display text-lg font-medium"
                    style={{
                      backgroundColor: "var(--color-primary)",
                      color: "var(--text-on-accent)",
                    }}
                  >
                    {member.initials}
                  </div>
                  <div>
                    <h3
                      className="font-display text-[var(--text-emphasis)]"
                      style={{
                        fontSize: "var(--text-xl)",
                        fontWeight: "var(--weight-medium)",
                      }}
                    >
                      {member.name}
                    </h3>
                    <p className="text-sm text-[var(--color-primary)] font-medium mt-0.5">
                      {member.role}
                    </p>
                  </div>
                </div>

                {/* Credentials */}
                <ul className="space-y-2.5">
                  {member.credentials.map((c) => (
                    <li key={c} className="flex gap-2.5 text-sm text-[var(--text-secondary)]">
                      <CheckCircle2
                        size={16}
                        className="shrink-0 mt-0.5"
                        style={{ color: "var(--color-salvia)" }}
                      />
                      {c}
                    </li>
                  ))}
                </ul>
              </article>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
