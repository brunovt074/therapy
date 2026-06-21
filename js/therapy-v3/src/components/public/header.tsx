"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

const NAV = [
  { href: "/#especialidades", label: "Especialidades" },
  { href: "/#nosotros", label: "Nosotros" },
  { href: "/#faq", label: "FAQ" },
  { href: "/#contacto", label: "Contacto" },
];

export function PublicHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <header
      className="fixed inset-x-0 top-0 z-50 transition-all duration-300"
      style={{
        backgroundColor: scrolled ? "var(--bg-overlay)" : "transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        borderBottom: scrolled ? "1px solid var(--border-color-subtle)" : "1px solid transparent",
        boxShadow: scrolled ? "var(--shadow-sm)" : "none",
      }}
    >
      <div className="container flex items-center justify-between h-16">
        <Link href="/" className="no-underline shrink-0">
          <Image
            src="/logoTherapy.png"
            alt="Therapy Consultorio"
            width={140}
            height={40}
            className="h-9 w-auto object-contain"
            priority
          />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-7">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-emphasis)] no-underline transition-colors duration-200"
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/appointments"
            className="hidden sm:inline-flex items-center px-5 py-2 rounded-[var(--radius-md)] text-sm font-semibold bg-[var(--color-primary)] text-[var(--text-on-accent)] no-underline transition-all duration-200 hover:bg-[var(--color-primary-hover)] hover:shadow-[var(--shadow-accent)]"
          >
            Reservar turno
          </Link>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden p-2 rounded-[var(--radius-base)] text-[var(--text-secondary)] hover:text-[var(--text-emphasis)] hover:bg-[var(--bg-secondary)] transition-colors"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden border-t border-[var(--border-color-subtle)] bg-[var(--bg-canvas)]">
          <nav className="container py-4 flex flex-col gap-1">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                onClick={() => setOpen(false)}
                className="px-3 py-2.5 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-emphasis)] hover:bg-[var(--bg-secondary)] rounded-[var(--radius-base)] no-underline transition-colors"
              >
                {n.label}
              </Link>
            ))}
            <Link
              href="/appointments"
              onClick={() => setOpen(false)}
              className="mt-3 mx-3 py-2.5 text-center rounded-[var(--radius-md)] text-sm font-semibold bg-[var(--color-primary)] text-[var(--text-on-accent)] no-underline"
            >
              Reservar turno
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
