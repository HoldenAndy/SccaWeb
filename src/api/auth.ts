import { API_BASE_URL } from "./apiClient";

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

/** Cambiar contraseña temporal (requiere JWT) */
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

/** Listar todos los usuarios (solo ADMINISTRADOR) */
export async function getUsuarios(token: string): Promise<UsuarioDTO[]> {
  const res = await fetch(`${API_BASE_URL}/api/v1/usuarios`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Error ${res.status}`);
  }
  return res.json();
}

/** Crear usuario (solo ADMINISTRADOR) */
export async function crearUsuario(data: UsuarioRequest, token: string): Promise<UsuarioDTO> {
  const res = await fetch(`${API_BASE_URL}/api/v1/usuarios`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Error ${res.status}`);
  }
  return res.json();
}
