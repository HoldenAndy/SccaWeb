import { CheckCircle2, X } from "lucide-react";
import type { NodoDTO } from "../../../api/nodos";

interface Props {
  nodo: NodoDTO;
  clienteNombre: string;
  onClose: () => void;
}

export function NodoRegistradoModal({ nodo, clienteNombre, onClose }: Props) {
  const rows: { label: string; value: string; mono?: boolean }[] = [
    { label: "ID del nodo",       value: `#${nodo.idNodo}`,                 mono: true },
    { label: "MAC Address",       value: nodo.macAddress,                   mono: true },
    { label: "Ubicación",         value: nodo.ubicacion                                  },
    { label: "Cliente asignado",  value: clienteNombre                                   },
    { label: "Estado inicial",    value: "Conectado · esperando lecturas"                },
  ];

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--scca-bg)] border border-[var(--scca-hair)] rounded-md w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-[var(--scca-hair)]">
          <div>
            <div className="scca-caps text-[var(--scca-ok)] mb-1 flex items-center gap-1.5">
              <CheckCircle2 size={11} strokeWidth={1.5} /> Nodo registrado
            </div>
            <h3 className="text-[16px] font-medium text-[var(--scca-ink)]">Dispositivo activo</h3>
            <p className="text-[11px] text-[var(--scca-muted)] mt-0.5">Listo para recibir lecturas</p>
          </div>
          <button onClick={onClose} className="text-[var(--scca-muted)] hover:text-[var(--scca-ink)] p-1">
            <X size={16} strokeWidth={1.5} />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div className="border border-[var(--scca-hair)] rounded-sm divide-y divide-[var(--scca-hair-soft)]">
            {rows.map(({ label, value, mono }) => (
              <div key={label} className="flex items-center justify-between px-3 py-2.5">
                <span className="scca-caps">{label}</span>
                <span className={`text-[12px] text-[var(--scca-ink)] font-medium ${mono ? "font-mono" : ""}`}>{value}</span>
              </div>
            ))}
          </div>
          <div className="bg-[var(--scca-accent-soft)] border-l-2 border-[var(--scca-accent)] rounded-sm p-3">
            <p className="text-[11px] text-[var(--scca-ink-2)] leading-relaxed">
              Configura el ESP32 con esta MAC para que envíe lecturas a{" "}
              <code className="font-mono text-[10px] bg-[var(--scca-bg)] border border-[var(--scca-hair)] px-1 py-0.5 rounded-sm">POST /api/v1/lecturas/hw/registrar</code>
              {" "}usando el header{" "}
              <code className="font-mono text-[10px] bg-[var(--scca-bg)] border border-[var(--scca-hair)] px-1 py-0.5 rounded-sm">X-Hardware-Api-Key</code>.
            </p>
          </div>
        </div>
        <div className="px-5 pb-5">
          <button
            onClick={onClose}
            className="w-full bg-[var(--scca-ink)] text-[var(--scca-bg)] font-medium rounded-sm py-2.5 text-[13px] hover:bg-[var(--scca-ink-2)] transition-colors"
          >
            Entendido, cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
