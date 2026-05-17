/* Command palette (Cmd/Ctrl+K) — A6.
 * Lightweight, keyboard-driven nav and actions. No external deps. */

import { useEffect, useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router";
import {
  LayoutDashboard, LineChart, BrainCircuit, Cpu, Users, ScrollText, Settings,
  Search, ArrowRight, RefreshCw, Sun, Moon, Monitor,
} from "lucide-react";
import { useAnalysis } from "../../contexts/AnalysisContext";
import { useUIPrefs } from "../../contexts/UIPrefsContext";
import { useAuth } from "../../contexts/AuthContext";
import { hasRole } from "../../../lib/roles";

interface Cmd {
  id: string;
  label: string;
  hint?: string;
  group: "Navegar" | "Acciones" | "Apariencia" | "Nodos";
  icon: typeof Search;
  run: () => void;
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { nodos, cambiarNodoActivo, generarNuevoAnalisis, lecturaConImagen } = useAnalysis();
  const { theme: _theme, setTheme } = useUIPrefs();
  const { user } = useAuth();

  // Global hotkey
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toLowerCase().includes("mac");
      const cmdK = (isMac ? e.metaKey : e.ctrlKey) && e.key.toLowerCase() === "k";
      if (cmdK) {
        e.preventDefault();
        setOpen((v) => !v);
        setQuery("");
        setActive(0);
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [open]);

  const close = () => setOpen(false);

  const commands: Cmd[] = useMemo(() => {
    const cmds: Cmd[] = [
      { id: "nav:dash",   group: "Navegar", icon: LayoutDashboard, label: "Ir a Panel",         run: () => { navigate("/"); close(); } },
      { id: "nav:hist",   group: "Navegar", icon: LineChart,       label: "Ir a Historial",     run: () => { navigate("/historial"); close(); } },
      { id: "nav:ia",     group: "Navegar", icon: BrainCircuit,    label: "Ir a Análisis IA",   run: () => { navigate("/analisis-ia"); close(); } },
    ];
    if (hasRole(user, ["ADMINISTRADOR", "SOPORTE", "GESTIONADOR"])) {
      cmds.push({ id: "nav:nodos", group: "Navegar", icon: Cpu, label: "Ir a Nodos", run: () => { navigate("/nodos"); close(); } });
    }
    if (hasRole(user, ["ADMINISTRADOR"])) {
      cmds.push({ id: "nav:usr", group: "Navegar", icon: Users, label: "Ir a Usuarios", run: () => { navigate("/usuarios"); close(); } });
    }
    if (hasRole(user, ["ADMINISTRADOR", "SOPORTE"])) {
      cmds.push({ id: "nav:logs", group: "Navegar", icon: ScrollText, label: "Ir a Registros", run: () => { navigate("/logs"); close(); } });
    }
    cmds.push({ id: "nav:prefs", group: "Navegar", icon: Settings, label: "Preferencias", run: () => { navigate("/preferencias"); close(); } });

    cmds.push({
      id: "act:gen",
      group: "Acciones",
      icon: BrainCircuit,
      label: "Generar nuevo análisis IA",
      hint: !lecturaConImagen ? "Requiere imagen ESP32-CAM" : undefined,
      run: async () => { close(); if (lecturaConImagen) await generarNuevoAnalisis(); },
    });
    cmds.push({
      id: "act:refresh",
      group: "Acciones",
      icon: RefreshCw,
      label: "Refrescar página actual",
      run: () => { window.location.reload(); },
    });

    cmds.push({ id: "th:light",  group: "Apariencia", icon: Sun,     label: "Tema claro",      run: () => { setTheme("light"); close(); } });
    cmds.push({ id: "th:dark",   group: "Apariencia", icon: Moon,    label: "Tema oscuro",     run: () => { setTheme("dark"); close(); } });
    cmds.push({ id: "th:system", group: "Apariencia", icon: Monitor, label: "Tema del sistema", run: () => { setTheme("system"); close(); } });

    nodos.forEach((n) =>
      cmds.push({
        id: `node:${n.idNodo}`,
        group: "Nodos",
        icon: Cpu,
        label: `Activar nodo · ${n.ubicacion}`,
        hint: n.macAddress,
        run: () => { cambiarNodoActivo(n.idNodo); close(); },
      })
    );
    return cmds;
  }, [navigate, generarNuevoAnalisis, lecturaConImagen, setTheme, nodos, cambiarNodoActivo, user]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter((c) =>
      c.label.toLowerCase().includes(q) || c.hint?.toLowerCase().includes(q) || c.group.toLowerCase().includes(q)
    );
  }, [query, commands]);

  useEffect(() => { if (active >= filtered.length) setActive(0); }, [filtered, active]);

  const grouped = useMemo(() => {
    const m = new Map<string, Cmd[]>();
    filtered.forEach((c) => {
      if (!m.has(c.group)) m.set(c.group, []);
      m.get(c.group)!.push(c);
    });
    return Array.from(m.entries());
  }, [filtered]);

  if (!open) return null;

  const runActive = () => {
    if (filtered[active]) filtered[active].run();
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center bg-black/30 pt-[14vh] px-4 scca-fade-in"
      onClick={close}
    >
      <div
        className="w-full max-w-[560px] bg-[var(--scca-panel)] border border-[var(--scca-hair)] rounded-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Command palette"
      >
        <div className="flex items-center gap-2.5 px-4 py-3 border-b border-[var(--scca-hair)]">
          <Search size={14} strokeWidth={1.5} className="text-[var(--scca-muted)]" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setActive(0); }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") { e.preventDefault(); setActive((i) => Math.min(filtered.length - 1, i + 1)); }
              if (e.key === "ArrowUp")   { e.preventDefault(); setActive((i) => Math.max(0, i - 1)); }
              if (e.key === "Enter")     { e.preventDefault(); runActive(); }
            }}
            placeholder="Buscar páginas, nodos, acciones…"
            className="flex-1 bg-transparent text-[14px] text-[var(--scca-ink)] placeholder:text-[var(--scca-faint)] outline-none border-none"
          />
          <kbd className="text-[10px] text-[var(--scca-muted)] border border-[var(--scca-hair)] rounded-sm px-1.5 py-0.5 font-mono">esc</kbd>
        </div>

        <div className="max-h-[60vh] overflow-y-auto py-1">
          {grouped.length === 0 ? (
            <p className="text-center py-8 text-[12px] text-[var(--scca-muted)]">Sin resultados para "{query}"</p>
          ) : grouped.map(([group, items]) => (
            <div key={group} className="py-1">
              <div className="scca-caps px-4 py-1.5" style={{ fontSize: 9.5 }}>{group}</div>
              {items.map((c) => {
                const idx = filtered.indexOf(c);
                const isActive = idx === active;
                return (
                  <button
                    key={c.id}
                    onClick={c.run}
                    onMouseEnter={() => setActive(idx)}
                    className={`w-full flex items-center gap-3 px-4 py-2 text-left transition-colors ${
                      isActive ? "bg-[var(--scca-surface)]" : "bg-transparent"
                    }`}
                  >
                    <c.icon size={13} strokeWidth={1.5} className={isActive ? "text-[var(--scca-accent)]" : "text-[var(--scca-muted)]"} />
                    <span className="flex-1 text-[13px] text-[var(--scca-ink)]">{c.label}</span>
                    {c.hint && <span className="text-[10.5px] text-[var(--scca-muted)] font-mono">{c.hint}</span>}
                    {isActive && <ArrowRight size={11} strokeWidth={1.5} className="text-[var(--scca-accent)]" />}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        <div className="border-t border-[var(--scca-hair)] px-4 py-2 flex items-center justify-between text-[10.5px] text-[var(--scca-muted)]">
          <span className="flex items-center gap-1.5">
            <kbd className="border border-[var(--scca-hair)] rounded-sm px-1.5 py-0.5 font-mono">↑↓</kbd> navegar
            <kbd className="border border-[var(--scca-hair)] rounded-sm px-1.5 py-0.5 font-mono ml-2">↵</kbd> ejecutar
          </span>
          <span><kbd className="border border-[var(--scca-hair)] rounded-sm px-1.5 py-0.5 font-mono">⌘K</kbd> abrir/cerrar</span>
        </div>
      </div>
    </div>
  );
}
