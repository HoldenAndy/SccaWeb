import { Outlet, NavLink, useNavigate } from "react-router";
import {
  LayoutDashboard,
  LineChart,
  BrainCircuit,
  Droplets,
  Wifi,
  Menu,
  X,
  Clock,
  Activity,
  Users,
  LogOut,
  ChevronDown,
  ScrollText,
  Cpu,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, description: "Tiempo real", roles: null },
  { to: "/historial", label: "Historial", icon: LineChart, description: "Datos históricos", roles: null },
  { to: "/analisis-ia", label: "Análisis IA", icon: BrainCircuit, description: "Interpretación", roles: null },
  { to: "/usuarios", label: "Usuarios",  icon: Users,       description: "Gestión de acceso", roles: ["ADMINISTRADOR"]           },
  { to: "/logs",     label: "Logs",      icon: ScrollText,  description: "Eventos del servidor",  roles: ["ADMINISTRADOR", "SOPORTE"] },
  { to: "/nodos",    label: "Nodos",     icon: Cpu,         description: "Dispositivos ESP32",    roles: ["ADMINISTRADOR", "SOPORTE", "GESTIONADOR"] },
] as const;

const systemStatus = [
  { label: "ESP32", status: "online" },
  { label: "Base de Datos", status: "online" },
  { label: "Servidor API", status: "online" },
  { label: "Servicio IA", status: "warning" },
];

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [time, setTime] = useState(new Date());
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, logout, isAdmin, isSoporte } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Close user menu on outside click
  useEffect(() => {
    if (!userMenuOpen) return;
    const handle = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-user-menu]")) setUserMenuOpen(false);
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [userMenuOpen]);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const timeStr = time.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const dateStr = time.toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" });

  const visibleNavItems = navItems.filter((item) => {
    if (!item.roles) return true;
    if (isAdmin) return true;
    if (isSoporte && item.roles.includes("SOPORTE")) return true;
    if (user?.rol === "GESTIONADOR" && item.roles.includes("GESTIONADOR")) return true;
    return false;
  });

  return (
    <div className="min-h-screen bg-[#f0f6ff] flex flex-col" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Top header */}
      <header className="bg-white border-b border-slate-200 px-4 md:px-6 py-3 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            className="md:hidden p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X size={18} className="text-slate-600" /> : <Menu size={18} className="text-slate-600" />}
          </button>
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-sm">
              <Droplets size={16} className="text-white" />
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-semibold text-slate-800 leading-none">AquaMonitor</p>
              <p className="text-xs text-slate-400 leading-none mt-0.5">Sistema Inteligente de Agua</p>
            </div>
          </div>
        </div>

        {/* Center — connection status */}
        <div className="hidden md:flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <Wifi size={12} className="text-emerald-600" />
          <span className="text-xs font-medium text-emerald-700">ESP32 Conectado</span>
        </div>

        {/* Right — clock + user menu */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col items-end">
            <div className="flex items-center gap-1.5">
              <Clock size={11} className="text-slate-400" />
              <span className="text-xs font-medium text-slate-600" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                {timeStr}
              </span>
            </div>
            <span className="text-xs text-slate-400">{dateStr}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-cyan-50 border border-cyan-200 rounded-lg px-2.5 py-1">
            <Activity size={11} className="text-cyan-600" />
            <span className="text-xs font-medium text-cyan-700">En línea</span>
          </div>
          {/* User dropdown */}
          <div className="relative" data-user-menu>
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 rounded-lg px-2.5 py-1.5 transition-colors"
            >
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
                <span className="text-xs font-bold text-white">
                  {user?.nombre?.charAt(0).toUpperCase() ?? "U"}
                </span>
              </div>
              <span className="hidden sm:block text-xs font-medium text-slate-700 max-w-24 truncate">
                {user?.nombre ?? "Usuario"}
              </span>
              <ChevronDown size={11} className="text-slate-500" />
            </button>
            {userMenuOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-52 bg-white border border-slate-200 rounded-xl shadow-lg z-50 py-1.5 overflow-hidden">
                <div className="px-3 py-2 border-b border-slate-100 mb-1">
                  <p className="text-xs font-semibold text-slate-800 truncate">{user?.nombre}</p>
                  <p className="text-xs text-slate-400 capitalize">{user?.rol?.toLowerCase().replace("_", " ")}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={13} />
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
            md:translate-x-0 fixed md:relative z-40 h-full md:h-auto
            w-60 flex flex-col transition-transform duration-200
            bg-[#0d1f3c] shadow-xl
          `}
          style={{ minHeight: "calc(100vh - 57px)" }}
        >
          {/* Nav label */}
          <div className="px-4 pt-5 pb-2">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Módulos</p>
          </div>

          {/* Navigation */}
          <nav className="flex flex-col gap-1 px-3 flex-1">
            {visibleNavItems.map(({ to, label, icon: Icon, description }) => (
              <NavLink
                key={to}
                to={to}
                end={to === "/"}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/10 text-cyan-400 border border-cyan-500/30"
                      : "text-slate-400 hover:bg-white/5 hover:text-slate-200 border border-transparent"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${
                      isActive ? "bg-cyan-500/20" : "bg-white/5 group-hover:bg-white/10"
                    }`}>
                      <Icon size={15} className={isActive ? "text-cyan-400" : "text-slate-400 group-hover:text-slate-300"} />
                    </div>
                    <div>
                      <p className={`leading-none text-sm ${isActive ? "text-cyan-300 font-medium" : ""}`}>{label}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{description}</p>
                    </div>
                    {isActive && (
                      <div className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400"></div>
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Version */}
          <div className="px-4 pb-5 mt-auto">
            <p className="text-xs text-slate-600 text-center">AquaMonitor v2.1.0</p>
          </div>
        </aside>

        {/* Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-30 md:hidden backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}