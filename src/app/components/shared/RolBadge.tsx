import { memo } from "react";
import { Shield } from "lucide-react";
import { type RolUsuario } from "../../../api/auth";

const ROLES: { value: RolUsuario; label: string; color: string; bg: string }[] = [
  { value: "ADMINISTRADOR", label: "Administrador", color: "text-red-600", bg: "bg-red-50 border-red-200" },
  { value: "CLIENTE", label: "Cliente", color: "text-blue-600", bg: "bg-blue-50 border-blue-200" },
  { value: "SOPORTE", label: "Soporte", color: "text-amber-600", bg: "bg-amber-50 border-amber-200" },
  { value: "GESTIONADOR", label: "Gestionador", color: "text-violet-600", bg: "bg-violet-50 border-violet-200" },
];

export const RolBadge = memo(function RolBadge({ rol }: { rol: RolUsuario }) {
  const meta = ROLES.find((r) => r.value === rol) ?? ROLES[1];
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border ${meta.bg} ${meta.color}`}>
      <Shield size={10} />
      {meta.label}
    </span>
  );
});
