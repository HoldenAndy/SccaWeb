import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from "recharts";
import {
  Download, Filter, Droplets, Thermometer, Eye, Zap,
  ChevronLeft, ChevronRight, Waves, TrendingUp, Calendar, Loader2, AlertTriangle,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useAnalysis } from "../contexts/AnalysisContext";
import {
  getHistorialPaginado, getDatosGraficos,
  parseFechaBackend, toLocalISOString,
  type LecturaDTO, type PageResponse,
} from "../../api/lecturas";

// ─── helpers ──────────────────────────────────────────────────────────────

// FIX #2: usa parseFechaBackend
function formatFechaTabla(fecha: string | number[]): string {
  const d = parseFechaBackend(fecha);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth()+1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function formatHoraGraf(fecha: string | number[]): string {
  const d = parseFechaBackend(fecha);
  return `${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
}

function isoToday(): string {
  return new Date().toISOString().split("T")[0];
}

function isoNDaysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n + 1);
  return d.toISOString().split("T")[0];
}

// ─── levels ───────────────────────────────────────────────────────────────

function phLevel(v: number)   { return v >= 6.5 && v <= 8.5 ? "normal" : (v >= 6 && v < 6.5)||(v > 8.5 && v <= 9) ? "warning" : "critical"; }
function tempLevel(v: number) { return v >= 15 && v <= 30 ? "normal" : (v >= 12 && v < 15)||(v > 30 && v <= 33) ? "warning" : "critical"; }
function turbLevel(v: number) { return v <= 4 ? "normal" : v <= 6 ? "warning" : "critical"; }
function tdsLevel(v: number)  { return v <= 500 ? "normal" : v <= 600 ? "warning" : "critical"; }
function getOverallStatus(l: LecturaDTO) {
  const levels = [phLevel(l.ph), tempLevel(l.temperatura), turbLevel(l.turbidez), tdsLevel(l.tds)];
  if (levels.includes("critical")) return "Crítico";
  if (levels.includes("warning"))  return "Aviso";
  return "Normal";
}

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

const CustomTooltip = ({ active, payload, label, unit }: any) => {
  if (active && payload?.length)
    return <div className="bg-white border border-slate-200 rounded-xl shadow-lg px-3 py-2"><p className="text-xs font-semibold text-slate-500 mb-1">{label}</p><p className="text-sm font-bold" style={{ color: payload[0].color }}>{payload[0].value} {unit}</p></div>;
  return null;
};

const chartConfigs = [
  { key: "ph"          as const, label: "pH",          unit: "",    icon: Droplets,    color: "#06b6d4", fill: "#e0f9ff", refLine: 7.0,  refLabel: "Neutro",      min: 6.5, max: 8.5 },
  { key: "temperatura" as const, label: "Temperatura", unit: "°C",  icon: Thermometer, color: "#f97316", fill: "#fff7ed", refLine: undefined, refLabel: undefined, min: 15,  max: 35  },
  { key: "turbidez"    as const, label: "Turbidez",    unit: "NTU", icon: Eye,         color: "#a855f7", fill: "#faf5ff", refLine: 4.0,  refLabel: "Límite máx.", min: 0,   max: 5   },
  { key: "tds"         as const, label: "TDS",         unit: "ppm", icon: Zap,         color: "#10b981", fill: "#ecfdf5", refLine: 500,  refLabel: "Límite",      min: 0,   max: 600 },
];

// ─── main ─────────────────────────────────────────────────────────────────

export function HistorialPage() {
  const { idNodoActivo, loadingInit } = useAnalysis();

  const [filterMode, setFilterMode]               = useState("Hoy");
  const [fromDate, setFromDate]                   = useState(isoToday());
  const [toDate, setToDate]                       = useState(isoToday());
  const [customDatesEnabled, setCustomDatesEnabled] = useState(false);
  const [activeParams, setActiveParams]           = useState(["ph","temperatura","turbidez","tds"]);
  const [page, setPage]                           = useState(0); // 0-indexed

  const [pageData, setPageData]   = useState<PageResponse<LecturaDTO> | null>(null);
  const [loadingTable, setLoadingTable] = useState(false);
  const [grafData, setGrafData]   = useState<LecturaDTO[]>([]);
  const [loadingChart, setLoadingChart] = useState(false);
  const [errorData, setErrorData] = useState<string | null>(null);

  // FIX #3: construir fechas correctas para el backend (sin Z, sin ms)
  const getRange = useCallback((): [string, string] => {
    if (filterMode === "Personalizado") {
      return [
        toLocalISOString(new Date(`${fromDate}T00:00:00`)),
        toLocalISOString(new Date(`${toDate}T23:59:59`)),
      ];
    }
    const days = filterMode === "7 días" ? 7 : filterMode === "30 días" ? 30 : 1;
    const fin    = new Date();
    const inicio = new Date();
    inicio.setDate(inicio.getDate() - (days - 1));
    inicio.setHours(0, 0, 0, 0);
    return [toLocalISOString(inicio), toLocalISOString(fin)];
  }, [filterMode, fromDate, toDate]);

  const cargarTabla = useCallback(async () => {
    if (!idNodoActivo || loadingInit) return;
    setLoadingTable(true);
    setErrorData(null);
    try {
      const [inicio, fin] = getRange();
      const data = await getHistorialPaginado(idNodoActivo, inicio, fin, page, 8);
      setPageData(data);
    } catch (err: unknown) {
      setErrorData(err instanceof Error ? err.message : String(err));
    } finally { setLoadingTable(false); }
  }, [idNodoActivo, loadingInit, page, getRange]);

  const cargarGraficos = useCallback(async () => {
    if (!idNodoActivo || loadingInit) return;
    setLoadingChart(true);
    try {
      const [inicio, fin] = getRange();
      const data = await getDatosGraficos(idNodoActivo, inicio, fin);
      setGrafData(data);
    } catch { /* silencioso */ }
    finally { setLoadingChart(false); }
  }, [idNodoActivo, loadingInit, getRange]);

  useEffect(() => { cargarTabla(); cargarGraficos(); }, [cargarTabla, cargarGraficos]);
  useEffect(() => { setPage(0); }, [filterMode, fromDate, toDate]);

  const handleFilterModeChange = (mode: string) => {
    setFilterMode(mode);
    setCustomDatesEnabled(mode === "Personalizado");
    if (mode === "7 días")  { setFromDate(isoNDaysAgo(7));  setToDate(isoToday()); }
    if (mode === "30 días") { setFromDate(isoNDaysAgo(30)); setToDate(isoToday()); }
    if (mode === "Hoy")     { setFromDate(isoToday());       setToDate(isoToday()); }
  };

  const toggleParam = (key: string) =>
    setActiveParams((prev) => prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]);

  // FIX #2: usar parseFechaBackend en grafData
  const grafDataFormatted = grafData.map((d) => ({ ...d, fecha: formatHoraGraf(d.fechaHora) }));

  const statsFor = (key: keyof LecturaDTO) => {
    const vals = grafData.map((d) => d[key] as number).filter((v) => !isNaN(v));
    if (!vals.length) return { min: "—", max: "—", avg: "—" };
    return {
      min: Math.min(...vals).toFixed(2),
      max: Math.max(...vals).toFixed(2),
      avg: (vals.reduce((a,b) => a+b, 0) / vals.length).toFixed(2),
    };
  };

  // FIX #1: usar pageNumber (no number) y totalElements real del backend
  const totalPages    = pageData?.totalPages ?? 1;
  const totalElements = pageData?.totalElements ?? 0;
  const rows          = pageData?.content ?? [];

  // Esperar a que el Context termine de cargar antes de renderizar
  if (loadingInit)
    return (
      <div className="flex items-center justify-center min-h-64 gap-2">
        <Loader2 size={24} className="text-cyan-500 animate-spin" />
        <span className="text-sm text-slate-500">Cargando historial...</span>
      </div>
    );

  return (
    <div className="space-y-5" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <Waves size={18} className="text-cyan-500" />
            <h1 className="text-xl font-bold text-slate-800">Historial de Datos</h1>
          </div>
          <p className="text-sm text-slate-500 ml-6.5">
            {totalElements > 0 ? `${totalElements} registros encontrados` : "Evolución histórica de parámetros"}
          </p>
        </div>
        <button className="flex items-center gap-1.5 text-sm text-slate-600 bg-white border border-slate-200 rounded-lg px-3 py-2 hover:bg-slate-50 transition-colors shadow-sm">
          <Download size={13} /> Exportar CSV
        </button>
      </div>

      {/* Filter bar */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Calendar size={15} className="text-slate-400" />
            <span className="text-sm font-semibold text-slate-700">Rango de fechas</span>
          </div>
          <div className="flex items-center gap-1.5 ml-1">
            {["Hoy","7 días","30 días","Personalizado"].map((opt) => (
              <button key={opt} onClick={() => handleFilterModeChange(opt)}
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
          <button onClick={() => { cargarTabla(); cargarGraficos(); }} disabled={!customDatesEnabled}
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
                const status = getOverallStatus(row);
                return (
                  <tr key={row.idLectura} className="hover:bg-slate-50 transition-colors">
                    {/* FIX #2 */}
                    <td className="px-4 py-3 text-xs text-slate-600" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{formatFechaTabla(row.fechaHora)}</td>
                    <td className="px-4 py-3"><ValueCell value={row.ph}          level={phLevel(row.ph)}           /></td>
                    <td className="px-4 py-3"><ValueCell value={row.temperatura} level={tempLevel(row.temperatura)} unit="°C"  /></td>
                    <td className="px-4 py-3"><ValueCell value={row.turbidez}    level={turbLevel(row.turbidez)}   unit="NTU" /></td>
                    <td className="px-4 py-3"><ValueCell value={row.tds}         level={tdsLevel(row.tds)}         unit="ppm" /></td>
                    <td className="px-4 py-3">
                      {status === "Crítico" ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold bg-red-100 text-red-700 border border-red-200 rounded-full px-2.5 py-0.5"><span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> Crítico</span>
                      ) : status === "Aviso" ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200 rounded-full px-2.5 py-0.5"><span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Aviso</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-full px-2.5 py-0.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Normal</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* FIX #1: paginación con pageNumber correcto */}
        <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-500">Página {page + 1} de {totalPages}</span>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}
              className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors text-slate-500 disabled:opacity-50 disabled:cursor-not-allowed">
              <ChevronLeft size={13} />
            </button>
            {[...Array(Math.min(5, totalPages))].map((_, i) => (
              <button key={i} onClick={() => setPage(i)}
                className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-medium transition-colors ${page === i ? "bg-cyan-500 text-white border border-cyan-500" : "border border-slate-200 text-slate-500 hover:bg-slate-50"}`}>
                {i + 1}
              </button>
            ))}
            {totalPages > 5 && (
              <>
                <span className="text-slate-400 text-xs px-1">...</span>
                <button onClick={() => setPage(totalPages - 1)}
                  className={`w-7 h-7 flex items-center justify-center rounded-lg border text-xs font-medium transition-colors ${page === totalPages - 1 ? "bg-cyan-500 text-white border-cyan-500" : "border-slate-200 text-slate-500 hover:bg-slate-50"}`}>
                  {totalPages}
                </button>
              </>
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
