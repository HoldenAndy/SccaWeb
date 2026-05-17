import { API } from "../lib/config";

export const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

const TIMEOUT_MESSAGE = "El servidor no respondió en el tiempo esperado (timeout 15 s).";

export async function fetchWithTimeout(path: string, options?: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API.TIMEOUT_MS);
  try {
    return await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      signal: controller.signal,
    });
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error(TIMEOUT_MESSAGE);
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function withRetry<T>(fn: () => Promise<T>, retries: number, delayMs: number): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    if (retries > 0) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      return withRetry(fn, retries - 1, delayMs);
    }
    throw err;
  }
}

function getToken(): string | null {
  return localStorage.getItem("scca_token");
}

export async function apiFetch<T>(path: string, options?: RequestInit, retries = 1): Promise<T> {
  const token = getToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options?.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetchWithTimeout(path, { ...options, headers });
  } catch (err) {
    if (err instanceof Error && err.message === TIMEOUT_MESSAGE) {
      throw err;
    }
    throw new Error("No se pudo conectar con el servidor. Verifica tu conexión.");
  }

  if (!res.ok) {
    if (res.status === 401) {
      window.dispatchEvent(new Event("auth:logout"));
      throw new Error("Sesión expirada. Por favor, inicia sesión nuevamente.");
    }
    if (res.status >= 500) {
      return withRetry(
        async () => {
          const retryRes = await fetchWithTimeout(path, { ...options, headers });
          if (!retryRes.ok) {
            const text = await retryRes.text().catch(() => "");
            throw new Error(`Error ${retryRes.status}: ${text || retryRes.statusText}`);
          }
          return retryRes.json() as Promise<T>;
        },
        retries,
        1000,
      );
    }
    const text = await res.text().catch(() => "");
    throw new Error(`Error ${res.status}: ${text || res.statusText}`);
  }

  return res.json() as Promise<T>;
}
