"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error("[global-error]", error);
  }, [error]);

  return (
    <html>
      <body>
        <div style={{ padding: "2rem", fontFamily: "monospace" }}>
          <h2 style={{ color: "red" }}>Error crítico de aplicación</h2>
          <pre style={{ background: "#fee", padding: "1rem", borderRadius: "4px", whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
            {error.message}
          </pre>
          {error.digest && <p style={{ color: "#666" }}>digest: {error.digest}</p>}
          <button onClick={unstable_retry} style={{ marginTop: "1rem", padding: "0.5rem 1rem", background: "red", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>
            Reintentar
          </button>
        </div>
      </body>
    </html>
  );
}
