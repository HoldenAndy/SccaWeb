import { NavLink } from "react-router";
import { LayoutDashboard, LineChart, BrainCircuit, Users, ScrollText, Cpu, Settings } from "lucide-react";
import type { RolUsuario } from "../../api/auth";
import { hasRole } from "../../../lib/roles";
import type { SessionUser } from "../../contexts/AuthContext";

const navItems = [
  { to: "/",             label: "Panel",        desc: "Tiempo real",       icon: LayoutDashboard, roles: null as RolUsuario[] | null },
  { to: "/historial",    label: "Historial",    desc: "Datos históricos",  icon: LineChart,       roles: null },
  { to: "/analisis-ia",  label: "Análisis IA",  desc: "Interpretación",    icon: BrainCircuit,    roles: null },
  { to: "/nodos",        label: "Nodos",        desc: "Dispositivos",      icon: Cpu,             roles: ["ADMINISTRADOR", "SOPORTE", "GESTIONADOR"] },
  { to: "/usuarios",     label: "Usuarios",     desc: "Cuentas",           icon: Users,           roles: ["ADMINISTRADOR"] },
  { to: "/logs",         label: "Registros",    desc: "Eventos servidor",  icon: ScrollText,      roles: ["ADMINISTRADOR", "SOPORTE"] },
  { to: "/preferencias", label: "Preferencias", desc: "Apariencia · perfil", icon: Settings,      roles: null },
] as const;

interface Props {
  open: boolean;
  onClose: () => void;
  user: SessionUser | null;
}

export function Sidebar({ open, onClose, user }: Props) {
  const visibleNavItems = navItems.filter((item) => !item.roles || hasRole(user, item.roles));

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/30 z-30 md:hidden" onClick={onClose} />}
      <aside
        className={`${open ? "translate-x-0" : "-translate-x-full"} md:translate-x-0
          fixed md:relative z-40 h-screen md:h-auto w-[220px] flex-shrink-0
          flex flex-col transition-transform duration-200
          bg-[var(--scca-bg)] border-r border-[var(--scca-hair)]`}
      >
        {/* Brand */}
        <div className="px-5 pt-5 pb-4 border-b border-[var(--scca-hair)]">
          <NavLink to="/" className="flex items-baseline gap-1.5 rounded-sm">
            <span className="text-[22px] font-semibold text-[var(--scca-ink)] tracking-[-0.04em] leading-none">SCCA</span>
            <span className="text-[10px] text-[var(--scca-accent)] font-medium tracking-wider">v2.1</span>
          </NavLink>
          <p className="text-[11px] text-[var(--scca-muted)] mt-1.5 leading-snug max-w-[160px]">
            Sistema de Control de Calidad del Agua
          </p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-3 flex flex-col gap-px overflow-y-auto">
          <div className="scca-caps px-2.5 pb-2 pt-1">Módulos</div>
          {visibleNavItems.map(({ to, label, desc, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              onClick={onClose}
              className={({ isActive }) =>
                `group relative flex items-center gap-2.5 px-2.5 py-2 rounded text-[12.5px] transition-colors
                 ${isActive
                   ? "bg-[var(--scca-surface)] text-[var(--scca-ink)]"
                   : "text-[var(--scca-ink-2)] hover:bg-[var(--scca-hair-soft)]"}`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && <span className="absolute -left-3 top-1 bottom-1 w-[2px] bg-[var(--scca-accent)] rounded-full" aria-hidden />}
                  <Icon size={14} strokeWidth={1.5} className={isActive ? "text-[var(--scca-accent)]" : "text-[var(--scca-muted)]"} />
                  <span className={isActive ? "font-medium" : ""}>{label}</span>
                  <span className="ml-auto text-[10px] text-[var(--scca-faint)]">{desc}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer (sin "backend" tag) */}
        <div className="px-4 py-3 border-t border-[var(--scca-hair)] text-[10px] text-[var(--scca-faint)] flex items-center justify-between">
          <span>SCCA · v2.1.0</span>
          <kbd className="border border-[var(--scca-hair)] rounded-sm px-1.5 py-0.5 text-[9.5px] font-mono">⌘K</kbd>
        </div>
      </aside>
    </>
  );
}
