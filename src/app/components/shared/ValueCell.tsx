import { memo } from "react";

type StatusLevel = "normal" | "warning" | "critical";

export const ValueCell = memo(function ValueCell({ value, level, unit }: { value: number; level: StatusLevel; unit?: string }) {
  const s: Record<StatusLevel, string> = {
    normal: "text-emerald-600 bg-emerald-50 border-emerald-200",
    warning: "text-amber-600 bg-amber-50 border-amber-200",
    critical: "text-red-600 bg-red-50 border-red-200",
  };
  return (
    <span className={`inline-flex items-center gap-0.5 text-sm font-semibold px-2 py-0.5 rounded-lg border ${s[level]}`}
      style={{ fontFamily: "'JetBrains Mono', monospace" }}>
      {value}{unit && <span className="text-xs font-normal opacity-70 ml-0.5">{unit}</span>}
    </span>
  );
});
