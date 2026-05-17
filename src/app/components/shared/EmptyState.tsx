/* Empty state with character — replaces dry "Sin datos" messages (A1). */

import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface Props {
  Icon: LucideIcon;
  title: string;
  body: ReactNode;
  action?: ReactNode;
  hint?: string;
  size?: "sm" | "md";
}

export function EmptyState({ Icon, title, body, action, hint, size = "md" }: Props) {
  const pad = size === "sm" ? "py-8 px-4" : "py-14 px-6";
  const iconSize = size === "sm" ? 28 : 38;
  return (
    <div className={`flex flex-col items-center justify-center text-center gap-3 ${pad}`}>
      <div className="w-14 h-14 rounded-md border border-[var(--scca-hair)] bg-[var(--scca-surface)] flex items-center justify-center">
        <Icon size={iconSize / 2 + 6} strokeWidth={1.5} className="text-[var(--scca-muted)]" />
      </div>
      <div>
        <p className="text-[14px] font-medium text-[var(--scca-ink)]">{title}</p>
        <p className="text-[12.5px] text-[var(--scca-muted)] mt-1.5 max-w-[420px] leading-relaxed">
          {body}
        </p>
      </div>
      {action}
      {hint && <p className="text-[10.5px] text-[var(--scca-faint)] mt-1">{hint}</p>}
    </div>
  );
}
