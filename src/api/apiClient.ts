export const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

/** Lee el token JWT guardado en localStorage */
function getToken(): string | null {
  return localStorage.getItem("scca_token");
}

/**
 * Wrapper de fetch con inyección automática del JWT, timeout y manejo de 401.
 *
 * FIX #6a — Timeout de 15 s en cada request.
 * Si el backend no responde, el fetch ya no cuelga indefinidamente;
 * lanza un error con mensaje descriptivo que los componentes pueden mostrar.
 *
 * FIX #6b — 401 via evento global en lugar de window.location.href.
 * Antes: window.location.href forzaba un full-reload, saltándose el logout()
 * del AuthContext y dejando el estado de React sucio.
 * Ahora: se emite "auth:logout" → AuthContext lo escucha → llama logout()
 * → token pasa a null → AnalysisContext se limpia → el router redirige
 * sin recargar la página, manteniendo el ciclo de vida de React intacto.
 *
 * FIX storage — getToken() lee de localStorage (consistente con AuthContext).
 * El bloque 401 ya no necesita removeItem porque logout() en AuthContext
 * los elimina al recibir el evento "auth:logout".
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

  // FIX #6a: AbortController para timeout de 15 segundos.
  const controller = new AbortController();
  const timeoutId  = setTimeout(() => controller.abort(), 15_000);

  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
      signal: controller.signal,
    });
  } catch (err) {
    // AbortError = timeout; cualquier otro = red caída
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new Error("El servidor no respondió en el tiempo esperado (timeout 15 s).");
    }
    throw new Error("No se pudo conectar con el servidor. Verifica tu conexión.");
  } finally {
    clearTimeout(timeoutId);
  }

  if (!res.ok) {
    // FIX #6b: emitir evento en lugar de redirigir con window.location.href.
    // AuthContext escucha "auth:logout" → llama logout() → limpia localStorage.
    // No hace falta llamar removeItem aquí: logout() ya lo hace.
    if (res.status === 401) {
      window.dispatchEvent(new Event("auth:logout"));
      throw new Error("Sesión expirada. Por favor, inicia sesión nuevamente.");
    }
    const text = await res.text().catch(() => "");
    throw new Error(`Error ${res.status}: ${text || res.statusText}`);
  }

  return res.json() as Promise<T>;
}
