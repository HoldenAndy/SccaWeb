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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-violet-50 border border-violet-200 flex items-center justify-center"><BrainCircuit size={18} className="text-violet-600" /></div>
          <div><h3 className="text-base font-semibold text-slate-800">Generando análisis IA</h3><p className="text-xs text-slate-500">Procesando datos de sensores...</p></div>
        </div>
        <div className="grid grid-cols-2 gap-2 mb-4">
          {sensors.map((s) => (
            <div key={s.key} className={`rounded-lg ${s.bg} border ${s.border} p-2.5`}>
              <div className="flex items-center gap-1.5 mb-1"><s.icon size={12} className={s.color} /><span className="text-xs text-slate-600">{s.label}</span></div>
              <p className={`text-lg font-bold ${s.color}`} style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                {data ? (data[s.key] ?? "—") : "—"}<span className="text-xs font-normal text-slate-400 ml-0.5">{s.unit}</span>
              </p>
            </div>
          ))}
        </div>
        <div className="bg-violet-50 border border-violet-100 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2"><Loader2 size={14} className="text-violet-600 animate-spin" /><span className="text-xs font-medium text-violet-700">Procesando con Gemini Vision...</span></div>
          <div className="w-full bg-violet-200 rounded-full h-1.5 overflow-hidden"><div className="bg-violet-600 h-full rounded-full animate-pulse" style={{ width: "70%" }}></div></div>
        </div>
      </div>
    </div>
  );
}
