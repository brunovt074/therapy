"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { appointmentsApi } from "@/lib/api/appointments";
import { Check, X, Loader2 } from "lucide-react";
import Link from "next/link";

export default function ConfirmarPage() {
  const params = useParams();
  const token = params.token as string;
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function confirm() {
      try {
        const result = await appointmentsApi.confirm(token);
        setStatus("success");
        setMessage(result.message);
      } catch (err) {
        setStatus("error");
        setMessage(err instanceof Error ? err.message : "Error al confirmar");
      }
    }
    confirm();
  }, [token]);

  return (
    <div className="max-w-[720px] mx-auto px-5 py-16 text-center">
      {status === "loading" && (
        <>
          <div className="inline-flex w-[84px] h-[84px] rounded-full bg-[var(--bg-secondary)] items-center justify-center mb-6">
            <Loader2 className="w-9 h-9 animate-spin text-[var(--color-primary)]" />
          </div>
          <h1 className="font-display text-[2.2rem] font-normal italic text-[var(--text-emphasis)] tracking-tight mb-3">
            Confirmando turno…
          </h1>
          <p className="text-[var(--text-secondary)] text-[1.05rem]">
            Un momento, por favor.
          </p>
        </>
      )}

      {status === "success" && (
        <>
          <div className="inline-flex w-[84px] h-[84px] rounded-full bg-[var(--color-success-bg)] border border-[rgba(90,122,92,0.3)] text-[var(--color-success)] items-center justify-center mb-6">
            <Check className="w-9 h-9" strokeWidth={2.5} />
          </div>
          <h1 className="font-display text-[2.2rem] font-normal italic text-[var(--text-emphasis)] tracking-tight mb-3">
            ¡Turno confirmado!
          </h1>
          <p className="text-[var(--text-secondary)] text-[1.05rem] max-w-sm mx-auto mb-2">
            {message || "Tu turno ha sido confirmado exitosamente."}
          </p>
        </>
      )}

      {status === "error" && (
        <>
          <div className="inline-flex w-[84px] h-[84px] rounded-full bg-[var(--color-error-bg)] border border-[rgba(155,58,58,0.2)] text-[var(--color-error)] items-center justify-center mb-6">
            <X className="w-9 h-9" strokeWidth={2.5} />
          </div>
          <h1 className="font-display text-[2.2rem] font-normal italic text-[var(--text-emphasis)] tracking-tight mb-3">
            No se pudo confirmar
          </h1>
          <p className="text-[var(--text-secondary)] text-[1.05rem] max-w-sm mx-auto mb-2">
            {message}
          </p>
        </>
      )}

      <div className="mt-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--color-primary)] text-[var(--text-on-accent)] rounded-md font-semibold no-underline shadow-[0_4px_14px_rgba(184,92,56,0.22)] hover:bg-[var(--color-primary-hover)] hover:-translate-y-px hover:shadow-[0_6px_18px_rgba(184,92,56,0.28)] transition-all"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
