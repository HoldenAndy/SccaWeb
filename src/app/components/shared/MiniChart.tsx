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

const MiniTooltip = ({
  active, payload, label, unit,
}: TooltipProps<ValueType, NameType> & { unit?: string }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white border border-slate-200 rounded-lg shadow-lg px-2.5 py-1.5">
        <p className="text-xs text-slate-400">{label}</p>
        <p className="text-xs font-bold" style={{ color: payload[0].color }}>
          {payload[0].value} {unit}
        </p>
      </div>
    );
  }
  return null;
};

export const MiniChart = memo(function MiniChart({ label, unit, color, domain, refLine, dataKey, data, currentValue, loading }: MiniChartProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-sm font-semibold text-slate-800">{label}</p>
          <p className="text-xs text-slate-400">Últimas 2 horas</p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }}></span>
          <span className="text-xs font-semibold" style={{ color, fontFamily: "'JetBrains Mono', monospace" }}>
            {currentValue} {unit}
          </span>
        </div>
      </div>
      <div className="h-32">
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-slate-400">
            {loading ? "Cargando..." : "Sin datos en las últimas 2 h"}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
              <defs>
                <linearGradient id={`grad-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.18} />
                  <stop offset="95%" stopColor={color} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="time" tick={{ fontSize: 9, fill: "#94a3b8" }} axisLine={false} tickLine={false} interval={Math.floor(data.length / 4)} />
              <YAxis tick={{ fontSize: 9, fill: "#94a3b8" }} axisLine={false} tickLine={false} domain={domain} />
              <Tooltip content={<MiniTooltip unit={unit} />} />
              {refLine && <ReferenceLine y={refLine} stroke="#f59e0b" strokeDasharray="4 4" strokeWidth={1.5} />}
              <Area type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} fill={`url(#grad-${dataKey})`} dot={false} activeDot={{ r: 3, fill: color, strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
});
