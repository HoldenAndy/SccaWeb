import { Sun, Moon, Monitor } from "lucide-react";
import { useUIPrefs } from "../../contexts/UIPrefsContext";

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const { theme, setTheme } = useUIPrefs();
  const opts: { v: "light" | "dark" | "system"; icon: typeof Sun; label: string }[] = [
    { v: "light",  icon: Sun,     label: "Claro" },
    { v: "system", icon: Monitor, label: "Auto" },
    { v: "dark",   icon: Moon,    label: "Oscuro" },
  ];
  return (
    <div className="inline-flex border border-[var(--scca-hair)] rounded-sm overflow-hidden bg-[var(--scca-bg)]" role="group" aria-label="Tema">
      {opts.map((o) => {
        const active = theme === o.v;
        return (
          <button
            key={o.v}
            onClick={() => setTheme(o.v)}
            title={o.label}
            className={`flex items-center gap-1 px-2 py-1 text-[10.5px] transition-colors ${
              active ? "bg-[var(--scca-ink)] text-[var(--scca-bg)]" : "text-[var(--scca-ink-2)] hover:bg-[var(--scca-surface)]"
            }`}
          >
            <o.icon size={11} strokeWidth={1.5} />
            {!compact && <span>{o.label}</span>}
          </button>
        );
      })}
    </div>
  );
}
