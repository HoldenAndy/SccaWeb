import { BrainCircuit, Loader2 } from "lucide-react";

interface SensorMeta {
  key: string;
  label: string;
  unit: string;
  icon: React.ComponentType<{ size: number; className: string }>;
  color: string;
  bg: string;
  border: string;
}

interface GenerationModalProps {
  data: Record<string, unknown> | null;
  sensors: SensorMeta[];
}

export function GenerationModal({ data, sensors }: GenerationModalProps) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-[var(--scca-bg)] border border-[var(--scca-hair)] rounded-md p-6 max-w-md w-full mx-4">
        <div className="mb-5">
          <div className="scca-caps text-[var(--scca-accent)] mb-1.5">Procesando · Gemini Flash Lite</div>
          <h3 className="text-[18px] font-medium text-[var(--scca-ink)] tracking-[-0.01em]">Generando análisis IA</h3>
          <p className="text-[12px] text-[var(--scca-muted)] mt-1">Tomando los valores actuales y la imagen del agua…</p>
        </div>
        <div className="grid grid-cols-2 gap-0 mb-5 border border-[var(--scca-hair)] rounded-sm">
          {sensors.map((s, i) => (
            <div
              key={s.key}
              className={`p-3 border-[var(--scca-hair)] ${i % 2 === 1 ? "border-l" : ""} ${i >= 2 ? "border-t" : ""}`}
            >
              <div className="scca-caps text-[10px] mb-1">{s.label}</div>
              <p className={`text-[20px] font-mono tabular-nums font-medium ${s.color} tracking-[-0.02em] leading-none`}>
                {data ? (data[s.key] ?? "—") : "—"}
                <span className="text-[10px] text-[var(--scca-muted)] ml-1 font-normal">{s.unit}</span>
              </p>
            </div>
          ))}
        </div>
        <div className="border border-[var(--scca-hair)] rounded-sm p-3">
          <div className="flex items-center gap-2 mb-2">
            <BrainCircuit size={12} strokeWidth={1.5} className="text-[var(--scca-accent)]" />
            <span className="text-[11px] font-medium text-[var(--scca-ink-2)]">Procesando con Gemini Vision…</span>
            <Loader2 size={12} strokeWidth={1.5} className="ml-auto text-[var(--scca-muted)] animate-spin" />
          </div>
          <div className="w-full h-1 bg-[var(--scca-hair-soft)] overflow-hidden rounded-full">
            <div className="bg-[var(--scca-accent)] h-full rounded-full animate-pulse" style={{ width: "70%" }} />
          </div>
        </div>
      </div>
    </div>
  );
}
