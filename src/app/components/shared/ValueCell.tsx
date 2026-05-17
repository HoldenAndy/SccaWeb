import { memo } from "react";

type StatusLevel = "normal" | "warning" | "critical";

const COLOR: Record<StatusLevel, string> = {
  normal:   "text-[var(--scca-ink)]",
  warning:  "text-[var(--scca-warn)]",
  critical: "text-[var(--scca-danger)]",
};

export const ValueCell = memo(function ValueCell({ value, level, unit }: { value: number; level: StatusLevel; unit?: string }) {
  return (
    <span className={`font-mono tabular-nums text-[13px] font-medium ${COLOR[level]}`}>
      {value}{unit && <span className="text-[11px] text-[var(--scca-muted)] ml-0.5 font-normal">{unit}</span>}
    </span>
  );
});
