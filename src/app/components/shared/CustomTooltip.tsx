import { type TooltipProps } from "recharts";
import type { ValueType, NameType } from "recharts/types/component/DefaultTooltipContent";

export function CustomTooltip({ active, payload, label, unit }: TooltipProps<ValueType, NameType> & { unit?: string }) {
  if (active && payload?.length) {
    return (
      <div className="bg-[var(--scca-bg)] border border-[var(--scca-hair)] rounded-sm px-3 py-2">
        <p className="text-[10px] font-mono text-[var(--scca-muted)]">{label}</p>
        <p className="text-[13px] font-mono font-medium mt-0.5" style={{ color: payload[0].color }}>
          {payload[0].value} {unit}
        </p>
      </div>
    );
  }
  return null;
}
