import { useUIPrefs } from "../../contexts/UIPrefsContext";

export function DensityToggle() {
  const { density, setDensity } = useUIPrefs();
  return (
    <div className="inline-flex border border-[var(--scca-hair)] rounded-sm overflow-hidden bg-[var(--scca-bg)]" role="group" aria-label="Densidad">
      {(["comfortable", "compact"] as const).map((d) => {
        const active = density === d;
        return (
          <button
            key={d}
            onClick={() => setDensity(d)}
            title={d === "comfortable" ? "Densidad estándar" : "Densidad compacta"}
            className={`px-2 py-1 text-[10.5px] transition-colors ${
              active ? "bg-[var(--scca-ink)] text-[var(--scca-bg)]" : "text-[var(--scca-ink-2)] hover:bg-[var(--scca-surface)]"
            }`}
          >
            {d === "comfortable" ? "Estándar" : "Compacta"}
          </button>
        );
      })}
    </div>
  );
}
