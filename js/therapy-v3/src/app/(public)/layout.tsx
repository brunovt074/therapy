import Link from "next/link";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-[var(--border-color)] bg-[var(--bg-canvas)]">
        <div className="container flex items-center justify-between h-16">
          <Link href="/" className="font-display text-xl text-[var(--text-emphasis)] no-underline">
            Therapy
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] no-underline">
              Inicio
            </Link>
            <Link href="/turnos" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] no-underline">
              Reservar turno
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-[var(--border-color)] py-8 bg-[var(--bg-secondary)]">
        <div className="container text-center text-sm text-[var(--text-tertiary)]">
          Therapy — Consultorio de Kinesiología
        </div>
      </footer>
    </div>
  );
}
