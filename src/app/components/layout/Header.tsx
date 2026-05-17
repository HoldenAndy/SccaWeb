import { useNavigate } from "react-router";
import { Wifi, WifiOff, Menu, X, LogOut, ChevronDown, Search, Settings } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useAnalysis } from "../../contexts/AnalysisContext";
import { NotificationsBell } from "../shared/NotificationsBell";
import { ThemeToggle } from "../shared/ThemeToggle";

interface Props {
  onToggleSidebar: () => void;
  sidebarOpen: boolean;
}

export function Header({ onToggleSidebar, sidebarOpen }: Props) {
  const [time, setTime] = useState(new Date());
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const { user, logout } = useAuth();
  const { nodos, idNodoActivo, ultimaLectura } = useAnalysis();
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

  // Última actualización: derived from ultimaLectura.fechaHora (B10).
  let lastUpdateSec: number | null = null;
  if (ultimaLectura?.fechaHora) {
    try {
      const d = typeof ultimaLectura.fechaHora === "string"
        ? new Date(ultimaLectura.fechaHora)
        : new Date(ultimaLectura.fechaHora[0], ultimaLectura.fechaHora[1] - 1, ultimaLectura.fechaHora[2], ultimaLectura.fechaHora[3], ultimaLectura.fechaHora[4], ultimaLectura.fechaHora[5]);
      lastUpdateSec = Math.floor((time.getTime() - d.getTime()) / 1000);
    } catch { /* ignore */ }
  }
  const lastUpdateLabel =
    lastUpdateSec === null ? "—"
    : lastUpdateSec < 60 ? `hace ${lastUpdateSec}s`
    : lastUpdateSec < 3600 ? `hace ${Math.floor(lastUpdateSec / 60)} min`
    : `hace ${Math.floor(lastUpdateSec / 3600)} h`;

  const timeStr = time.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  // Cmd/Ctrl detection for label
  const isMac = typeof navigator !== "undefined" && navigator.platform.toLowerCase().includes("mac");

  return (
    <header className="h-14 bg-[var(--scca-bg)] border-b border-[var(--scca-hair)] px-3 md:px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3 min-w-0">
        <button
          className="md:hidden p-1.5 rounded hover:bg-[var(--scca-surface)] transition-colors"
          onClick={onToggleSidebar}
        >
          {sidebarOpen ? <X size={16} strokeWidth={1.5} /> : <Menu size={16} strokeWidth={1.5} />}
        </button>

        {/* ESP32 status (sin la mención "backend") */}
        <div className="hidden md:flex items-center gap-2 text-[11px] min-w-0">
          <span className={`flex items-center gap-1.5 ${esp32Conectado ? "text-[var(--scca-ok)]" : "text-[var(--scca-muted)]"}`}>
            {esp32Conectado ? <Wifi size={12} strokeWidth={1.5} /> : <WifiOff size={12} strokeWidth={1.5} />}
            <span className="font-medium truncate max-w-[280px]">
              {esp32Conectado
                ? `ESP32 en línea${nodoActual ? ` · ${nodoActual.ubicacion}` : ""}`
                : nodos.length === 0 ? "Sin nodos" : "ESP32 desconectado"}
            </span>
          </span>
          {lastUpdateSec !== null && (
            <>
              <span className="text-[var(--scca-faint)]">·</span>
              <span className="flex items-center gap-1 text-[var(--scca-muted)]">
                <span className={`w-1 h-1 rounded-full ${lastUpdateSec < 60 ? "bg-[var(--scca-ok)] animate-pulse" : "bg-[var(--scca-faint)]"}`} />
                actualizado <span className="font-mono">{lastUpdateLabel}</span>
              </span>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        {/* Quick "Cmd+K" trigger */}
        <button
          onClick={() => {
            const ev = new KeyboardEvent("keydown", { key: "k", metaKey: isMac, ctrlKey: !isMac, bubbles: true });
            document.dispatchEvent(ev);
          }}
          className="hidden sm:flex items-center gap-2 text-[11px] text-[var(--scca-muted)] border border-[var(--scca-hair)] rounded-sm px-2 py-1 hover:bg-[var(--scca-surface)] transition-colors"
          title="Buscar / acciones"
        >
          <Search size={12} strokeWidth={1.5} />
          <span className="hidden md:inline">Buscar</span>
          <kbd className="font-mono text-[9.5px] border border-[var(--scca-hair)] rounded-sm px-1 py-0.5 ml-1">
            {isMac ? "⌘K" : "Ctrl+K"}
          </kbd>
        </button>

        <ThemeToggle compact />

        <NotificationsBell />

        <div className="hidden sm:flex flex-col items-end">
          <span className="text-[12px] text-[var(--scca-ink)] font-mono tabular-nums">{timeStr}</span>
          <span className="text-[10px] text-[var(--scca-muted)]">{time.toLocaleDateString("es-MX", { day: "2-digit", month: "short" })}</span>
        </div>

        <div className="relative" data-user-menu>
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-[var(--scca-surface)] transition-colors"
          >
            <div className="w-6 h-6 rounded-[3px] bg-[var(--scca-ink)] text-[var(--scca-bg)] flex items-center justify-center text-[10px] font-semibold">
              {user?.nombre?.charAt(0).toUpperCase() ?? "U"}
            </div>
            <span className="hidden sm:block text-[12px] text-[var(--scca-ink)] max-w-24 truncate">
              {user?.nombre ?? "Usuario"}
            </span>
            <ChevronDown size={11} strokeWidth={1.5} className="text-[var(--scca-muted)]" />
          </button>
          {userMenuOpen && (
            <div className="absolute right-0 top-full mt-1 w-56 bg-[var(--scca-bg)] border border-[var(--scca-hair)] rounded shadow-[0_4px_12px_rgba(0,0,0,0.06)] z-50 overflow-hidden scca-fade-in">
              <div className="px-3 py-2.5 border-b border-[var(--scca-hair)]">
                <p className="text-[12px] font-medium text-[var(--scca-ink)] truncate">{user?.nombre}</p>
                <p className="scca-caps mt-0.5" style={{ fontSize: 9.5 }}>{user?.rol?.replace("_", " ")}</p>
              </div>
              <button
                onClick={() => { setUserMenuOpen(false); navigate("/preferencias"); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-[var(--scca-ink-2)] hover:bg-[var(--scca-surface)] transition-colors"
              >
                <Settings size={12} strokeWidth={1.5} />
                Preferencias
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-[var(--scca-danger)] hover:bg-[var(--scca-danger-bg)] transition-colors"
              >
                <LogOut size={12} strokeWidth={1.5} />
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
