import { CheckCircle2, Cpu, X } from "lucide-react";
import type { NodoDTO } from "../../../api/nodos";

interface Props {
  nodo: NodoDTO;
  clienteNombre: string;
  onClose: () => void;
}

export function NodoRegistradoModal({ nodo, clienteNombre, onClose }: Props) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center"><CheckCircle2 size={15} className="text-emerald-600" /></div>
            <div><h3 className="text-sm font-semibold text-slate-800">¡Nodo registrado exitosamente!</h3><p className="text-xs text-slate-400">El dispositivo quedó activo y listo para recibir datos</p></div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
        </div>
        <div className="p-5 space-y-3">
          <div className="bg-slate-50 border border-slate-200 rounded-xl divide-y divide-slate-100">
            {[
              { label: "ID del nodo", value: `#${nodo.idNodo}`, mono: true },
              { label: "MAC Address", value: nodo.macAddress, mono: true },
              { label: "Ubicación", value: nodo.ubicacion, mono: false },
              { label: "Cliente asignado", value: clienteNombre, mono: false },
              { label: "Estado inicial", value: "Conectado (esperando lecturas)", mono: false },
            ].map(({ label, value, mono }) => (
              <div key={label} className="flex items-center justify-between px-3.5 py-2.5">
                <span className="text-xs text-slate-500">{label}</span>
                <span className={`text-xs font-medium text-slate-700 ${mono ? "font-mono" : ""}`}>{value}</span>
              </div>
            ))}
          </div>
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex items-start gap-2">
            <Cpu size={13} className="text-blue-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-blue-700">
              Configura el ESP32 con esta MAC para que envíe lecturas a <code className="bg-blue-100 px-1 rounded">POST /api/v1/lecturas/hw/registrar</code> usando el header <code className="bg-blue-100 px-1 rounded">X-Hardware-Api-Key</code>.
            </p>
          </div>
        </div>
        <div className="px-5 pb-5"><button onClick={onClose} className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl py-2.5 text-sm hover:from-cyan-600 hover:to-blue-700 transition-all">Entendido, cerrar</button></div>
      </div>
    </div>
  );
}
