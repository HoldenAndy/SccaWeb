import { useState } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
  type TooltipProps,
} from "recharts";
import type { ValueType, NameType } from "recharts/types/component/DefaultTooltipContent";
import {
  Download, Filter, Droplets, Thermometer, Eye, Zap,
  ChevronLeft, ChevronRight, Waves, TrendingUp, Calendar, Loader2, AlertTriangle,
} from "lucide-react";
// FIX #3: una sola llamada a useAnalysis extrayendo todo lo necesario de una vez.
import { useAnalysis } from "../contexts/AnalysisContext";
import { PageStateGuard } from "../components/PageStateGuard";
import { type LecturaDTO, type PageResponse } from "../../api/lecturas";
import { formatFechaTabla, formatHora as formatHoraGraf, isoToday, isoNDaysAgo } from "../../lib/fechas";
import { useHistorial, type FilterMode } from "../hooks/useHistorial";
// Umbrales centralizados en el dominio — eliminadas las 4 funciones *Level locales.
import { evaluarParametro, evaluarLectura, PARAMETROS_CALIDAD } from "../../domain/calidadAgua";
import { StatusBadge } from "../components/shared/StatusBadge";
import { PageHeader } from "../components/shared/PageHeader";

// ─── helpers ──────────────────────────────────────────────────────────────

// Formatters de fecha centralizados en lib/fechas

// ─── levels ───────────────────────────────────────────────────────────────

// Funciones phLevel/tempLevel/turbLevel/tdsLevel/getOverallStatus eliminadas.
// Reemplazadas por evaluarParametro y evaluarLectura del dominio.

function ValueCell({ value, level, unit }: { value: number; level: string; unit?: string }) {
  const s: Record<string,string> = {
    normal:   "text-emerald-600 bg-emerald-50 border-emerald-200",
    warning:  "text-amber-600   bg-amber-50   border-amber-200",
    critical: "text-red-600     bg-red-50     border-red-200",
  };
  return (
    <span className={`inline-flex items-center gap-0.5 text-sm font-semibold px-2 py-0.5 rounded-lg border ${s[level]}`}
      style={{ fontFamily: "'JetBrains Mono', monospace" }}>
      {value}{unit && <span className="text-xs font-normal opacity-70 ml-0.5">{unit}</span>}
    </span>
  );
}

// FIX #4: tipado correcto del tooltip de Recharts — eliminado `any`.
const CustomTooltip = ({
  active, payload, label, unit,
}: TooltipProps<ValueType, NameType> & { unit?: string }) => {
  if (active && payload?.length)
    return <div className="bg-white border border-slate-200 rounded-xl shadow-lg px-3 py-2"><p className="text-xs font-semibold text-slate-500 mb-1">{label}</p><p className="text-sm font-bold" style={{ color: payload[0].color }}>{payload[0].value} {unit}</p></div>;
  return null;
};

const chartConfigs = [
  { key: "ph"          as const, label: "pH",          unit: "",    icon: Droplets,    color: "#06b6d4", fill: "#e0f9ff", refLine: 7.0,                                          refLabel: "Neutro",      min: PARAMETROS_CALIDAD.ph.normalMin,          max: PARAMETROS_CALIDAD.ph.normalMax          },
  { key: "temperatura" as const, label: "Temperatura", unit: "°C",  icon: Thermometer, color: "#f97316", fill: "#fff7ed", refLine: undefined as number | undefined,               refLabel: undefined,     min: PARAMETROS_CALIDAD.temperatura.normalMin,  max: 35                                       },
  { key: "turbidez"    as const, label: "Turbidez",    unit: "NTU", icon: Eye,         color: "#a855f7", fill: "#faf5ff", refLine: PARAMETROS_CALIDAD.turbidez.normalMax,         refLabel: "Límite máx.", min: PARAMETROS_CALIDAD.turbidez.normalMin,     max: 5                                        },
  { key: "tds"         as const, label: "TDS",         unit: "ppm", icon: Zap,         color: "#10b981", fill: "#ecfdf5", refLine: PARAMETROS_CALIDAD.tds.normalMax,              refLabel: "Límite",      min: PARAMETROS_CALIDAD.tds.normalMin,          max: 600                                      },
];

// ─── Paginación centrada en la página actual (FIX #7) ─────────────────────
// Muestra hasta 5 páginas centradas en `page`, más el primer/último botón
// si quedan fuera del rango. Ejemplo con 20 páginas, en página 10:
//   1 ... 8 9 [10] 11 12 ... 20
function buildPageNumbers(page: number, totalPages: number): (number | "...")[] {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i);

  const WINDOW = 2; // páginas a cada lado de la actual
  const start  = Math.max(1, page - WINDOW);
  const end    = Math.min(totalPages - 2, page + WINDOW);

  const pages: (number | "...")[] = [0];

  if (start > 1) pages.push("...");
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < totalPages - 2) pages.push("...");

  pages.push(totalPages - 1);
  return pages;
}

// ─── main ─────────────────────────────────────────────────────────────────

export function HistorialPage() {
  // FIX #3: única llamada a useAnalysis — extraemos todo lo que necesitamos.
  const { idNodoActivo, nodos, loadingInit, errorInit, cambiarNodoActivo } = useAnalysis();

  const {
    pageData, grafData, loadingTable, loadingChart, errorData,
    filterMode, fromDate, toDate, customDatesEnabled, page,
    setPage, setFromDate, setToDate,
    cambiarFiltroMode, aplicarFiltroPersonalizado, exportarCSV, recargar,
  } = useHistorial(idNodoActivo, loadingInit);

  // Estado local de UI — qué parámetros muestra el gráfico (no pertenece al hook)
  const [activeParams, setActiveParams] = useState(["ph", "temperatura", "turbidez", "tds"]);
  const toggleParam = (key: string) =>
    setActiveParams((prev) => prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]);

  // Derivaciones de grafData — se calculan en la página porque dependen del renderizado
  const grafDataFormatted = grafData.map((d) => ({ ...d, fecha: formatHoraGraf(d.fechaHora) }));

  const statsFor = (key: keyof LecturaDTO) => {
    const vals = grafData.map((d) => d[key] as number).filter((v) => !isNaN(v));
    if (!vals.length) return { min: "—", max: "—", avg: "—" };
    return {
      min: Math.min(...vals).toFixed(2),
      max: Math.max(...vals).toFixed(2),
      avg: (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2),
    };
  };

  const totalPages    = pageData?.totalPages ?? 1;
  const totalElements = pageData?.totalElements ?? 0;
  const rows          = pageData?.content ?? [];

  const guardEl = <PageStateGuard loadingInit={loadingInit} errorInit={errorInit} loadingText="Cargando historial..." />;
  if (loadingInit || errorInit) return guardEl;

  // FIX #7: números de página centrados en la página actual
  const pageNumbers = buildPageNumbers(page, totalPages);

  return (
    <div className="space-y-5">

      {/* Header */}
      <PageHeader
        title="Historial de Datos"
        subtitle={totalElements > 0 ? `${totalElements} registros encontrados` : "Evolución histórica de parámetros"}
        actions={<>
        {nodos.length > 1 && (
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2 py-1.5 shadow-sm">
            <select
              value={idNodoActivo ?? ""}
              onChange={(e) => cambiarNodoActivo(Number(e.target.value))}
              className="text-xs text-slate-700 font-medium bg-transparent border-none outline-none cursor-pointer"
            >
              {nodos.map((n) => (
                <option key={n.idNodo} value={n.idNodo}>{n.ubicacion}</option>
              ))}
            </select>
          </div>
        )}
        <button
          onClick={exportarCSV}
          disabled={!idNodoActivo || totalElements === 0}
          className="flex items-center gap-1.5 text-sm text-slate-600 bg-white border border-slate-200 rounded-lg px-3 py-2 hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          title={totalElements === 0 ? "No hay datos para exportar" : "Descargar CSV"}
        >
          <Download size={13} /> Exportar CSV
        </button>
        </>}
      />

      {/* Filter bar */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Calendar size={15} className="text-slate-400" />
            <span className="text-sm font-semibold text-slate-700">Rango de fechas</span>
          </div>
          <div className="flex items-center gap-1.5 ml-1">
            {["Hoy","7 días","30 días","Personalizado"].map((opt) => (
              <button key={opt} onClick={() => cambiarFiltroMode(opt as FilterMode)}
                className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors border ${filterMode === opt ? "bg-cyan-500 text-white border-cyan-500 shadow-sm" : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100"}`}>
                {opt}
              </button>
            ))}
          </div>
          <div className={`flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 ${!customDatesEnabled ? "opacity-50" : ""}`}>
            <label className="text-xs text-slate-500">Desde</label>
            <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)}
              disabled={!customDatesEnabled} className="text-xs text-slate-700 bg-transparent border-none outline-none disabled:cursor-not-allowed" />
          </div>
          <span className="text-slate-400 text-sm">→</span>
          <div className={`flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 ${!customDatesEnabled ? "opacity-50" : ""}`}>
            <label className="text-xs text-slate-500">Hasta</label>
            <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)}
              disabled={!customDatesEnabled} className="text-xs text-slate-700 bg-transparent border-none outline-none disabled:cursor-not-allowed" />
          </div>
          <button onClick={aplicarFiltroPersonalizado} disabled={!customDatesEnabled}
            className="flex items-center gap-1.5 text-xs font-semibold text-white bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg px-4 py-1.5 hover:from-cyan-600 hover:to-blue-700 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
            <Filter size={12} /> Aplicar
          </button>
          <div className="flex items-center gap-1.5 ml-auto flex-wrap">
            {chartConfigs.map((c) => (
              <button key={c.key} onClick={() => toggleParam(c.key)}
                className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg border transition-all ${activeParams.includes(c.key) ? "border-transparent text-white shadow-sm" : "bg-slate-50 border-slate-200 text-slate-400"}`}
                style={activeParams.includes(c.key) ? { backgroundColor: c.color } : {}}>
                <c.icon size={11} /> {c.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {errorData && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <AlertTriangle size={16} className="text-red-500" />
          <p className="text-sm text-red-700">{errorData}</p>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {chartConfigs.filter((c) => activeParams.includes(c.key)).map((cfg) => {
          const stats = statsFor(cfg.key);
          return (
            <div key={cfg.key} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: cfg.fill }}>
                    <cfg.icon size={15} style={{ color: cfg.color }} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{cfg.label}</p>
                    <p className="text-xs text-slate-400">Rango: {cfg.min} – {cfg.max} {cfg.unit}</p>
                  </div>
                </div>
                <div className="hidden sm:flex items-center gap-3 text-xs text-slate-500">
                  {(["min","max","avg"] as const).map((stat) => (
                    <div key={stat} className="text-center">
                      <p className="text-slate-400">{stat === "avg" ? "Prom" : stat === "min" ? "Mín" : "Máx"}</p>
                      <p className="font-semibold text-slate-700" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{stats[stat]}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="h-48">
                {loadingChart ? (
                  <div className="h-full flex items-center justify-center"><Loader2 size={20} className="text-slate-400 animate-spin" /></div>
                ) : grafDataFormatted.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-xs text-slate-400">Sin datos para el período</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={grafDataFormatted} margin={{ top: 5, right: 5, left: -22, bottom: 0 }}>
                      <defs>
                        <linearGradient id={`grad-${cfg.key}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor={cfg.color} stopOpacity={0.2} />
                          <stop offset="95%" stopColor={cfg.color} stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="fecha" tick={{ fontSize: 9, fill: "#94a3b8" }} interval={Math.floor(grafDataFormatted.length/6)} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 9, fill: "#94a3b8" }} axisLine={false} tickLine={false} domain={[cfg.min, cfg.max]} />
                      <Tooltip content={<CustomTooltip unit={cfg.unit} />} />
                      {cfg.refLine && <ReferenceLine y={cfg.refLine} stroke="#f59e0b" strokeDasharray="4 4" strokeWidth={1.5} label={{ value: cfg.refLabel, fontSize: 9, fill: "#f59e0b", position: "insideTopRight" }} />}
                      <Area type="monotone" dataKey={cfg.key} stroke={cfg.color} strokeWidth={2} fill={`url(#grad-${cfg.key})`} dot={false} activeDot={{ r: 4, fill: cfg.color, strokeWidth: 0 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
              <div className="flex items-center gap-1.5 mt-2">
                <TrendingUp size={12} style={{ color: cfg.color }} />
                <span className="text-xs text-slate-400">Tendencia del período seleccionado</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-800">Registros Históricos</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {loadingTable ? "Cargando..." : `Mostrando ${rows.length} de ${totalElements} registros`}
            </p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                {["Fecha / Hora","pH","Temp. (°C)","Turbidez (NTU)","TDS (ppm)","Estado"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loadingTable ? (
                <tr><td colSpan={6} className="py-10 text-center"><Loader2 size={20} className="mx-auto text-slate-400 animate-spin" /></td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={6} className="py-10 text-center text-xs text-slate-400">No hay registros en el período seleccionado</td></tr>
              ) : rows.map((row) => {
                const nivel = evaluarLectura(row);
                return (
                  <tr key={row.idLectura} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-xs text-slate-600" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{formatFechaTabla(row.fechaHora)}</td>
                    <td className="px-4 py-3"><ValueCell value={row.ph}          level={evaluarParametro("ph",          row.ph)}          /></td>
                    <td className="px-4 py-3"><ValueCell value={row.temperatura} level={evaluarParametro("temperatura", row.temperatura)} unit="°C"  /></td>
                    <td className="px-4 py-3"><ValueCell value={row.turbidez}    level={evaluarParametro("turbidez",    row.turbidez)}    unit="NTU" /></td>
                    <td className="px-4 py-3"><ValueCell value={row.tds}         level={evaluarParametro("tds",         row.tds)}         unit="ppm" /></td>
                    <td className="px-4 py-3">
                      <StatusBadge status={nivel} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* FIX #7: paginación centrada en la página actual */}
        <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-500">Página {page + 1} de {totalPages}</span>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}
              className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors text-slate-500 disabled:opacity-50 disabled:cursor-not-allowed">
              <ChevronLeft size={13} />
            </button>

            {pageNumbers.map((p, i) =>
              p === "..." ? (
                <span key={`ellipsis-${i}`} className="text-slate-400 text-xs px-1">...</span>
              ) : (
                <button key={p} onClick={() => setPage(p as number)}
                  className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-medium transition-colors ${page === p ? "bg-cyan-500 text-white border border-cyan-500" : "border border-slate-200 text-slate-500 hover:bg-slate-50"}`}>
                  {(p as number) + 1}
                </button>
              )
            )}

            <button onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
              className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors text-slate-500 disabled:opacity-50 disabled:cursor-not-allowed">
              <ChevronRight size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
