import { fetchWithTimeout, apiFetch } from "./apiClient";

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

export async function login(email: string, password: string): Promise<AuthResponse> {
  const res = await fetchWithTimeout("/api/v1/auth/login", {
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

export async function cambiarPassword(newPassword: string, token: string): Promise<string> {
  const res = await fetchWithTimeout("/api/v1/auth/cambiar-password", {
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

export function getUsuarios(): Promise<UsuarioDTO[]> {
  return apiFetch<UsuarioDTO[]>("/api/v1/usuarios");
}

export function crearUsuario(data: UsuarioRequest): Promise<UsuarioDTO> {
  return apiFetch<UsuarioDTO>("/api/v1/usuarios", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
