import { Camera } from "lucide-react";
import type { NodoDTO } from "../../../api/nodos";
import { formatHora } from "../../../lib/fechas";

interface CameraPanelProps {
  nodo: NodoDTO | undefined;
  lastCaptureTime: string | number[] | undefined;
}

export function CameraPanel({ nodo, lastCaptureTime }: CameraPanelProps) {
  return (
    <div className="border border-[var(--scca-hair)] rounded-md flex flex-col">
      <div className="px-4 py-3 border-b border-[var(--scca-hair)] flex items-center justify-between">
        <div>
          <h2 className="text-[12px] font-medium text-[var(--scca-ink)]">Cámara ESP32-CAM</h2>
          <p className="text-[10px] text-[var(--scca-muted)] mt-0.5">{nodo ? nodo.ubicacion : "Sin nodo seleccionado"}</p>
        </div>
        <span className={`inline-flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.08em] ${nodo?.estadoConexion ? "text-[var(--scca-ok)]" : "text-[var(--scca-muted)]"}`}>
          <span className={`w-1 h-1 rounded-full ${nodo?.estadoConexion ? "bg-[var(--scca-ok)]" : "bg-[var(--scca-faint)]"}`} />
          {nodo?.estadoConexion ? "Live" : "Offline"}
        </span>
      </div>
      <div
        className="flex-1 relative overflow-hidden min-h-[200px] flex flex-col items-center justify-center gap-2 border-b border-[var(--scca-hair)]"
        style={{ backgroundImage: `repeating-linear-gradient(135deg, var(--scca-surface) 0 8px, var(--scca-bg) 8px 16px)` }}
      >
        <div className="absolute inset-x-0 h-px bg-[var(--scca-accent)]/30" style={{ animation: "scanline 3s linear infinite" }} />
        <Camera size={26} strokeWidth={1.25} className="text-[var(--scca-muted)]" />
        <div className="text-center">
          <p className="text-[10px] font-mono text-[var(--scca-muted)]">640 × 480 px</p>
          <p className="text-[10px] text-[var(--scca-faint)] mt-0.5">Actualización · 10 s</p>
        </div>
        {nodo && (
          <span className="absolute bottom-2 left-0 right-0 text-center text-[10px] font-mono text-[var(--scca-muted)]">
            {nodo.macAddress}
          </span>
        )}
        <span className="absolute top-2 left-2 font-mono text-[9px] text-[var(--scca-muted)] tracking-wider">● REC</span>
      </div>
      <div className="px-4 py-2.5 flex items-center justify-between text-[11px]">
        <span className="text-[var(--scca-muted)]">Última captura</span>
        <span className="font-mono text-[var(--scca-ink)]">{lastCaptureTime ? formatHora(lastCaptureTime) : "—"}</span>
      </div>
    </div>
  );
}
