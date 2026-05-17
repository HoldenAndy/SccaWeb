import { TrendingUp, TrendingDown, Minus } from "lucide-react";

const TREND_ICONS = {
  up: { Icon: TrendingUp, label: "Subiendo", color: "text-red-500" },
  down: { Icon: TrendingDown, label: "Bajando", color: "text-emerald-500" },
  stable: { Icon: Minus, label: "Estable", color: "text-slate-400" },
};

export function TrendBadge({ trend }: { trend: keyof typeof TREND_ICONS }) {
  const { Icon, label, color } = TREND_ICONS[trend];
  return (
    <span className={`flex items-center gap-0.5 text-xs font-medium ${color}`}>
      <Icon size={12} /> {label}
    </span>
  );
}
