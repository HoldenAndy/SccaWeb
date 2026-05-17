/* Side-by-side comparison of two analyses (C12). */

import { useState } from "react";
import { X, AlertTriangle, Info } from "lucide-react";
import type { AnalisisEnriquecido } from "../../../lib/analisis";
import { analysisSensorMeta } from "../../../lib/sensorConfig";
import { StatusBadge } from "./StatusBadge";

interface Props {
  analyses: AnalisisEnriquecido[];
  initialIdA?: number | null;
  onClose: () => void;
}

const Side = ({ which, side }: { which: AnalisisEnriquecido | undefined; side: "A" | "B" }) => {
  if (!which) return <div className="border border-[var(--scca-hair)] rounded-md p-8 text-center text-[12px] text-[var(--scca-muted)]">Selecciona un análisis</div>;
  return (
    <div className="border border-[var(--scca-hair)] rounded-md flex flex-col">
      <div className="px-4 py-3 border-b border-[var(--scca-hair)] flex items-center justify-between gap-3">
        <div className="flex items-baseline gap-2 min-w-0">
          <span className="scca-caps" style={{ fontSize: 9.5 }}>Lado {side}</span>
          <span className="text-[12px] text-[var(--scca-ink)] font-mono">#{String(which.id).padStart(3, "0")}</span>
          <span className="text-[10.5px] text-[var(--scca-muted)] font-mono truncate">{which.fecha}</span>
        </div>
        <StatusBadge status={which.estado === "Aviso" ? "warning" : "normal"} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 border-b border-[var(--scca-hair)]">
        {analysisSensorMeta.map((s, i) => {
          const val = which[s.key];
          return (
            <div key={s.key} className={`p-3 ${i % 4 !== 0 ? "border-l border-[var(--scca-hair-soft)]" : ""} ${i >= 2 ? "border-t sm:border-t-0 border-[var(--scca-hair-soft)]" : ""}`}>
              <div className="scca-caps" style={{ fontSize: 9.5 }}>{s.label}</div>
              <div className="mt-1 flex items-baseline gap-1">
                <span className={`text-[20px] font-mono tabular-nums font-medium ${s.color} tracking-[-0.025em] leading-none`}>{val || "—"}</span>
                <span className="text-[10.5px] text-[var(--scca-muted)]">{s.unit}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="px-4 py-3 flex-1">
        <p className="text-[13px] text-[var(--scca-ink)] leading-relaxed" style={{ textWrap: "pretty" } as React.CSSProperties}>
          {which.texto}
        </p>
      </div>

      <div className="px-4 pb-4">
        <div className="bg-[var(--scca-accent-soft)] border-l-2 border-[var(--scca-accent)] rounded-sm p-3">
          <div className="scca-caps text-[var(--scca-accent)] mb-0.5 flex items-center gap-1.5" style={{ fontSize: 9.5 }}>
            <Info size={10} strokeWidth={1.5} /> Recomendación
          </div>
          <p className="text-[11.5px] text-[var(--scca-ink-2)] leading-snug">{which.recomendacion}</p>
        </div>
        {which.alerta && (
          <div className="mt-2 bg-[var(--scca-warn-bg)] border border-[var(--scca-hair)] rounded-sm p-3 flex items-start gap-2">
            <AlertTriangle size={12} strokeWidth={1.5} className="text-[var(--scca-warn)] mt-0.5 flex-shrink-0" />
            <p className="text-[11px] text-[var(--scca-warn)] leading-snug">
              <strong>{which.alerta.param}:</strong> {which.alerta.valor} · límite {which.alerta.limite}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export function AnalysisCompareModal({ analyses, initialIdA, onClose }: Props) {
  const [idA, setIdA] = useState<number | null>(initialIdA ?? analyses[0]?.id ?? null);
  const [idB, setIdB] = useState<number | null>(analyses[1]?.id ?? analyses[0]?.id ?? null);

  const a = analyses.find((x) => x.id === idA);
  const b = analyses.find((x) => x.id === idB);

  const selector = (side: "A" | "B", value: number | null, setter: (v: number) => void) => (
    <div className="flex items-center gap-2">
      <span className="scca-caps" style={{ fontSize: 9.5 }}>Lado {side}</span>
      <select
        value={value ?? ""}
        onChange={(e) => setter(Number(e.target.value))}
        className="bg-[var(--scca-bg)] border border-[var(--scca-hair)] rounded-sm px-2 py-1 text-[12px] text-[var(--scca-ink)] outline-none"
      >
        {analyses.map((x) => (
          <option key={x.id} value={x.id}>#{String(x.id).padStart(3, "0")} · {x.fecha}</option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 scca-fade-in" onClick={onClose}>
      <div
        className="bg-[var(--scca-bg)] border border-[var(--scca-hair)] rounded-md w-full max-w-[1100px] max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-3 border-b border-[var(--scca-hair)] flex items-center justify-between gap-4">
          <div>
            <div className="scca-caps text-[var(--scca-accent)] mb-0.5">Comparar análisis</div>
            <h2 className="text-[16px] font-medium text-[var(--scca-ink)]">Dos lecturas IA, lado a lado</h2>
          </div>
          <div className="flex items-center gap-4">
            {selector("A", idA, setIdA)}
            {selector("B", idB, setIdB)}
            <button onClick={onClose} className="text-[var(--scca-muted)] hover:text-[var(--scca-ink)] p-1">
              <X size={16} strokeWidth={1.5} />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Side which={a} side="A" />
          <Side which={b} side="B" />
        </div>
      </div>
    </div>
  );
}
