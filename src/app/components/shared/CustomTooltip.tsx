import { type TooltipProps } from "recharts";
import type { ValueType, NameType } from "recharts/types/component/DefaultTooltipContent";

export function CustomTooltip({ active, payload, label, unit }: TooltipProps<ValueType, NameType> & { unit?: string }) {
  if (active && payload?.length) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl shadow-lg px-3 py-2">
        <p className="text-xs font-semibold text-slate-500 mb-1">{label}</p>
        <p className="text-sm font-bold" style={{ color: payload[0].color }}>{payload[0].value} {unit}</p>
      </div>
    );
  }
  return null;
}
