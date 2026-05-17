import { Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ReferenceLine, Tooltip, Scatter, ComposedChart } from "recharts";
import { Download, Filter, ChevronLeft, ChevronRight, Calendar, AlertTriangle, ArrowDown, ArrowUp, ArrowUpDown, ScrollText } from "lucide-react";
import { useState, useMemo } from "react";
import { useAnalysis } from "../contexts/AnalysisContext";
import { PageStateGuard } from "../components/PageStateGuard";
import { type LecturaDTO } from "../../api/lecturas";
import { formatFechaTabla, formatHora as formatHoraGraf, parseFechaBackend } from "../../lib/fechas";
import { useHistorial, type FilterMode } from "../hooks/useHistorial";
import { evaluarParametro, evaluarLectura } from "../../domain/calidadAgua";
import { StatusBadge } from "../components/shared/StatusBadge";
import { PageHeader } from "../components/shared/PageHeader";
import { ValueCell } from "../components/shared/ValueCell";
import { CustomTooltip } from "../components/shared/CustomTooltip";
import { EmptyState } from "../components/shared/EmptyState";
import { SkeletonRow, SkeletonChart } from "../components/shared/Skeleton";
import { buildPageNumbers } from "../../lib/paginacion";
import { chartConfigs } from "../../lib/sensorConfig";
import { toast } from "sonner";

function exportarCSV(data: LecturaDTO[], filename: string) {
  if (!data.length) {
    toast.error("Sin datos para exportar");
    return;
  }
  const headers = ["Fecha", "pH", "Temperatura (°C)", "Turbidez (NTU)", "TDS (ppm)"];
  const rows = data.map((d) => {
    const fecha = parseFechaBackend(d.fechaHora);
    return [
      fecha.toISOString().replace("T", " ").slice(0, 19),
      d.ph.toFixed(2), d.temperatura.toFixed(2), d.turbidez.toFixed(2), d.tds.toFixed(2),
    ];
  });
  const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url; link.download = filename; link.click();
  URL.revokeObjectURL(url);
  toast.success(`Exportado · ${data.length} registros`, { description: filename });
}

type SortKey = "fecha" | "ph" | "temperatura" | "turbidez" | "tds";
type SortDir = "asc" | "desc";

const SortIcon = ({ k, sortKey, sortDir }: { k: SortKey; sortKey: SortKey; sortDir: SortDir }) => {
  if (sortKey !== k) return <ArrowUpDown size={10} strokeWidth={1.5} className="text-[var(--scca-faint)]" />;
  return sortDir === "asc"
    ? <ArrowUp size={10} strokeWidth={1.5} className="text-[var(--scca-accent)]" />
    : <ArrowDown size={10} strokeWidth={1.5} className="text-[var(--scca-accent)]" />;
};

const SortableTh = ({ k, label, align = "left", sortKey, sortDir, onToggle }: {
  k: SortKey; label: string; align?: "left" | "right";
  sortKey: SortKey; sortDir: SortDir; onToggle: (k: SortKey) => void;
}) => (
  <th className="scca-caps px-[var(--scca-row-px)] py-2.5 border-b border-[var(--scca-hair)] bg-[var(--scca-surface)]" style={{ textAlign: align }}>
    <button
      onClick={() => onToggle(k)}
      className={`inline-flex items-center gap-1 hover:text-[var(--scca-ink)] transition-colors ${sortKey === k ? "text-[var(--scca-ink-2)]" : ""}`}
    >
      {label} <SortIcon k={k} sortKey={sortKey} sortDir={sortDir} />
    </button>
  </th>
);

export function HistorialPage() {
  const { idNodoActivo, nodos, loadingInit, errorInit, cambiarNodoActivo } = useAnalysis();

  const {
    pageData, grafData, loadingTable, loadingChart, errorData,
    filterMode, fromDate, toDate, customDatesEnabled, page,
    setPage, setFromDate, setToDate, cambiarFiltroMode, aplicarFiltroPersonalizado,
  } = useHistorial(idNodoActivo, loadingInit);

  const [activeParams, setActiveParams] = useState(["ph", "temperatura", "turbidez", "tds"]);
  const toggleParam = (key: string) =>
    setActiveParams((prev) => prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]);

  const [sortKey, setSortKey] = useState<SortKey>("fecha");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const toggleSort = (k: SortKey) => {
    if (sortKey === k) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else { setSortKey(k); setSortDir(k === "fecha" ? "desc" : "asc"); }
  };

  const grafDataFormatted = useMemo(
    () => grafData.map((d) => ({
      ...d,
      fecha: formatHoraGraf(d.fechaHora),
      // Annotation point for out-of-range readings — drawn as a Scatter (C13).
      _alerta_ph:   evaluarParametro("ph",          d.ph)          !== "normal" ? d.ph          : null,
      _alerta_temp: evaluarParametro("temperatura", d.temperatura) !== "normal" ? d.temperatura : null,
      _alerta_turb: evaluarParametro("turbidez",    d.turbidez)    !== "normal" ? d.turbidez    : null,
      _alerta_tds:  evaluarParametro("tds",         d.tds)         !== "normal" ? d.tds         : null,
    })),
    [grafData]
  );

  const statsMap = useMemo(() => {
    const map = new Map<string, { min: string; max: string; avg: string }>();
    (["ph", "temperatura", "turbidez", "tds"] as (keyof LecturaDTO)[]).forEach((key) => {
      const vals = grafData.map((d) => d[key] as number).filter((v) => !isNaN(v));
      map.set(key, vals.length
        ? { min: Math.min(...vals).toFixed(2), max: Math.max(...vals).toFixed(2), avg: (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2) }
        : { min: "—", max: "—", avg: "—" });
    });
    return map;
  }, [grafData]);

  const statsFor = (key: keyof LecturaDTO) => statsMap.get(key) ?? { min: "—", max: "—", avg: "—" };

  const totalPages = pageData?.totalPages ?? 1;
  const totalElements = pageData?.totalElements ?? 0;
  const rows = useMemo(() => {
    const content = pageData?.content ?? [];
    if (sortKey === "fecha") {
      const sorted = [...content].sort((a, b) =>
        parseFechaBackend(a.fechaHora).getTime() - parseFechaBackend(b.fechaHora).getTime()
      );
      return sortDir === "asc" ? sorted : sorted.reverse();
    }
    const sorted = [...content].sort((a, b) => (a[sortKey] as number) - (b[sortKey] as number));
    return sortDir === "asc" ? sorted : sorted.reverse();
  }, [pageData?.content, sortKey, sortDir]);

  if (loadingInit || errorInit) return <PageStateGuard loadingInit={loadingInit} errorInit={errorInit} loadingText="Cargando historial…" />;
  const pageNumbers = buildPageNumbers(page, totalPages);

  return (
    <div>
      <PageHeader
        title="Historial de datos"
        subtitle={totalElements > 0 ? `${totalElements} registros encontrados en la ventana seleccionada.` : "Evolución histórica de los parámetros del agua."}
        actions={
          <>
            {nodos.length > 1 && (
              <div className="flex items-center gap-1.5 border border-[var(--scca-hair)] rounded-sm px-2 py-1.5">
                <select value={idNodoActivo ?? ""} onChange={(e) => cambiarNodoActivo(Number(e.target.value))}
                  className="text-[11px] text-[var(--scca-ink-2)] bg-transparent border-none outline-none cursor-pointer">
                  {nodos.map((n) => (<option key={n.idNodo} value={n.idNodo}>{n.ubicacion}</option>))}
                </select>
              </div>
            )}
            <button
              onClick={() => exportarCSV(grafData, `historial_${idNodoActivo}_${fromDate}_${toDate}.csv`)}
              disabled={!idNodoActivo || totalElements === 0}
              className="flex items-center gap-1.5 text-[11px] text-[var(--scca-ink-2)] border border-[var(--scca-hair)] rounded-sm px-3 py-1.5 hover:bg-[var(--scca-surface)] disabled:opacity-50 transition-colors"
            >
              <Download size={11} strokeWidth={1.5} /> Exportar CSV
            </button>
          </>
        }
      />

      <div className="px-4 md:px-8 py-6 flex flex-col" style={{ gap: "var(--scca-section-gap)" }}>
        {/* Range filters */}
        <div className="border border-[var(--scca-hair)] rounded-md p-3 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Calendar size={12} strokeWidth={1.5} className="text-[var(--scca-muted)]" />
            <span className="scca-caps">Rango</span>
          </div>
          <div className="flex border border-[var(--scca-hair)] rounded-sm overflow-hidden">
            {(["Hoy", "7 días", "30 días", "Personalizado"] as FilterMode[]).map((opt, i) => (
              <button
                key={opt}
                onClick={() => cambiarFiltroMode(opt)}
                className={`text-[11px] font-medium px-3 py-1.5 transition-colors ${
                  filterMode === opt
                    ? "bg-[var(--scca-ink)] text-[var(--scca-bg)]"
                    : "bg-[var(--scca-bg)] text-[var(--scca-ink-2)] hover:bg-[var(--scca-surface)]"
                } ${i > 0 ? "border-l border-[var(--scca-hair)]" : ""}`}
              >
                {opt}
              </button>
            ))}
          </div>
          <div className={`flex items-center gap-1.5 border border-[var(--scca-hair)] rounded-sm px-2.5 py-1.5 ${!customDatesEnabled ? "opacity-50" : ""}`}>
            <label className="text-[10px] text-[var(--scca-muted)]">Desde</label>
            <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} disabled={!customDatesEnabled}
              className="text-[11px] text-[var(--scca-ink)] bg-transparent border-none outline-none font-mono disabled:cursor-not-allowed" />
          </div>
          <span className="text-[var(--scca-faint)]">→</span>
          <div className={`flex items-center gap-1.5 border border-[var(--scca-hair)] rounded-sm px-2.5 py-1.5 ${!customDatesEnabled ? "opacity-50" : ""}`}>
            <label className="text-[10px] text-[var(--scca-muted)]">Hasta</label>
            <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} disabled={!customDatesEnabled}
              className="text-[11px] text-[var(--scca-ink)] bg-transparent border-none outline-none font-mono disabled:cursor-not-allowed" />
          </div>
          <button onClick={aplicarFiltroPersonalizado} disabled={!customDatesEnabled}
            className="flex items-center gap-1.5 text-[11px] font-medium text-[var(--scca-bg)] bg-[var(--scca-ink)] rounded-sm px-3 py-1.5 hover:bg-[var(--scca-ink-2)] disabled:opacity-50 transition-colors">
            <Filter size={11} strokeWidth={1.5} /> Aplicar
          </button>
          <div className="flex items-center gap-1.5 ml-auto flex-wrap">
            {chartConfigs.map((c) => (
              <button key={c.key} onClick={() => toggleParam(c.key)}
                className={`flex items-center gap-1.5 text-[10.5px] font-medium px-2 py-1 rounded-sm border transition-colors ${
                  activeParams.includes(c.key) ? "border-transparent text-[var(--scca-bg)]" : "border-[var(--scca-hair)] text-[var(--scca-muted)]"
                }`}
                style={{ backgroundColor: activeParams.includes(c.key) ? c.color : undefined }}>
                <c.icon size={10} strokeWidth={1.5} /> {c.label}
              </button>
            ))}
          </div>
        </div>

        {errorData && (
          <div className="flex items-center gap-3 bg-[var(--scca-danger-bg)] border border-[var(--scca-hair)] rounded-sm px-4 py-2.5">
            <AlertTriangle size={13} strokeWidth={1.5} className="text-[var(--scca-danger)]" />
            <p className="text-[12px] text-[var(--scca-danger)]">{errorData}</p>
          </div>
        )}

        {/* Charts */}
        {loadingChart && grafDataFormatted.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => <SkeletonChart key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {chartConfigs.filter((c) => activeParams.includes(c.key)).map((cfg) => {
              const stats = statsFor(cfg.key);
              const alertaKey = `_alerta_${cfg.key === "temperatura" ? "temp" : cfg.key}`;
              const alertasCount = grafDataFormatted.filter((d) => d[alertaKey as keyof typeof d] !== null).length;
              return (
                <div key={cfg.key} className="border border-[var(--scca-hair)] rounded-md p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-sm border border-[var(--scca-hair)] flex items-center justify-center" style={{ backgroundColor: cfg.fill }}>
                        <cfg.icon size={13} strokeWidth={1.5} style={{ color: cfg.color }} />
                      </div>
                      <div>
                        <p className="text-[12.5px] font-medium text-[var(--scca-ink)]">{cfg.label}</p>
                        <p className="text-[10px] text-[var(--scca-muted)] font-mono">{cfg.min} – {cfg.max} {cfg.unit}{alertasCount > 0 ? ` · ${alertasCount} avisos` : ""}</p>
                      </div>
                    </div>
                    <div className="hidden sm:flex items-center gap-4">
                      {(["min", "avg", "max"] as const).map((stat) => (
                        <div key={stat} className="text-right">
                          <p className="text-[9px] text-[var(--scca-faint)] uppercase tracking-wider">{stat === "avg" ? "Prom" : stat === "min" ? "Mín" : "Máx"}</p>
                          <p className="text-[12px] font-medium text-[var(--scca-ink)] font-mono tabular-nums">{stats[stat]}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="h-44">
                    {grafDataFormatted.length === 0 ? (
                      <div className="h-full flex items-center justify-center text-[11px] text-[var(--scca-muted)]">Sin datos para el período</div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={grafDataFormatted} margin={{ top: 5, right: 5, left: -22, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="2 4" stroke="var(--scca-hair-soft)" vertical={false} />
                          <XAxis dataKey="fecha" tick={{ fontSize: 9, fill: "var(--scca-muted)", fontFamily: "Geist Mono" }} interval={Math.floor(grafDataFormatted.length / 6)} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fontSize: 9, fill: "var(--scca-muted)", fontFamily: "Geist Mono" }} axisLine={false} tickLine={false} domain={[cfg.min, cfg.max]} />
                          <Tooltip content={<CustomTooltip unit={cfg.unit} />} />
                          {cfg.refLine && <ReferenceLine y={cfg.refLine} stroke="var(--scca-warn)" strokeDasharray="2 3" strokeWidth={1} label={{ value: cfg.refLabel, fontSize: 9, fill: "var(--scca-warn)", position: "insideTopRight" }} />}
                          <Area type="monotone" dataKey={cfg.key} stroke={cfg.color} strokeWidth={1.5} fill="none" dot={false} activeDot={{ r: 3, fill: cfg.color, strokeWidth: 0 }} />
                          {/* Annotations: highlighted dots for out-of-range readings (C13) */}
                          <Scatter dataKey={alertaKey} fill="var(--scca-warn)" shape="circle" />
                        </ComposedChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Table */}
        <div className="border border-[var(--scca-hair)] rounded-md overflow-hidden">
          <div className="px-4 py-3 border-b border-[var(--scca-hair)] flex items-center justify-between">
            <div>
              <h2 className="text-[12px] font-medium text-[var(--scca-ink)]">Registros</h2>
              <p className="text-[10px] text-[var(--scca-muted)] mt-0.5">
                {loadingTable ? "Cargando…" : `Mostrando ${rows.length} de ${totalElements} registros`}
                {sortKey && rows.length > 0 && ` · ordenado por ${sortKey === "fecha" ? "fecha" : sortKey} ${sortDir === "asc" ? "↑" : "↓"}`}
              </p>
            </div>
          </div>
          <div className="overflow-x-auto max-h-[560px] overflow-y-auto">
            <table className="w-full scca-sticky-head">
              <thead>
                <tr>
                  <SortableTh k="fecha"        label="Fecha / Hora" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} />
                  <SortableTh k="ph"           label="pH"           align="left" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} />
                  <SortableTh k="temperatura"  label="Temp °C"       align="left" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} />
                  <SortableTh k="turbidez"     label="Turbidez NTU"  align="left" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} />
                  <SortableTh k="tds"          label="TDS ppm"       align="left" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} />
                  <th className="scca-caps px-[var(--scca-row-px)] py-2.5 border-b border-[var(--scca-hair)] bg-[var(--scca-surface)] text-left">Estado</th>
                </tr>
              </thead>
              <tbody>
                {loadingTable ? (
                  Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} cols={6} />)
                ) : rows.length === 0 ? (
                  <tr><td colSpan={6} className="py-12">
                    <EmptyState
                      Icon={ScrollText}
                      title="Sin registros en el período"
                      body="Ajusta el rango de fechas o selecciona otro nodo. Si acabas de instalar el dispositivo, espera unos minutos para las primeras lecturas."
                      size="sm"
                    />
                  </td></tr>
                ) : rows.map((row, i) => {
                  const nivel = evaluarLectura(row);
                  return (
                    <tr key={row.idLectura}
                        className={`transition-colors hover:bg-[var(--scca-surface)] ${i % 2 === 1 ? "bg-[var(--scca-zebra)]" : ""}`}>
                      <td className="px-[var(--scca-row-px)] py-[var(--scca-row-py)] text-[11px] text-[var(--scca-ink-2)] font-mono whitespace-nowrap">{formatFechaTabla(row.fechaHora)}</td>
                      <td className="px-[var(--scca-row-px)] py-[var(--scca-row-py)]"><ValueCell value={row.ph} level={evaluarParametro("ph", row.ph)} /></td>
                      <td className="px-[var(--scca-row-px)] py-[var(--scca-row-py)]"><ValueCell value={row.temperatura} level={evaluarParametro("temperatura", row.temperatura)} unit="°C" /></td>
                      <td className="px-[var(--scca-row-px)] py-[var(--scca-row-py)]"><ValueCell value={row.turbidez} level={evaluarParametro("turbidez", row.turbidez)} unit="NTU" /></td>
                      <td className="px-[var(--scca-row-px)] py-[var(--scca-row-py)]"><ValueCell value={row.tds} level={evaluarParametro("tds", row.tds)} unit="ppm" /></td>
                      <td className="px-[var(--scca-row-px)] py-[var(--scca-row-py)]"><StatusBadge status={nivel} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="px-4 py-2.5 border-t border-[var(--scca-hair)] flex items-center justify-between">
              <span className="text-[11px] text-[var(--scca-muted)]">Página <span className="font-mono">{page + 1}</span> de <span className="font-mono">{totalPages}</span></span>
              <div className="flex items-center gap-1">
                <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}
                  className="w-7 h-7 flex items-center justify-center rounded-sm border border-[var(--scca-hair)] hover:bg-[var(--scca-surface)] text-[var(--scca-ink-2)] disabled:opacity-40 transition-colors">
                  <ChevronLeft size={12} strokeWidth={1.5} />
                </button>
                {pageNumbers.map((p, i) =>
                  p === "..." ? (<span key={`e-${i}`} className="text-[var(--scca-faint)] text-[11px] px-1 font-mono">…</span>) : (
                    <button key={p} onClick={() => setPage(p as number)}
                      className={`w-7 h-7 flex items-center justify-center rounded-sm text-[11px] font-mono transition-colors ${
                        page === p
                          ? "bg-[var(--scca-ink)] text-[var(--scca-bg)] border border-[var(--scca-ink)]"
                          : "border border-[var(--scca-hair)] text-[var(--scca-ink-2)] hover:bg-[var(--scca-surface)]"
                      }`}>
                      {(p as number) + 1}
                    </button>
                  )
                )}
                <button onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
                  className="w-7 h-7 flex items-center justify-center rounded-sm border border-[var(--scca-hair)] hover:bg-[var(--scca-surface)] text-[var(--scca-ink-2)] disabled:opacity-40 transition-colors">
                  <ChevronRight size={12} strokeWidth={1.5} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
