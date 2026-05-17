import { memo } from "react";
import type { LucideIcon } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import { TrendBadge } from "./TrendBadge";
import { calcularPorcentaje, evaluarParametro, type ParametroKey } from "../../../domain/calidadAgua";

interface SensorCardProps {
  sensorKey: ParametroKey;
  label: string;
  unit: string;
  Icon: LucideIcon;
  value: number | null;
  trend: "up" | "down" | "stable";
  color: string;
  bg: string;
  border: string;
  bar: string;
  rangeMin: number;
  rangeMax: number;
}

export const SensorCard = memo(function SensorCard({
  sensorKey, label, unit, Icon, value, trend,
  color, bg, border, bar, rangeMin, rangeMax,
}: SensorCardProps) {
  const pct = value !== null ? calcularPorcentaje(sensorKey, value) : 0;
  const isWarning = value !== null && evaluarParametro(sensorKey, value) !== "normal";

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-9 h-9 rounded-xl ${bg} ${border} border flex items-center justify-center`}>
          <Icon size={16} className={color} />
        </div>
        <StatusBadge status={isWarning ? "warning" : "normal"} />
      </div>
      <div className="mb-1">
        <span className="text-3xl font-bold text-slate-800" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
          {value !== null ? value : "—"}
        </span>
        <span className="text-sm text-slate-400 ml-1">{unit}</span>
      </div>
      <p className="text-sm font-medium text-slate-600 mb-3">{label}</p>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mb-2">
        <div className={`h-full rounded-full ${bar} transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-400">{rangeMin} – {rangeMax} {unit}</span>
        <TrendBadge trend={trend} />
      </div>
    </div>
  );
});
