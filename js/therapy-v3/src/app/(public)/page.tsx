import Link from "next/link";

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="section bg-[var(--bg-canvas)]">
        <div className="container text-center">
          <span className="eyebrow mb-4">Kinesiología & Fisioterapia</span>
          <h1 className="text-hero font-display mb-6 text-[var(--text-emphasis)]">
            Recuperá tu<br />calidad de vida
          </h1>
          <p className="mx-auto text-lg text-[var(--text-secondary)] mb-8 max-w-2xl">
            Atención personalizada con profesionales certificados. Turnos online,
            sin demoras.
          </p>
          <Link
            href="/turnos"
            className="inline-block px-8 py-3 bg-[var(--color-primary)] text-[var(--text-on-accent)] rounded-md font-medium transition-all hover:bg-[var(--color-primary-hover)] hover:shadow-[var(--shadow-accent)]"
          >
            Reservar turno
          </Link>
        </div>
      </section>

      {/* About */}
      <section className="section bg-[var(--bg-secondary)]">
        <div className="container">
          <div className="grid-editorial items-center">
            <div>
              <span className="eyebrow mb-4">Sobre nosotros</span>
              <h2 className="font-display text-3xl mb-4 text-[var(--text-emphasis)]">
                Experiencia y dedicación
              </h2>
              <p className="text-[var(--text-secondary)]">
                Más de 10 años brindando servicios de kinesiología, rehabilitación
                deportiva y tratamientos de dolor crónico. Cada paciente recibe
                un plan de tratamiento personalizado.
              </p>
            </div>
            <div className="bg-[var(--bg-tertiary)] rounded-lg h-64 flex items-center justify-center">
              <span className="text-[var(--text-tertiary)]">[Imagen]</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section bg-[var(--bg-canvas)]">
        <div className="container text-center">
          <h2 className="font-display text-3xl mb-4 text-[var(--text-emphasis)]">
            ¿Listo para empezar?
          </h2>
          <p className="text-[var(--text-secondary)] mb-8 max-w-xl mx-auto">
            Reservá tu turno en minutos. No necesitás llamar, no necesitás esperar.
          </p>
          <Link
            href="/turnos"
            className="inline-block px-8 py-3 bg-[var(--color-primary)] text-[var(--text-on-accent)] rounded-md font-medium transition-all hover:bg-[var(--color-primary-hover)]"
          >
            Reservar ahora
          </Link>
        </div>
      </section>
    </div>
  );
}
