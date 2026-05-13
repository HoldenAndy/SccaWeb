import {
  Thermometer, Droplets, Eye, Zap, AlertTriangle, Camera, BrainCircuit,
  Clock, TrendingUp, TrendingDown, Minus, CheckCircle2, Waves, ChevronRight,
  Loader2, RefreshCw,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from "recharts";
import { useNavigate } from "react-router";
import { useState, useEffect, useCallback } from "react";
import { useAnalysis } from "../contexts/AnalysisContext";
import { getDatosGraficos, parseFechaBackend, toLocalISOString, type LecturaDTO } from "../../api/lecturas";

// ─── helpers ──────────────────────────────────────────────────────────────

// FIX #2: usa parseFechaBackend para soportar array o string
function formatHora(fecha: string | number[]): string {
  const d = parseFechaBackend(fecha);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function tendencia(data: LecturaDTO[], key: keyof LecturaDTO): "up" | "down" | "stable" {
  if (data.length < 2) return "stable";
  const last = data[data.length - 1][key] as number;
  const prev = data[data.length - 2][key] as number;
  const diff = last - prev;
  if (Math.abs(diff) < 0.05) return "stable";
  return diff > 0 ? "up" : "down";
}

// ─── sub-components ───────────────────────────────────────────────────────

function TrendBadge({ trend }: { trend: string }) {
  if (trend === "up")   return <span className="flex items-center gap-0.5 text-xs font-medium text-red-500"><TrendingUp size={12} /> Subiendo</span>;
  if (trend === "down") return <span className="flex items-center gap-0.5 text-xs font-medium text-emerald-500"><TrendingDown size={12} /> Bajando</span>;
  return <span className="flex items-center gap-0.5 text-xs font-medium text-slate-400"><Minus size={12} /> Estable</span>;
}

function StatusBadge({ status }: { status: string }) {
  if (status === "warning")
    return <span className="inline-flex items-center gap-1 text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200 rounded-full px-2 py-0.5"><span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Aviso</span>;
  return <span className="inline-flex items-center gap-1 text-xs font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-full px-2 py-0.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Normal</span>;
}

const MiniTooltip = ({ active, payload, label, unit }: any) => {
  if (active && payload?.length)
    return <div className="bg-white border border-slate-200 rounded-lg shadow-lg px-2.5 py-1.5"><p className="text-xs text-slate-400">{label}</p><p className="text-xs font-bold" style={{ color: payload[0].color }}>{payload[0].value} {unit}</p></div>;
  return null;
};

const sensorMeta = [
  { key: "ph"          as const, label: "pH",          unit: "",    icon: Droplets,     color: "text-cyan-600",   bg: "bg-cyan-50",   border: "border-cyan-100",   bar: "bg-cyan-500",   rangeMin: 6.5, rangeMax: 8.5 },
  { key: "temperatura" as const, label: "Temperatura", unit: "°C",  icon: Thermometer,  color: "text-orange-500", bg: "bg-orange-50", border: "border-orange-100", bar: "bg-orange-500", rangeMin: 15,  rangeMax: 30  },
  { key: "turbidez"    as const, label: "Turbidez",    unit: "NTU", icon: Eye,          color: "text-amber-600",  bg: "bg-amber-50",  border: "border-amber-100",  bar: "bg-amber-500",  rangeMin: 0,   rangeMax: 4   },
  { key: "tds"         as const, label: "TDS",         unit: "ppm", icon: Zap,          color: "text-emerald-600",bg: "bg-emerald-50",border: "border-emerald-100",bar: "bg-emerald-500",rangeMin: 0,   rangeMax: 500 },
];

const miniCharts = [
  { key: "ph"          as const, label: "pH",          unit: "",    color: "#06b6d4", domain: [6.4, 7.6]  as [number,number], refLine: undefined as number|undefined },
  { key: "temperatura" as const, label: "Temperatura", unit: "°C",  color: "#f97316", domain: [15,  35]   as [number,number], refLine: undefined as number|undefined },
  { key: "turbidez"    as const, label: "Turbidez",    unit: "NTU", color: "#a855f7", domain: [0,   5]    as [number,number], refLine: 4.0 },
  { key: "tds"         as const, label: "TDS",         unit: "ppm", color: "#10b981", domain: [0,   600]  as [number,number], refLine: undefined as number|undefined },
];

// ─── main ─────────────────────────────────────────────────────────────────

export function DashboardPage() {
  const navigate = useNavigate();
  // FIX #10: removido addAnalysis (no se usa) y setIsGenerating (FIX #4)
  const {
    ultimaLectura, idNodoActivo, isGenerating,
    analyses, loadingInit, errorInit,
    generarNuevoAnalisis, lecturaConImagen,
  } = useAnalysis();

  const [chartData, setChartData] = useState<LecturaDTO[]>([]);
  const [loadingChart, setLoadingChart] = useState(false);
  const [ahora, setAhora] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setAhora(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const cargarGraficos = useCallback(async () => {
    if (!idNodoActivo) return;
    setLoadingChart(true);
    try {
      const fin    = new Date();
      const inicio = new Date(fin.getTime() - 2 * 60 * 60 * 1000);
      // FIX #3: toLocalISOString en lugar de toISOString para evitar el "Z"
      const data = await getDatosGraficos(idNodoActivo, toLocalISOString(inicio), toLocalISOString(fin));
      setChartData(data);
    } catch { /* silencioso */ }
    finally { setLoadingChart(false); }
  }, [idNodoActivo]);

  useEffect(() => {
    cargarGraficos();
    const t = setInterval(cargarGraficos, 30_000);
    return () => clearInterval(t);
  }, [cargarGraficos]);

  const lec = chartData[chartData.length - 1] ?? ultimaLectura;

  const segsDesde = lec
    ? Math.floor((Date.now() - parseFechaBackend(lec.fechaHora).getTime()) / 1000) // FIX #2
    : null;

  const turbWarning = lec && lec.turbidez > 3.5;

  // FIX #4: NO hacer setIsGenerating manual — generarNuevoAnalisis lo maneja solo
  const handleGenerateAnalysis = async () => {
    await generarNuevoAnalisis();
    navigate("/analisis-ia");
  };

  // ── loading / error ───────────────────────────────────────────────────

  if (loadingInit)
    return <div className="flex flex-col items-center justify-center min-h-64 gap-3"><Loader2 size={28} className="text-cyan-500 animate-spin" /><p className="text-sm text-slate-500">Conectando con el backend...</p></div>;

  if (errorInit)
    return (
      <div className="flex flex-col items-center justify-center min-h-64 gap-3">
        <AlertTriangle size={28} className="text-amber-500" />
        <p className="text-sm font-semibold text-slate-700">No se pudo conectar al backend</p>
        <p className="text-xs text-slate-400 text-center max-w-sm">{errorInit}</p>
        <p className="text-xs text-slate-400">Verifica que el backend corra en <code>http://localhost:8080</code></p>
      </div>
    );

  // FIX #2: formatear con parseFechaBackend para los gráficos
  const chartDataFormatted = chartData.map((d) => ({
    ...d,
    time: formatHora(d.fechaHora),
  }));

  return (
    <div className="space-y-5" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* Modal generación */}
      {isGenerating && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-violet-50 border border-violet-200 flex items-center justify-center">
                <BrainCircuit size={18} className="text-violet-600" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-800">Generando análisis IA</h3>
                <p className="text-xs text-slate-500">Procesando datos de sensores...</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {sensorMeta.map((s) => (
                <div key={s.key} className={`rounded-lg ${s.bg} border ${s.border} p-2.5`}>
                  <div className="flex items-center gap-1.5 mb-1">
                    <s.icon size={12} className={s.color} />
                    <span className="text-xs text-slate-600">{s.label}</span>
                  </div>
                  <p className={`text-lg font-bold ${s.color}`} style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                    {lec ? lec[s.key] : "—"}<span className="text-xs font-normal text-slate-400 ml-0.5">{s.unit}</span>
                  </p>
                </div>
              ))}
            </div>
            <div className="bg-violet-50 border border-violet-100 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <Loader2 size={14} className="text-violet-600 animate-spin" />
                {/* FIX #8: nombre correcto del modelo */}
                <span className="text-xs font-medium text-violet-700">Procesando con Gemini Vision...</span>
              </div>
              <div className="w-full bg-violet-200 rounded-full h-1.5 overflow-hidden">
                <div className="bg-violet-600 h-full rounded-full animate-pulse" style={{ width: "70%" }}></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <Waves size={18} className="text-cyan-500" />
            <h1 className="text-xl font-bold text-slate-800">Panel de Control</h1>
          </div>
          <p className="text-sm text-slate-500 ml-6.5">
            Monitoreo en tiempo real{segsDesde !== null && ` · Última lectura hace ${segsDesde}s`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={cargarGraficos} disabled={loadingChart}
            className="flex items-center gap-1.5 text-xs text-slate-600 bg-white border border-slate-200 rounded-lg px-3 py-2 hover:bg-slate-50 shadow-sm disabled:opacity-50">
            <RefreshCw size={12} className={loadingChart ? "animate-spin" : ""} /> Refrescar
          </button>
          <div className="flex items-center gap-1.5 text-sm bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-sm">
            <Clock size={13} className="text-cyan-500" />
            <span className="text-slate-600 font-medium" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>
              {String(ahora.getHours()).padStart(2,"0")}:{String(ahora.getMinutes()).padStart(2,"0")}:{String(ahora.getSeconds()).padStart(2,"0")}
            </span>
          </div>
        </div>
      </div>

      {/* Alert banner */}
      {turbWarning && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 shadow-sm">
          <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
            <AlertTriangle size={14} className="text-amber-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-amber-800">Aviso de calidad detectado</p>
            <p className="text-xs text-amber-700 mt-0.5">
              La turbidez ({lec!.turbidez} NTU) está aproximándose al límite máximo recomendado de 4 NTU. Se sugiere revisar el sistema de filtración.
            </p>
          </div>
          <button onClick={() => navigate("/analisis-ia")} className="ml-auto text-xs font-medium text-amber-600 hover:text-amber-800 flex items-center gap-1 flex-shrink-0">
            Ver análisis <ChevronRight size={12} />
          </button>
        </div>
      )}

      {/* FIX #7: aviso si la lectura no tiene imagen (análisis no disponible) */}
      {!lecturaConImagen && !loadingInit && (
        <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 shadow-sm">
          <AlertTriangle size={14} className="text-blue-500 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-blue-700">
            La última lectura no tiene imagen asociada. El análisis IA requiere una imagen del agua capturada por la cámara ESP32.
          </p>
        </div>
      )}

      {/* Sensor cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {sensorMeta.map((sensor) => {
          const val = lec ? (lec[sensor.key] as number) : null;
          const pct = val !== null ? Math.min(100, Math.max(0, ((val - sensor.rangeMin) / (sensor.rangeMax - sensor.rangeMin)) * 100)) : 0;
          const trend = chartData.length > 1 ? tendencia(chartData, sensor.key) : "stable";
          const isWarning = sensor.key === "turbidez" && val !== null && val > 3.5;
          return (
            <div key={sensor.key} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-9 h-9 rounded-xl ${sensor.bg} ${sensor.border} border flex items-center justify-center`}>
                  <sensor.icon size={16} className={sensor.color} />
                </div>
                <StatusBadge status={isWarning ? "warning" : "normal"} />
              </div>
              <div className="mb-1">
                <span className="text-3xl font-bold text-slate-800" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{val !== null ? val : "—"}</span>
                <span className="text-sm text-slate-400 ml-1">{sensor.unit}</span>
              </div>
              <p className="text-sm font-medium text-slate-600 mb-3">{sensor.label}</p>
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mb-2">
                <div className={`h-full rounded-full ${sensor.bar} transition-all`} style={{ width: `${pct}%` }} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">{sensor.rangeMin} – {sensor.rangeMax} {sensor.unit}</span>
                <TrendBadge trend={trend} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts + Camera */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {miniCharts.map((cfg) => (
            <div key={cfg.key} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm font-semibold text-slate-800">{cfg.label}</p>
                  <p className="text-xs text-slate-400">Últimas 2 horas</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cfg.color }}></span>
                  <span className="text-xs font-semibold" style={{ color: cfg.color, fontFamily: "'JetBrains Mono', monospace" }}>
                    {lec ? (lec[cfg.key] as number) : "—"} {cfg.unit}
                  </span>
                </div>
              </div>
              <div className="h-32">
                {chartDataFormatted.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-xs text-slate-400">
                    {loadingChart ? "Cargando..." : "Sin datos en las últimas 2 h"}
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartDataFormatted} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
                      <defs>
                        <linearGradient id={`grad-dash-${cfg.key}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor={cfg.color} stopOpacity={0.18} />
                          <stop offset="95%" stopColor={cfg.color} stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="time" tick={{ fontSize: 9, fill: "#94a3b8" }} axisLine={false} tickLine={false} interval={Math.floor(chartDataFormatted.length / 4)} />
                      <YAxis tick={{ fontSize: 9, fill: "#94a3b8" }} axisLine={false} tickLine={false} domain={cfg.domain} />
                      <Tooltip content={<MiniTooltip unit={cfg.unit} />} />
                      {cfg.refLine && <ReferenceLine y={cfg.refLine} stroke="#f59e0b" strokeDasharray="4 4" strokeWidth={1.5} />}
                      <Area type="monotone" dataKey={cfg.key} stroke={cfg.color} strokeWidth={2} fill={`url(#grad-dash-${cfg.key})`} dot={false} activeDot={{ r: 3, fill: cfg.color, strokeWidth: 0 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Camera */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-semibold text-slate-800">Cámara ESP32</h2>
              <p className="text-xs text-slate-400 mt-0.5">Imagen en tiempo real</p>
            </div>
            <span className="flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>Live
            </span>
          </div>
          <div className="flex-1 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 flex flex-col items-center justify-center gap-3 min-h-[200px] relative overflow-hidden">
            <div className="absolute inset-x-0 h-0.5 bg-cyan-400/40" style={{ animation: "scanline 3s linear infinite" }}></div>
            <div className="w-12 h-12 rounded-full bg-slate-700 border-2 border-slate-600 flex items-center justify-center">
              <Camera size={20} className="text-slate-400" />
            </div>
            <div className="text-center">
              <p className="text-xs font-medium text-slate-300">640 × 480 px</p>
              <p className="text-xs text-slate-500 mt-0.5">Actualización: cada 10 s</p>
            </div>
            <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-cyan-400/50 rounded-tl"></div>
            <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-cyan-400/50 rounded-tr"></div>
            <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-cyan-400/50 rounded-bl"></div>
            <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-cyan-400/50 rounded-br"></div>
          </div>
          <div className="mt-3 text-xs text-slate-400">
            <span>Última captura: {lec ? formatHora(lec.fechaHora) : "—"}</span>
          </div>
        </div>
      </div>

      {/* AI summary */}
      {analyses.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-violet-50 border border-violet-200 flex items-center justify-center">
                <BrainCircuit size={16} className="text-violet-600" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-slate-800">Análisis IA — Resumen Actual</h2>
                {/* FIX #8: nombre correcto del modelo */}
                <p className="text-xs text-slate-400">Generado: {analyses[0].fecha} · {analyses[0].tiempo} · Gemini Flash Lite</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-1">
                <CheckCircle2 size={11} /> Completado
              </span>
              <button onClick={() => navigate("/analisis-ia")} className="flex items-center gap-1.5 text-xs font-medium text-violet-600 bg-violet-50 border border-violet-200 rounded-lg px-3 py-1.5 hover:bg-violet-100 transition-colors">
                Ver completo <ChevronRight size={11} />
              </button>
            </div>
          </div>
          <div className="bg-gradient-to-r from-violet-50 to-blue-50 rounded-xl p-4 border border-violet-100">
            <p className="text-sm text-slate-700 leading-relaxed">{analyses[0].resumen}</p>
          </div>
          <div className="flex items-center gap-2 mt-3">
            {/* FIX #7: botón deshabilitado si no hay imagen */}
            <button
              onClick={handleGenerateAnalysis}
              disabled={isGenerating || !ultimaLectura || !lecturaConImagen}
              className="flex items-center gap-1.5 text-xs font-medium text-white bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg px-3.5 py-2 hover:from-cyan-600 hover:to-blue-700 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              title={!lecturaConImagen ? "La lectura actual no tiene imagen asociada" : ""}
            >
              {isGenerating
                ? <><Loader2 size={12} className="animate-spin" /> Generando...</>
                : <><BrainCircuit size={12} /> Generar nuevo análisis</>}
            </button>
            {!lecturaConImagen && (
              <span className="text-xs text-amber-600">Requiere imagen de la cámara</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
