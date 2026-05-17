import { memo } from "react";

export type StatusLevel = "normal" | "warning" | "critical";

const CONFIG: Record<StatusLevel, { label: string; dot: string; text: string }> = {
  normal:   { label: "Normal",  dot: "bg-[var(--scca-ok)]",     text: "text-[var(--scca-ok)]"     },
  warning:  { label: "Aviso",   dot: "bg-[var(--scca-warn)]",   text: "text-[var(--scca-warn)]"   },
  critical: { label: "Crítico", dot: "bg-[var(--scca-danger)]", text: "text-[var(--scca-danger)]" },
};

interface Props {
  status: StatusLevel;
  dotSize?: "sm" | "md";
}

export const StatusBadge = memo(function StatusBadge({ status, dotSize = "sm" }: Props) {
  const { label, dot, text } = CONFIG[status];
  const dotClass = dotSize === "md" ? "w-1.5 h-1.5" : "w-1 h-1";
  return (
    <span className={`inline-flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.08em] ${text}`}>
      <span className={`${dotClass} rounded-full flex-shrink-0 ${dot}`} />
      {label}
    </span>
  );
});
