import { TrendingUp, TrendingDown, Minus } from "lucide-react";

const TREND_ICONS = {
  up:     { Icon: TrendingUp,   label: "Subiendo", color: "text-[var(--scca-warn)]" },
  down:   { Icon: TrendingDown, label: "Bajando",  color: "text-[var(--scca-ok)]"   },
  stable: { Icon: Minus,        label: "Estable",  color: "text-[var(--scca-faint)]" },
};

export function TrendBadge({ trend }: { trend: keyof typeof TREND_ICONS }) {
  const { Icon, label, color } = TREND_ICONS[trend];
  return (
    <span className={`flex items-center gap-1 text-[10px] font-medium ${color}`}>
      <Icon size={10} strokeWidth={1.5} /> {label}
    </span>
  );
}
