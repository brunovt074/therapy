"use client";

import { useState } from "react";
import { usePatients } from "@/hooks/use-patients";
import { Search, Loader2 } from "lucide-react";
import Link from "next/link";

export default function PacientesPage() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const { data: patients, isLoading } = usePatients(debouncedQuery);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setDebouncedQuery(query);
  }

  return (
    <div>
      <h1 className="font-display text-2xl text-[var(--text-emphasis)] mb-6">
        Pacientes
      </h1>

      <form onSubmit={handleSearch} className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
          <input
            type="text"
            placeholder="Buscar por nombre o email..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-md text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
          />
        </div>
      </form>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-[var(--color-primary)]" />
        </div>
      ) : (
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--border-color)]">
                <th className="text-left px-4 py-3 text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wide">Nombre</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wide">Teléfono</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wide">Email</th>
              </tr>
            </thead>
            <tbody>
              {patients?.map((p) => (
                <tr key={p.id} className="border-b border-[var(--border-color-subtle)] last:border-0">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/pacientes/${p.id}`}
                      className="font-medium text-[var(--text-primary)] hover:text-[var(--color-primary)] no-underline"
                    >
                      {p.full_name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-sm text-[var(--text-secondary)]">{p.phone}</td>
                  <td className="px-4 py-3 text-sm text-[var(--text-secondary)]">{p.email ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
