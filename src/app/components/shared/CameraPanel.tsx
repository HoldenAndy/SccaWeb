import { Camera } from "lucide-react";
import type { NodoDTO } from "../../../api/nodos";
import { formatHora } from "../../../lib/fechas";

interface CameraPanelProps {
  nodo: NodoDTO | undefined;
  lastCaptureTime: string | number[] | undefined;
}

export function CameraPanel({ nodo, lastCaptureTime }: CameraPanelProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-800">Cámara ESP32</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {nodo ? nodo.ubicacion : "Sin nodo seleccionado"}
          </p>
        </div>
        <span className={`flex items-center gap-1 text-xs border rounded-full px-2 py-0.5 ${
          nodo?.estadoConexion
            ? "text-emerald-600 bg-emerald-50 border-emerald-200"
            : "text-slate-400 bg-slate-50 border-slate-200"
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${nodo?.estadoConexion ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`}></span>
          {nodo?.estadoConexion ? "Live" : "Offline"}
        </span>
      </div>
      <div className="flex-1 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 flex flex-col items-center justify-center gap-3 min-h-[200px] relative overflow-hidden">
        <div className="absolute inset-x-0 h-0.5 bg-cyan-400/40" style={{ animation: "scanline 3s linear infinite" }}></div>
        <div className="w-12 h-12 rounded-full bg-slate-700 border-2 border-slate-600 flex items-center justify-center">
          <Camera size={20} className="text-slate-400" />
        </div>
        <div className="text-center">
          <p className="text-xs font-medium text-slate-300">640 × 480 px</p>
          <p className="text-xs text-slate-500 mt-0.5">Actualización: cada 10 s</p>
        </div>
        {nodo && (
          <div className="absolute bottom-3 left-0 right-0 flex justify-center">
            <span className="text-xs text-slate-500 font-mono bg-slate-900/60 px-2 py-0.5 rounded-full">
              {nodo.macAddress}
            </span>
          </div>
        )}
        <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-cyan-400/50 rounded-tl"></div>
        <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-cyan-400/50 rounded-tr"></div>
        <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-cyan-400/50 rounded-bl"></div>
        <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-cyan-400/50 rounded-br"></div>
      </div>
      <div className="mt-3 text-xs text-slate-400">
        <span>Última captura: {lastCaptureTime ? formatHora(lastCaptureTime) : "—"}</span>
      </div>
    </div>
  );
}
