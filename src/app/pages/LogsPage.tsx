import { useState, useEffect, useRef } from "react";
import {
  ScrollText, RefreshCw, AlertTriangle, Info,
  CheckCircle2, XCircle, Filter, Search, Play,
  type LucideProps,
} from "lucide-react";
import { formatFechaConSegundos } from "../../lib/fechas";
import { useLogs } from "../hooks/useLogs";
import { PageHeader } from "../components/shared/PageHeader";
import { useUIPrefs } from "../contexts/UIPrefsContext";
import { EmptyState } from "../components/shared/EmptyState";
import { Skeleton } from "../components/shared/Skeleton";

const NIVEL_META: Record<string, { icon: React.ComponentType<LucideProps>; fg: string; bg: string }> = {
  INFO:  { icon: Info,          fg: "text-[var(--scca-accent)]", bg: "bg-[var(--scca-accent-soft)]" },
  WARN:  { icon: AlertTriangle, fg: "text-[var(--scca-warn)]",   bg: "bg-[var(--scca-warn-bg)]" },
  ERROR: { icon: XCircle,       fg: "text-[var(--scca-danger)]", bg: "bg-[var(--scca-danger-bg)]" },
  DEBUG: { icon: CheckCircle2,  fg: "text-[var(--scca-muted)]",  bg: "bg-[var(--scca-surface)]" },
};

const defaultMeta = { icon: Info, fg: "text-[var(--scca-muted)]", bg: "bg-[var(--scca-surface)]" };

export function LogsPage() {
  const { logs, loading, error, recargar } = useLogs();
  const [nivelFiltro, setNivelFiltro] = useState<string>("TODOS");
  const [query, setQuery] = useState("");
  const { liveTail, setLiveTail } = useUIPrefs();

  // Live tail: re-fetch every 5 s and highlight rows whose idLog is new.
  const seenIdsRef = useRef<Set<number>>(new Set(logs.map((l) => l.idLog)));
  const [newIds, setNewIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!liveTail) return;
    const iv = setInterval(() => recargar(), 5000);
    return () => clearInterval(iv);
  }, [liveTail, recargar]);

  useEffect(() => {
    const incoming = new Set(logs.map((l) => l.idLog));
    const fresh = new Set<number>();
    incoming.forEach((id) => { if (!seenIdsRef.current.has(id)) fresh.add(id); });
    if (fresh.size > 0) {
      setNewIds(fresh);
      // Reset highlight after animation
      const t = setTimeout(() => setNewIds(new Set()), 1300);
      return () => clearTimeout(t);
    }
    seenIdsRef.current = incoming;
  }, [logs]);

  const niveles = ["TODOS", "INFO", "WARN", "ERROR", "DEBUG"];
  const q = query.trim().toLowerCase();
  const logsFiltrados = logs.filter((l) => {
    if (nivelFiltro !== "TODOS" && l.nivel.toUpperCase() !== nivelFiltro) return false;
    if (q && !l.mensaje.toLowerCase().includes(q) && !l.modulo.toLowerCase().includes(q)) return false;
    return true;
  });

  const conteos = logs.reduce<Record<string, number>>((acc, l) => {
    const n = l.nivel.toUpperCase();
    acc[n] = (acc[n] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div>
      <PageHeader
        title="Registros del sistema"
        subtitle={logs.length > 0 ? `Bitácora cronológica del backend SCCA · ${logs.length} eventos recientes.` : "Bitácora cronológica del backend SCCA."}
        actions={
          <>
            <button
              onClick={() => setLiveTail(!liveTail)}
              className={`flex items-center gap-1.5 text-[11px] font-medium rounded-sm px-3 py-1.5 border transition-colors ${
                liveTail
                  ? "bg-[var(--scca-ok-bg)] border-[var(--scca-hair)] text-[var(--scca-ok)]"
                  : "border-[var(--scca-hair)] text-[var(--scca-ink-2)] hover:bg-[var(--scca-surface)]"
              }`}
              title={liveTail ? "Detener auto-actualización" : "Activar auto-actualización cada 5 s"}
            >
              {liveTail
                ? <><span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--scca-ok)] opacity-60" /><span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--scca-ok)]" /></span> Live tail</>
                : <><Play size={11} strokeWidth={1.5} /> Live tail</>}
            </button>
            <button onClick={recargar} disabled={loading}
              className="flex items-center gap-1.5 text-[11px] text-[var(--scca-ink-2)] border border-[var(--scca-hair)] rounded-sm px-3 py-1.5 hover:bg-[var(--scca-surface)] disabled:opacity-50 transition-colors">
              <RefreshCw size={11} strokeWidth={1.5} className={loading ? "animate-spin" : ""} /> Actualizar
            </button>
          </>
        }
      />

      <div className="px-4 md:px-8 py-6 flex flex-col" style={{ gap: "var(--scca-section-gap)" }}>
        {/* KPI strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 border border-[var(--scca-hair)] rounded-md overflow-hidden">
          {(["INFO", "WARN", "ERROR", "DEBUG"] as const).map((n, i) => {
            const meta = NIVEL_META[n] ?? defaultMeta;
            const Icon = meta.icon;
            return (
              <div key={n} className={`p-4 flex items-center gap-3 ${i > 0 ? "border-l border-[var(--scca-hair)]" : ""}`}>
                <div className={`w-7 h-7 rounded-sm ${meta.bg} border border-[var(--scca-hair)] flex items-center justify-center flex-shrink-0`}>
                  <Icon size={13} strokeWidth={1.5} className={meta.fg} />
                </div>
                <div>
                  <div className="scca-caps">{n}</div>
                  <p className="text-[20px] font-mono tabular-nums font-medium text-[var(--scca-ink)] tracking-[-0.02em] leading-none mt-0.5">
                    {loading ? <Skeleton width={30} height={20} /> : (conteos[n] ?? 0)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Filter row */}
        <div className="border border-[var(--scca-hair)] rounded-md p-3 flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter size={12} strokeWidth={1.5} className="text-[var(--scca-muted)]" />
            <span className="scca-caps">Nivel</span>
          </div>
          <div className="flex border border-[var(--scca-hair)] rounded-sm overflow-hidden">
            {niveles.map((n, i) => (
              <button key={n} onClick={() => setNivelFiltro(n)}
                className={`text-[11px] font-medium px-3 py-1.5 transition-colors ${
                  nivelFiltro === n ? "bg-[var(--scca-ink)] text-[var(--scca-bg)]" : "bg-[var(--scca-bg)] text-[var(--scca-ink-2)] hover:bg-[var(--scca-surface)]"
                } ${i > 0 ? "border-l border-[var(--scca-hair)]" : ""}`}>
                {n}{n !== "TODOS" && conteos[n] ? ` · ${conteos[n]}` : ""}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="flex items-center gap-1.5 border border-[var(--scca-hair)] rounded-sm px-2.5 py-1.5 min-w-[200px]">
            <Search size={11} strokeWidth={1.5} className="text-[var(--scca-muted)]" />
            <input
              type="text" value={query} onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar en mensaje o módulo…"
              className="flex-1 text-[11.5px] text-[var(--scca-ink)] bg-transparent border-none outline-none"
            />
          </div>

          <span className="ml-auto text-[11px] text-[var(--scca-muted)] font-mono">
            <span className="text-[var(--scca-ink)]">{logsFiltrados.length}</span> registros
            {liveTail && <span className="ml-2 text-[var(--scca-ok)] text-[10.5px]">● auto cada 5s</span>}
          </span>
        </div>

        {error && (
          <div className="flex items-center gap-3 bg-[var(--scca-danger-bg)] border border-[var(--scca-hair)] rounded-sm px-4 py-2.5">
            <XCircle size={14} strokeWidth={1.5} className="text-[var(--scca-danger)]" />
            <p className="text-[12px] text-[var(--scca-danger)]">{error}</p>
          </div>
        )}

        <div className="border border-[var(--scca-hair)] rounded-md overflow-hidden">
          <div className="px-4 py-3 border-b border-[var(--scca-hair)] flex items-center gap-2">
            <ScrollText size={13} strokeWidth={1.5} className="text-[var(--scca-muted)]" />
            <h2 className="text-[12px] font-medium text-[var(--scca-ink)]">Eventos recientes</h2>
            <span className="ml-auto text-[10.5px] text-[var(--scca-muted)] font-mono">Últimos 100</span>
          </div>
          {loading ? (
            <div className="p-3 space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="grid grid-cols-[160px_60px_120px_1fr] gap-3 py-1.5">
                  <Skeleton width="100%" height={11} />
                  <Skeleton width="60%" height={11} />
                  <Skeleton width="80%" height={11} />
                  <Skeleton width={`${50 + (i * 13) % 40}%`} height={11} />
                </div>
              ))}
            </div>
          ) : logsFiltrados.length === 0 ? (
            <EmptyState
              Icon={ScrollText}
              title="Sin eventos para los filtros"
              body={query ? `No hay registros que coincidan con "${query}".` : "Ajusta el nivel o limpia la búsqueda."}
              action={
                <button
                  onClick={() => { setQuery(""); setNivelFiltro("TODOS"); }}
                  className="text-[11px] font-medium text-[var(--scca-accent)] hover:underline"
                >Limpiar filtros</button>
              }
            />
          ) : (
            <div>
              {logsFiltrados.map((log, i) => {
                const meta = NIVEL_META[log.nivel.toUpperCase()] ?? defaultMeta;
                const isNew = newIds.has(log.idLog);
                return (
                  <div
                    key={log.idLog}
                    className={`px-4 py-2.5 transition-colors grid grid-cols-[160px_60px_120px_1fr] gap-3 items-baseline hover:bg-[var(--scca-surface)] ${
                      i < logsFiltrados.length - 1 ? "border-b border-[var(--scca-hair-soft)]" : ""
                    } ${i % 2 === 1 ? "bg-[var(--scca-zebra)]" : ""} ${isNew ? "scca-newrow" : ""}`}
                  >
                    <span className="text-[11px] text-[var(--scca-muted)] font-mono">{formatFechaConSegundos(log.fechaHora)}</span>
                    <span className={`text-[10.5px] font-mono font-semibold tracking-[0.04em] ${meta.fg}`}>{log.nivel.toUpperCase()}</span>
                    <span className="text-[11px] text-[var(--scca-ink-2)] font-mono">[{log.modulo}]</span>
                    <span className="text-[12.5px] text-[var(--scca-ink)] leading-snug">{log.mensaje}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
