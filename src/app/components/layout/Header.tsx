import { NavLink, useNavigate } from "react-router";
import {
  Droplets,
  Wifi,
  WifiOff,
  Menu,
  X,
  Clock,
  Activity,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useAnalysis } from "../../contexts/AnalysisContext";

interface Props {
  onToggleSidebar: () => void;
  sidebarOpen: boolean;
}

export function Header({ onToggleSidebar, sidebarOpen }: Props) {
  const [time, setTime] = useState(new Date());
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const { user, logout } = useAuth();
  const { nodos, idNodoActivo } = useAnalysis();
  const navigate = useNavigate();

  const nodoActual = nodos.find((n) => n.idNodo === idNodoActivo);
  const esp32Conectado = nodoActual?.estadoConexion ?? false;

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

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

  return (
    <header className="bg-white border-b border-slate-200 px-4 md:px-6 py-3 flex items-center justify-between sticky top-0 z-50 shadow-sm">
      <div className="flex items-center gap-3">
        <button className="md:hidden p-1.5 rounded-lg hover:bg-slate-100 transition-colors" onClick={onToggleSidebar}>
          {sidebarOpen ? <X size={18} className="text-slate-600" /> : <Menu size={18} className="text-slate-600" />}
        </button>
        <NavLink to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-sm">
            <Droplets size={16} className="text-white" />
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-slate-800 leading-none">AquaMonitor</p>
            <p className="text-xs text-slate-400 leading-none mt-0.5">Sistema Inteligente de Agua</p>
          </div>
        </NavLink>
      </div>

      <div className={`hidden md:flex items-center gap-2 rounded-full px-3 py-1.5 border ${
        esp32Conectado ? "bg-emerald-50 border-emerald-200" : "bg-slate-50 border-slate-200"
      }`}>
        {esp32Conectado ? (
          <>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <Wifi size={12} className="text-emerald-600" />
            <span className="text-xs font-medium text-emerald-700">
              ESP32 Conectado{nodoActual ? ` · ${nodoActual.ubicacion}` : ""}
            </span>
          </>
        ) : (
          <>
            <span className="relative flex h-2 w-2">
              <span className="relative inline-flex rounded-full h-2 w-2 bg-slate-400"></span>
            </span>
            <WifiOff size={12} className="text-slate-400" />
            <span className="text-xs font-medium text-slate-500">
              {nodos.length === 0 ? "Sin nodos" : "ESP32 Desconectado"}
            </span>
          </>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden sm:flex flex-col items-end">
          <div className="flex items-center gap-1.5">
            <Clock size={11} className="text-slate-400" />
            <span className="text-xs font-medium text-slate-600" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{timeStr}</span>
          </div>
          <span className="text-xs text-slate-400">{dateStr}</span>
        </div>
        <div className="flex items-center gap-1.5 bg-cyan-50 border border-cyan-200 rounded-lg px-2.5 py-1">
          <Activity size={11} className="text-cyan-600" />
          <span className="text-xs font-medium text-cyan-700">En línea</span>
        </div>

        <div className="relative" data-user-menu>
          <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 rounded-lg px-2.5 py-1.5 transition-colors">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
              <span className="text-xs font-bold text-white">{user?.nombre?.charAt(0).toUpperCase() ?? "U"}</span>
            </div>
            <span className="hidden sm:block text-xs font-medium text-slate-700 max-w-24 truncate">{user?.nombre ?? "Usuario"}</span>
            <ChevronDown size={11} className="text-slate-500" />
          </button>
          {userMenuOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-52 bg-white border border-slate-200 rounded-xl shadow-lg z-50 py-1.5 overflow-hidden">
              <div className="px-3 py-2 border-b border-slate-100 mb-1">
                <p className="text-xs font-semibold text-slate-800 truncate">{user?.nombre}</p>
                <p className="text-xs text-slate-400 capitalize">{user?.rol?.toLowerCase().replace("_", " ")}</p>
              </div>
              <button onClick={handleLogout} className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-red-600 hover:bg-red-50 transition-colors">
                <LogOut size={13} />
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
