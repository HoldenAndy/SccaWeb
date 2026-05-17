import { NavLink } from "react-router";
import { LayoutDashboard, LineChart, BrainCircuit, Users, ScrollText, Cpu } from "lucide-react";
import type { RolUsuario } from "../../api/auth";
import { hasRole } from "../../../lib/roles";
import type { SessionUser } from "../../contexts/AuthContext";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, description: "Tiempo real", roles: null as RolUsuario[] | null },
  { to: "/historial", label: "Historial", icon: LineChart, description: "Datos históricos", roles: null },
  { to: "/analisis-ia", label: "Análisis IA", icon: BrainCircuit, description: "Interpretación", roles: null },
  { to: "/usuarios", label: "Usuarios", icon: Users, description: "Gestión de acceso", roles: ["ADMINISTRADOR"] },
  { to: "/logs", label: "Logs", icon: ScrollText, description: "Eventos del servidor", roles: ["ADMINISTRADOR", "SOPORTE"] },
  { to: "/nodos", label: "Nodos", icon: Cpu, description: "Dispositivos ESP32", roles: ["ADMINISTRADOR", "SOPORTE", "GESTIONADOR"] },
] as const;

interface Props {
  open: boolean;
  onClose: () => void;
  user: SessionUser | null;
}

export function Sidebar({ open, onClose, user }: Props) {
  const visibleNavItems = navItems.filter((item) => {
    if (!item.roles) return true;
    return hasRole(user, item.roles);
  });

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/40 z-30 md:hidden backdrop-blur-sm" onClick={onClose} />
      )}
      <aside className={`${open ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 fixed md:relative z-40 h-full md:h-auto w-60 flex flex-col transition-transform duration-200 bg-[#0d1f3c] shadow-xl`} style={{ minHeight: "calc(100vh - 57px)" }}>
        <div className="px-4 pt-5 pb-2">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Módulos</p>
        </div>
        <nav className="flex flex-col gap-1 px-3 flex-1">
          {visibleNavItems.map(({ to, label, icon: Icon, description }) => (
            <NavLink key={to} to={to} end={to === "/"} onClick={onClose} className={({ isActive }) => `group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${isActive ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/10 text-cyan-400 border border-cyan-500/30" : "text-slate-400 hover:bg-white/5 hover:text-slate-200 border border-transparent"}`}>
              {({ isActive }) => (
                <>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${isActive ? "bg-cyan-500/20" : "bg-white/5 group-hover:bg-white/10"}`}>
                    <Icon size={15} className={isActive ? "text-cyan-400" : "text-slate-400 group-hover:text-slate-300"} />
                  </div>
                  <div>
                    <p className={`leading-none text-sm ${isActive ? "text-cyan-300 font-medium" : ""}`}>{label}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{description}</p>
                  </div>
                  {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400"></div>}
                </>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="px-4 pb-5 mt-auto">
          <p className="text-xs text-slate-600 text-center">AquaMonitor v2.1.0</p>
        </div>
      </aside>
    </>
  );
}
