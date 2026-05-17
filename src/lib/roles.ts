import type { RolUsuario } from "../api/auth";
import type { SessionUser } from "../app/contexts/AuthContext";

export function hasRole(user: SessionUser | null, roles: readonly RolUsuario[]): boolean {
  if (!user) return false;
  if (user.rol === "ADMINISTRADOR") return true;
  return roles.includes(user.rol);
}
