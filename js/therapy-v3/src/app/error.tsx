"use client";

import { useEffect } from "react";

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error("[app/error]", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-lg w-full bg-red-50 border border-red-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-red-800 mb-2">Error de aplicación</h2>
        <p className="text-sm text-red-700 font-mono break-all mb-4">{error.message}</p>
        {error.digest && (
          <p className="text-xs text-red-500 mb-4">digest: {error.digest}</p>
        )}
        <button
          onClick={unstable_retry}
          className="px-4 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700"
        >
          Reintentar
        </button>
      </div>
    </div>
  );
}
