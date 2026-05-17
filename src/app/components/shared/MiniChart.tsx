import { memo } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
  type TooltipProps,
} from "recharts";
import type { ValueType, NameType } from "recharts/types/component/DefaultTooltipContent";

interface MiniChartProps {
  label: string;
  unit: string;
  color: string;
  domain: [number, number];
  refLine?: number;
  dataKey: string;
  data: Record<string, unknown>[];
  currentValue: number | string;
  loading: boolean;
}

const MiniTooltip = ({ active, payload, label, unit }: TooltipProps<ValueType, NameType> & { unit?: string }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-[var(--scca-bg)] border border-[var(--scca-hair)] rounded-sm px-2.5 py-1.5">
        <p className="text-[10px] text-[var(--scca-muted)] font-mono">{label}</p>
        <p className="text-[12px] font-medium font-mono" style={{ color: payload[0].color }}>
          {payload[0].value} {unit}
        </p>
      </div>
    );
  }
  return null;
};

export const MiniChart = memo(function MiniChart({ label, unit, color, domain, refLine, dataKey, data, currentValue, loading }: MiniChartProps) {
  return (
    <div className="border border-[var(--scca-hair)] rounded-md p-4">
      <div className="flex items-center justify-between mb-1">
        <p className="text-[12px] font-medium text-[var(--scca-ink-2)]">{label}</p>
        <span className="text-[12px] font-mono tabular-nums font-medium" style={{ color }}>
          {currentValue}{unit && <span className="text-[10px] text-[var(--scca-muted)] ml-0.5 font-normal">{unit}</span>}
        </span>
      </div>
      <p className="text-[10px] text-[var(--scca-faint)] mb-3">Últimas 2 horas</p>
      <div className="h-28">
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-[11px] text-[var(--scca-muted)]">
            {loading ? "Cargando..." : "Sin datos en las últimas 2 h"}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
              <CartesianGrid strokeDasharray="2 4" stroke="var(--scca-hair-soft)" vertical={false} />
              <XAxis dataKey="time" tick={{ fontSize: 9, fill: "var(--scca-muted)", fontFamily: "Geist Mono" }} axisLine={false} tickLine={false} interval={Math.floor(data.length / 4)} />
              <YAxis tick={{ fontSize: 9, fill: "var(--scca-muted)", fontFamily: "Geist Mono" }} axisLine={false} tickLine={false} domain={domain} />
              <Tooltip content={<MiniTooltip unit={unit} />} />
              {refLine && <ReferenceLine y={refLine} stroke="var(--scca-warn)" strokeDasharray="2 3" strokeWidth={1} />}
              <Area type="monotone" dataKey={dataKey} stroke={color} strokeWidth={1.5} fill="none" dot={false} activeDot={{ r: 3, fill: color, strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
});
