export const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

/** Lee el token JWT guardado en sessionStorage */
function getToken(): string | null {
  return sessionStorage.getItem("scca_token");
}

/**
 * Wrapper de fetch con inyección automática del JWT.
 * Si no hay token (rutas públicas como /auth/*) no agrega la cabecera.
 */
export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options?.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    // 401 → sesión expirada, limpiar y redirigir al login
    if (res.status === 401) {
      sessionStorage.removeItem("scca_token");
      sessionStorage.removeItem("scca_user");
      window.location.href = "/login";
    }
    const text = await res.text().catch(() => "");
    throw new Error(`Error ${res.status}: ${text || res.statusText}`);
  }
  return res.json() as Promise<T>;
}
