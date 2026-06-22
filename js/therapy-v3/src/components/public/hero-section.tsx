"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const STATS = [
  { value: "+10 años", label: "de experiencia" },
  { value: "+500", label: "pacientes atendidos" },
  { value: "2", label: "especialistas certificadas" },
];

const ease = [0.16, 1, 0.3, 1] as const;

export function HeroSection() {
  return (
    <section
      className="relative flex flex-col justify-center min-h-[100svh] pt-24 pb-16"
      style={{ backgroundColor: "var(--bg-canvas)" }}
    >
      {/* Decorative background accent */}
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden
      >
        <div
          className="absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full opacity-[0.06]"
          style={{ background: "radial-gradient(circle, var(--color-terracota) 0%, transparent 70%)" }}
        />
        <div
          className="absolute bottom-0 -left-24 w-[400px] h-[400px] rounded-full opacity-[0.04]"
          style={{ background: "radial-gradient(circle, var(--color-salvia) 0%, transparent 70%)" }}
        />
      </div>

      <div className="container relative">
        <div className="max-w-3xl mx-auto text-center">
          <motion.span
            className="eyebrow mb-6 block"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease }}
          >
            Kinesiología · Rehabilitación · Bienestar
          </motion.span>

          <motion.h1
            className="font-display mb-6 text-[var(--text-emphasis)]"
            style={{
              fontSize: "var(--text-hero)",
              lineHeight: "var(--leading-tight)",
              letterSpacing: "var(--tracking-tighter)",
            }}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, ease, delay: 0.08 }}
          >
            Recuperá el movimiento
            <br />
            <span style={{ color: "var(--color-primary)" }}>que merecés</span>
          </motion.h1>

          <motion.p
            className="mx-auto mb-10 text-[var(--text-secondary)]"
            style={{
              fontSize: "var(--text-lg)",
              lineHeight: "var(--leading-relaxed)",
              maxWidth: "52ch",
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease, delay: 0.18 }}
          >
            Atención personalizada con profesionales certificadas. Tratamientos de
            kinesiología, rehabilitación postquirúrgica y bienestar terapéutico en Mendoza.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-3 justify-center"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease, delay: 0.28 }}
          >
            <Link
              href="/turnos"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-[var(--radius-md)] font-semibold text-[var(--text-on-accent)] bg-[var(--color-primary)] no-underline transition-all duration-200 hover:bg-[var(--color-primary-hover)] hover:shadow-[var(--shadow-accent)]"
            >
              Reservar turno
              <ArrowRight size={16} />
            </Link>
            <a
              href="#servicios"
              className="inline-flex items-center justify-center px-7 py-3.5 rounded-[var(--radius-md)] font-medium text-[var(--text-secondary)] bg-[var(--bg-secondary)] no-underline transition-all duration-200 hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-emphasis)]"
            >
              Ver servicios
            </a>
          </motion.div>
        </div>

        {/* Stats strip */}
        <motion.div
          className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease, delay: 0.42 }}
        >
          {STATS.map((s) => (
            <div
              key={s.value}
              className="text-center py-5 px-4 rounded-[var(--radius-lg)]"
              style={{
                backgroundColor: "var(--bg-secondary)",
                border: "1px solid var(--border-color-subtle)",
              }}
            >
              <p
                className="font-display font-medium text-[var(--color-primary)]"
                style={{ fontSize: "var(--text-2xl)" }}
              >
                {s.value}
              </p>
              <p className="text-sm text-[var(--text-tertiary)] mt-0.5">{s.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
