import { memo } from "react";
import type { LucideIcon } from "lucide-react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
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
  /** Numeric delta vs previous reading. Positive = increase. */
  delta?: number | null;
}

const TREND_META = {
  up:     { Icon: TrendingUp,   color: "text-[var(--scca-warn)]"  },
  down:   { Icon: TrendingDown, color: "text-[var(--scca-ok)]"    },
  stable: { Icon: Minus,        color: "text-[var(--scca-faint)]" },
} as const;

export const SensorCard = memo(function SensorCard({
  sensorKey, label, unit, Icon, value, trend,
  color, bg, border, bar, rangeMin, rangeMax, delta,
}: SensorCardProps) {
  const pct = value !== null ? calcularPorcentaje(sensorKey, value) : 0;
  const isWarning = value !== null && evaluarParametro(sensorKey, value) !== "normal";
  const T = TREND_META[trend];

  const fmt = (n: number) => {
    const abs = Math.abs(n);
    const dec = sensorKey === "tds" ? 0 : 2;
    return `${n > 0 ? "+" : n < 0 ? "−" : ""}${abs.toFixed(dec)}`;
  };

  return (
    <div className={`scca-card-hover border ${border} rounded-md p-[var(--scca-card-pad)] bg-[var(--scca-panel)]`}>
      <div className="flex items-center justify-between mb-3">
        <div className={`w-7 h-7 rounded-sm ${bg} border ${border} flex items-center justify-center`}>
          <Icon size={13} strokeWidth={1.5} className={color} />
        </div>
        <StatusBadge status={isWarning ? "warning" : "normal"} />
      </div>
      <p className="text-[var(--scca-kpi-label)] font-medium text-[var(--scca-ink-2)] mb-1" style={{ fontSize: "var(--scca-kpi-label)" }}>{label}</p>
      <div className="mb-1 flex items-baseline gap-1">
        <span
          className="font-mono tabular-nums font-medium text-[var(--scca-ink)] tracking-[-0.04em] leading-none"
          style={{ fontSize: "var(--scca-kpi)" }}
        >
          {value !== null ? value : "—"}
        </span>
        <span className="text-[12px] text-[var(--scca-muted)]">{unit}</span>
      </div>
      <div className="h-[8px] flex items-center mb-2">
        {delta !== null && delta !== undefined && Math.abs(delta) > 0.0001 ? (
          <span className={`flex items-center gap-1 text-[10.5px] font-mono ${T.color}`}>
            <T.Icon size={10} strokeWidth={1.5} />
            {fmt(delta)} <span className="text-[var(--scca-faint)] font-sans">vs. anterior</span>
          </span>
        ) : (
          <span className="text-[10.5px] text-[var(--scca-faint)] font-sans">sin cambio</span>
        )}
      </div>
      <div className="h-[2px] bg-[var(--scca-hair-soft)] rounded-full overflow-hidden mb-1.5">
        <div className={`h-full rounded-full ${bar} transition-[width] duration-300`} style={{ width: `${pct}%` }} />
      </div>
      <div className="flex items-center justify-between text-[10px] text-[var(--scca-faint)] font-mono">
        <span>{rangeMin} – {rangeMax} {unit}</span>
      </div>
    </div>
  );
});
