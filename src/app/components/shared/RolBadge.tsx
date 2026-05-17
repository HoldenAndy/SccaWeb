import { memo } from "react";
import { type RolUsuario } from "../../../api/auth";

const ROLES: Record<RolUsuario, { label: string; fg: string; bg: string }> = {
  ADMINISTRADOR: { label: "Administrador", fg: "text-[var(--scca-danger)]", bg: "bg-[var(--scca-danger-bg)]" },
  CLIENTE:       { label: "Cliente",       fg: "text-[var(--scca-accent)]", bg: "bg-[var(--scca-accent-soft)]" },
  SOPORTE:       { label: "Soporte",       fg: "text-[var(--scca-warn)]",   bg: "bg-[var(--scca-warn-bg)]" },
  GESTIONADOR:   { label: "Gestionador",   fg: "text-[#4a2570]",            bg: "bg-[#f4eef9]" },
};

export const RolBadge = memo(function RolBadge({ rol }: { rol: RolUsuario }) {
  const meta = ROLES[rol] ?? ROLES.CLIENTE;
  return (
    <span className={`inline-flex items-center text-[10px] font-medium uppercase tracking-[0.08em] px-1.5 py-0.5 rounded-sm ${meta.bg} ${meta.fg}`}>
      {meta.label}
    </span>
  );
});
