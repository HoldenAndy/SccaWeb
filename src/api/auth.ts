import { API_BASE_URL, apiFetch } from "./apiClient";

export type RolUsuario = "ADMINISTRADOR" | "CLIENTE" | "SOPORTE" | "GESTIONADOR";

export interface AuthResponse {
  token: string;
  nombre: string;
  rol: RolUsuario;
  debeCambiarPassword: boolean;
}

export interface UsuarioDTO {
  idUsuario: number;
  nombre: string;
  email: string;
  rol: RolUsuario;
}

export interface UsuarioRequest {
  nombre: string;
  email: string;
  password: string;
  rol: RolUsuario;
}

// ─── Rutas públicas (sin token) ───────────────────────────────────────────
// Estas dos funciones usan fetch directo porque se llaman ANTES de tener
// un token (login) o pasando el token recién obtenido (cambiarPassword).
// El resto de funciones usan apiFetch, que inyecta el token automáticamente
// y redirige al login si recibe un 401.

/** Login → devuelve token + info del usuario */
export async function login(email: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Error ${res.status}`);
  }
  return res.json();
}

/** Cambiar contraseña temporal (requiere JWT recién obtenido) */
export async function cambiarPassword(newPassword: string, token: string): Promise<string> {
  const res = await fetch(`${API_BASE_URL}/api/v1/auth/cambiar-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ newPassword }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Error ${res.status}`);
  }
  return res.text();
}

// ─── Rutas protegidas (token inyectado por apiFetch) ─────────────────────
// FIX #2 y #4: eliminado el parámetro `token` manual. apiFetch lo lee de
// sessionStorage automáticamente y redirige al login si recibe un 401,
// igual que el resto de endpoints protegidos de la aplicación.

/** Listar todos los usuarios (solo ADMINISTRADOR) */
export function getUsuarios(): Promise<UsuarioDTO[]> {
  return apiFetch<UsuarioDTO[]>("/api/v1/usuarios");
}

/** Crear usuario (solo ADMINISTRADOR) */
export function crearUsuario(data: UsuarioRequest): Promise<UsuarioDTO> {
  return apiFetch<UsuarioDTO>("/api/v1/usuarios", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
