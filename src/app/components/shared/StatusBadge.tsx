import { memo } from "react";

export type StatusLevel = "normal" | "warning" | "critical";

const CONFIG: Record<StatusLevel, { label: string; classes: string; dot: string }> = {
  normal:   { label: "Normal",  classes: "bg-emerald-100 text-emerald-700 border-emerald-200", dot: "bg-emerald-500"        },
  warning:  { label: "Aviso",   classes: "bg-amber-100   text-amber-700   border-amber-200",   dot: "bg-amber-500"          },
  critical: { label: "Crítico", classes: "bg-red-100     text-red-700     border-red-200",     dot: "bg-red-500 animate-pulse" },
};

interface Props {
  status: StatusLevel;
  dotSize?: "sm" | "md";
}

export const StatusBadge = memo(function StatusBadge({ status, dotSize = "sm" }: Props) {
  const { label, classes, dot } = CONFIG[status];
  const dotClass = dotSize === "md" ? "w-2 h-2" : "w-1.5 h-1.5";
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold border rounded-full px-2 py-0.5 ${classes}`}>
      <span className={`${dotClass} rounded-full flex-shrink-0 ${dot}`} />
      {label}
    </span>
  );
});
