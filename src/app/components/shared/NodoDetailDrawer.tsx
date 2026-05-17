/* Right-side drawer with node details (C15). */

import { useEffect } from "react";
import { X, Wifi, WifiOff, MapPin, Hash, Clock, Activity } from "lucide-react";
import type { NodoDTO } from "../../../api/nodos";
import { formatFechaTabla } from "../../../lib/fechas";

interface Props {
  nodo: NodoDTO | null;
  onClose: () => void;
}

export function NodoDetailDrawer({ nodo, onClose }: Props) {
  useEffect(() => {
    if (!nodo) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [nodo, onClose]);

  if (!nodo) return null;

  const conectado = nodo.estadoConexion;

  const row = (label: string, value: React.ReactNode, mono = false) => (
    <div className="flex items-center justify-between py-2 border-b border-[var(--scca-hair-soft)] last:border-b-0">
      <span className="scca-caps">{label}</span>
      <span className={`text-[12.5px] text-[var(--scca-ink)] ${mono ? "font-mono" : ""}`}>{value}</span>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 scca-fade-in" onClick={onClose}>
      <div className="absolute inset-0 bg-black/30" />
      <aside
        className="absolute top-0 right-0 h-full w-full max-w-[440px] bg-[var(--scca-panel)] border-l border-[var(--scca-hair)] overflow-y-auto scca-drawer"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label={`Detalle del nodo ${nodo.macAddress}`}
      >
        <div className="px-5 py-4 border-b border-[var(--scca-hair)] flex items-start justify-between sticky top-0 bg-[var(--scca-panel)] z-10">
          <div>
            <div className="scca-caps text-[var(--scca-accent)] mb-1 flex items-center gap-1.5">
              <Hash size={11} strokeWidth={1.5} /> Nodo #{String(nodo.idNodo).padStart(3, "0")}
            </div>
            <h2 className="text-[18px] font-medium text-[var(--scca-ink)] tracking-[-0.01em] font-mono">{nodo.macAddress}</h2>
            <p className="text-[12px] text-[var(--scca-muted)] mt-1 flex items-center gap-1.5">
              <MapPin size={11} strokeWidth={1.5} /> {nodo.ubicacion}
            </p>
          </div>
          <button onClick={onClose} className="text-[var(--scca-muted)] hover:text-[var(--scca-ink)] p-1">
            <X size={16} strokeWidth={1.5} />
          </button>
        </div>

        <div className="px-5 py-4 space-y-5">
          {/* Status */}
          <div className={`rounded-md border p-4 flex items-start gap-3 ${
            conectado
              ? "bg-[var(--scca-ok-bg)] border-[var(--scca-hair)]"
              : "bg-[var(--scca-warn-bg)] border-[var(--scca-hair)]"
          }`}>
            {conectado
              ? <Wifi size={16} strokeWidth={1.5} className="text-[var(--scca-ok)] mt-0.5" />
              : <WifiOff size={16} strokeWidth={1.5} className="text-[var(--scca-warn)] mt-0.5" />
            }
            <div>
              <p className={`text-[13px] font-semibold ${conectado ? "text-[var(--scca-ok)]" : "text-[var(--scca-warn)]"}`}>
                {conectado ? "En línea" : "Desconectado"}
              </p>
              <p className={`text-[11.5px] mt-0.5 ${conectado ? "text-[var(--scca-ok)]" : "text-[var(--scca-warn)]"} opacity-85`}>
                {conectado
                  ? "El nodo está reportando lecturas al servidor."
                  : "El nodo no ha reportado en las últimas horas. Revisa la alimentación, la señal WiFi o el firmware."}
              </p>
            </div>
          </div>

          {/* Identificación */}
          <div>
            <div className="scca-caps mb-2">Identificación</div>
            <div className="border border-[var(--scca-hair)] rounded-md px-4 py-2">
              {row("ID interno", `#${String(nodo.idNodo).padStart(3, "0")}`, true)}
              {row("MAC Address", nodo.macAddress, true)}
              {row("Ubicación", nodo.ubicacion)}
              {row("Última lectura", nodo.ultimaLectura ? formatFechaTabla(nodo.ultimaLectura) : "Sin lecturas", true)}
            </div>
          </div>

          {/* Telemetría (mock pero ya con shape) */}
          <div>
            <div className="scca-caps mb-2">Telemetría</div>
            <div className="border border-[var(--scca-hair)] rounded-md px-4 py-2">
              {row("Firmware", "esp32-fw 2.4.1", true)}
              {row("RSSI WiFi", conectado ? "−58 dBm" : "—", true)}
              {row("Uptime", conectado ? "14 d · 06 h" : "—", true)}
              {row("Reinicios (24 h)", "0", true)}
            </div>
          </div>

          {/* Endpoints */}
          <div>
            <div className="scca-caps mb-2">Endpoints del nodo</div>
            <div className="border border-[var(--scca-hair)] rounded-md p-3 space-y-2">
              <div>
                <div className="scca-caps" style={{ fontSize: 9.5 }}>POST</div>
                <code className="font-mono text-[11px] text-[var(--scca-ink)] bg-[var(--scca-surface)] border border-[var(--scca-hair)] rounded-sm px-1.5 py-0.5 inline-block mt-1">
                  /api/v1/lecturas/hw/registrar
                </code>
              </div>
              <div>
                <div className="scca-caps" style={{ fontSize: 9.5 }}>Header</div>
                <code className="font-mono text-[11px] text-[var(--scca-ink)] bg-[var(--scca-surface)] border border-[var(--scca-hair)] rounded-sm px-1.5 py-0.5 inline-block mt-1">
                  X-Hardware-Api-Key
                </code>
              </div>
            </div>
          </div>

          {/* Acciones */}
          <div className="flex flex-col gap-2">
            <button className="w-full flex items-center justify-center gap-2 text-[12px] font-medium text-[var(--scca-ink-2)] border border-[var(--scca-hair)] rounded-sm py-2 hover:bg-[var(--scca-surface)] transition-colors">
              <Activity size={12} strokeWidth={1.5} /> Ver historial completo
            </button>
            <button className="w-full flex items-center justify-center gap-2 text-[12px] font-medium text-[var(--scca-ink-2)] border border-[var(--scca-hair)] rounded-sm py-2 hover:bg-[var(--scca-surface)] transition-colors">
              <Clock size={12} strokeWidth={1.5} /> Eventos del dispositivo
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}
