import { API_BASE_URL } from "@/lib/constants";
import { ApiError } from "@/types/api";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("therapy_token");
}

function getApiBaseUrl(): string {
  // When rewrites are configured, use relative paths in the browser
  if (typeof window !== "undefined") {
    return "";
  }
  // Server-side: use full URL
  return API_BASE_URL;
}

async function fetchWithAuth(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const baseUrl = getApiBaseUrl();
  const url = baseUrl ? `${baseUrl}${path}` : path;
  const token = getToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) ?? {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorDetail = `HTTP ${response.status}`;
    try {
      const errorBody = (await response.json()) as ApiError;
      errorDetail = errorBody.detail ?? errorDetail;
    } catch {
      // ignore parse error
    }
    throw new Error(errorDetail);
  }

  return response;
}

export const apiClient = {
  get: <T>(path: string): Promise<T> =>
    fetchWithAuth(path, { method: "GET" }).then((r) => r.json() as Promise<T>),

  post: <T>(path: string, body: unknown): Promise<T> =>
    fetchWithAuth(path, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((r) => r.json() as Promise<T>),

  patch: <T>(path: string, body: unknown): Promise<T> =>
    fetchWithAuth(path, {
      method: "PATCH",
      body: JSON.stringify(body),
    }).then((r) => r.json() as Promise<T>),

  delete: (path: string): Promise<void> =>
    fetchWithAuth(path, { method: "DELETE" }).then(() => undefined),
};
