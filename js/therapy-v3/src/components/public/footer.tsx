import Image from "next/image";
import Link from "next/link";
import { MapPin, Phone } from "lucide-react";

function IconInstagram() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function IconFacebook() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

const SERVICES_LINKS = [
  "Kinesiología Traumatológica",
  "Kinesiología Deportiva",
  "Rehabilitación Postquirúrgica",
  "Pilates Terapéutico",
  "Terapias Wellness",
];

export function PublicFooter() {
  return (
    <footer
      style={{ backgroundColor: "var(--bg-tertiary)", borderTop: "1px solid var(--border-color)" }}
    >
      <div className="container py-14 grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">
        {/* Brand */}
        <div>
          <Image
            src="/logoTherapy2.png"
            alt="Therapy"
            width={52}
            height={52}
            className="mb-4 rounded-[var(--radius-md)]"
          />
          <p className="text-sm text-[var(--text-tertiary)] leading-relaxed max-w-xs">
            Consultorio de kinesiología, rehabilitación y bienestar terapéutico en Mendoza.
          </p>
          <div className="flex gap-3 mt-5">
            <a
              href="#"
              aria-label="Instagram"
              className="p-2 rounded-[var(--radius-base)] text-[var(--text-tertiary)] hover:text-[var(--color-primary)] hover:bg-[var(--bg-secondary)] no-underline transition-colors"
            >
              <IconInstagram />
            </a>
            <a
              href="#"
              aria-label="Facebook"
              className="p-2 rounded-[var(--radius-base)] text-[var(--text-tertiary)] hover:text-[var(--color-primary)] hover:bg-[var(--bg-secondary)] no-underline transition-colors"
            >
              <IconFacebook />
            </a>
          </div>
        </div>

        {/* Services */}
        <div>
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-4"
            style={{ color: "var(--text-tertiary)" }}
          >
            Servicios
          </p>
          <ul className="space-y-2">
            {SERVICES_LINKS.map((s) => (
              <li key={s}>
                <Link
                  href="/#servicios"
                  className="text-sm text-[var(--text-secondary)] hover:text-[var(--color-primary)] no-underline transition-colors"
                >
                  {s}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-4"
            style={{ color: "var(--text-tertiary)" }}
          >
            Contacto
          </p>
          <ul className="space-y-3 text-sm text-[var(--text-secondary)]">
            <li className="flex gap-2.5">
              <MapPin size={16} className="shrink-0 mt-0.5 text-[var(--color-primary)]" />
              Montecaseros 2396 esq. Champagnat, Mendoza
            </li>
            <li className="flex gap-2.5">
              <Phone size={16} className="shrink-0 mt-0.5 text-[var(--color-primary)]" />
              <a
                href="tel:+542604007766"
                className="no-underline text-[var(--text-secondary)] hover:text-[var(--color-primary)] transition-colors"
              >
                260-4007766
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div
        className="border-t py-5"
        style={{ borderColor: "var(--border-color-subtle)" }}
      >
        <div className="container flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[var(--text-tertiary)]">
          <span>© {new Date().getFullYear()} Therapy Consultorio. Todos los derechos reservados.</span>
          <Link href="/admin" className="no-underline text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors">
            Acceso profesionales
          </Link>
        </div>
      </div>
    </footer>
  );
}
