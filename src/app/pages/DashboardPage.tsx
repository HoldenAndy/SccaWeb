import {
  Thermometer,
  Droplets,
  Eye,
  Zap,
  AlertTriangle,
  RefreshCw,
  Camera,
  BrainCircuit,
  Clock,
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle2,
  Waves,
  ChevronRight,
  Loader2,
} from "lucide-react";
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { useNavigate } from "react-router";
import { useState } from "react";
import { useAnalysis } from "../contexts/AnalysisContext";

const realtimeData = [
  { time: "14:00", ph: 7.1, temp: 23.0, turb: 2.9, tds: 316 },
  { time: "14:05", ph: 7.0, temp: 23.5, turb: 3.1, tds: 318 },
  { time: "14:10", ph: 7.2, temp: 23.8, turb: 3.0, tds: 320 },
  { time: "14:15", ph: 7.3, temp: 24.2, turb: 3.4, tds: 326 },
  { time: "14:20", ph: 7.1, temp: 24.0, turb: 3.6, tds: 322 },
  { time: "14:25", ph: 6.9, temp: 23.5, turb: 3.8, tds: 317 },
  { time: "14:30", ph: 7.0, temp: 23.2, turb: 3.5, tds: 319 },
  { time: "14:32", ph: 7.1, temp: 23.5, turb: 3.4, tds: 321 },
];

const sensorCards = [
  {
    label: "pH",
    value: "7.1",
    unit: "",
    icon: Droplets,
    range: "6.5 – 8.5",
    rangeMin: 6.5,
    rangeMax: 8.5,
    currentNum: 7.1,
    status: "normal",
    trend: "stable",
    desc: "Nivel neutro",
    light: "bg-cyan-50",
    text: "text-cyan-600",
    border: "border-cyan-100",
    bar: "bg-cyan-500",
  },
  {
    label: "Temperatura",
    value: "23.5",
    unit: "°C",
    icon: Thermometer,
    range: "15 – 30 °C",
    rangeMin: 15,
    rangeMax: 30,
    currentNum: 23.5,
    status: "normal",
    trend: "up",
    desc: "Dentro del rango",
    light: "bg-orange-50",
    text: "text-orange-500",
    border: "border-orange-100",
    bar: "bg-orange-500",
  },
  {
    label: "Turbidez",
    value: "3.4",
    unit: "NTU",
    icon: Eye,
    range: "0 – 4 NTU",
    rangeMin: 0,
    rangeMax: 4,
    currentNum: 3.4,
    status: "warning",
    trend: "up",
    desc: "Aproximándose al límite",
    light: "bg-amber-50",
    text: "text-amber-600",
    border: "border-amber-100",
    bar: "bg-amber-500",
  },
  {
    label: "TDS",
    value: "321",
    unit: "ppm",
    icon: Zap,
    range: "0 – 500 ppm",
    rangeMin: 0,
    rangeMax: 500,
    currentNum: 321,
    status: "normal",
    trend: "down",
    desc: "Sólidos disueltos OK",
    light: "bg-emerald-50",
    text: "text-emerald-600",
    border: "border-emerald-100",
    bar: "bg-emerald-500",
  },
];

const miniCharts = [
  {
    key: "ph",
    label: "pH",
    unit: "",
    color: "#06b6d4",
    fillFrom: "#06b6d4",
    domain: [6.4, 7.6] as [number, number],
    refLine: undefined as number | undefined,
  },
  {
    key: "temp",
    label: "Temperatura",
    unit: "°C",
    color: "#f97316",
    fillFrom: "#f97316",
    domain: [21, 26] as [number, number],
    refLine: undefined as number | undefined,
  },
  {
    key: "turb",
    label: "Turbidez",
    unit: "NTU",
    color: "#a855f7",
    fillFrom: "#a855f7",
    domain: [0, 5] as [number, number],
    refLine: 4.0,
  },
  {
    key: "tds",
    label: "TDS",
    unit: "ppm",
    color: "#10b981",
    fillFrom: "#10b981",
    domain: [290, 340] as [number, number],
    refLine: undefined as number | undefined,
  },
];

function TrendBadge({ trend }: { trend: string }) {
  if (trend === "up")
    return (
      <span className="flex items-center gap-0.5 text-xs font-medium text-red-500">
        <TrendingUp size={12} /> Subiendo
      </span>
    );
  if (trend === "down")
    return (
      <span className="flex items-center gap-0.5 text-xs font-medium text-emerald-500">
        <TrendingDown size={12} /> Bajando
      </span>
    );
  return (
    <span className="flex items-center gap-0.5 text-xs font-medium text-slate-400">
      <Minus size={12} /> Estable
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "warning")
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200 rounded-full px-2 py-0.5">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Aviso
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-full px-2 py-0.5">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Normal
    </span>
  );
}

const MiniTooltip = ({ active, payload, label, unit }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-slate-200 rounded-lg shadow-lg px-2.5 py-1.5">
        <p className="text-xs text-slate-400">{label}</p>
        <p className="text-xs font-bold" style={{ color: payload[0].color }}>
          {payload[0].value} {unit}
        </p>
      </div>
    );
  }
  return null;
};

const sensorMeta = [
  { key: "ph", label: "pH", unit: "", icon: Droplets, color: "text-cyan-600", bg: "bg-cyan-50", border: "border-cyan-100" },
  { key: "temp", label: "Temperatura", unit: "°C", icon: Thermometer, color: "text-orange-500", bg: "bg-orange-50", border: "border-orange-100" },
  { key: "turb", label: "Turbidez", unit: "NTU", icon: Eye, color: "text-purple-500", bg: "bg-purple-50", border: "border-purple-100" },
  { key: "tds", label: "TDS", unit: "ppm", icon: Zap, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
];

export function DashboardPage() {
  const navigate = useNavigate();
  const { addAnalysis, isGenerating, setIsGenerating, analyses } = useAnalysis();

  const handleGenerateAnalysis = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const newAnalysis = {
        id: analyses.length + 1,
        fecha: new Date().toLocaleString("es-ES", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }).replace(",", ""),
        fechaISO: new Date().toISOString().split("T")[0],
        resumen: "Nuevo análisis generado desde Dashboard — Parámetros dentro de rangos normales.",
        estado: "Normal",
        ph: +(6.8 + Math.random() * 0.6).toFixed(1),
        temp: +(22 + Math.random() * 3).toFixed(1),
        turb: +(1.5 + Math.random() * 2).toFixed(1),
        tds: Math.floor(290 + Math.random() * 40),
        tiempo: "43s",
        texto: `Análisis generado desde el Dashboard. Todos los parámetros del agua se encuentran dentro de los rangos aceptables para uso doméstico y consumo seguro.

El pH indica un nivel óptimo para consumo. La temperatura es adecuada. La turbidez refleja agua con buena claridad visual.

Los Sólidos Disueltos Totales indican una mineralización moderada, adecuada para consumo humano.`,
        recomendacion: "Continuar con el monitoreo regular. No se requieren acciones inmediatas.",
        alerta: null,
      };
      addAnalysis(newAnalysis);
      setIsGenerating(false);
      navigate("/analisis-ia");
    }, 7000);
  };

  return (
    <div className="space-y-5" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Modal de generación */}
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

            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">Leyendo sensores</span>
                <Loader2 size={14} className="text-violet-500 animate-spin" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                {sensorMeta.map((s) => (
                  <div key={s.key} className={`rounded-lg ${s.bg} border ${s.border} p-2.5`}>
                    <div className="flex items-center gap-1.5 mb-1">
                      <s.icon size={12} className={s.color} />
                      <span className="text-xs text-slate-600">{s.label}</span>
                    </div>
                    <p className={`text-lg font-bold ${s.color}`} style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                      {s.key === "ph" ? "7.1" : s.key === "temp" ? "23.5" : s.key === "turb" ? "3.4" : "321"}
                      <span className="text-xs font-normal text-slate-400 ml-0.5">{s.unit}</span>
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-violet-50 border border-violet-100 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <Loader2 size={14} className="text-violet-600 animate-spin" />
                <span className="text-xs font-medium text-violet-700">Procesando con IA...</span>
              </div>
              <div className="w-full bg-violet-200 rounded-full h-1.5 overflow-hidden">
                <div className="bg-violet-600 h-full rounded-full animate-pulse" style={{ width: "70%" }}></div>
              </div>
              <p className="text-xs text-violet-600 mt-2">Tiempo estimado: ~7 segundos</p>
            </div>
          </div>
        </div>
      )}

      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <Waves size={18} className="text-cyan-500" />
            <h1 className="text-xl font-bold text-slate-800">Panel de Control</h1>
          </div>
          <p className="text-sm text-slate-500 ml-6.5">Monitoreo en tiempo real · Última lectura hace 28 segundos</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-sm bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-sm">
            <Clock size={13} className="text-cyan-500" />
            <span className="text-slate-600 font-medium" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>
              14:32:05
            </span>
          </div>
        </div>
      </div>

      {/* Alert banner */}
      <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 shadow-sm">
        <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
          <AlertTriangle size={14} className="text-amber-600" />
        </div>
        <div>
          <p className="text-sm font-semibold text-amber-800">Aviso de calidad detectado</p>
          <p className="text-xs text-amber-700 mt-0.5">
            La turbidez (3.4 NTU) está aproximándose al límite máximo recomendado de 4 NTU. Se sugiere revisar el sistema de filtración.
          </p>
        </div>
        <button
          onClick={() => navigate("/analisis-ia")}
          className="ml-auto text-xs font-medium text-amber-600 hover:text-amber-800 flex items-center gap-1 flex-shrink-0"
        >
          Ver análisis <ChevronRight size={12} />
        </button>
      </div>

      {/* Sensor cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {sensorCards.map((sensor) => {
          const pct = Math.min(100, Math.max(0,
            ((sensor.currentNum - sensor.rangeMin) / (sensor.rangeMax - sensor.rangeMin)) * 100
          ));
          return (
            <div
              key={sensor.label}
              className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-9 h-9 rounded-xl ${sensor.light} ${sensor.border} border flex items-center justify-center`}>
                  <sensor.icon size={16} className={sensor.text} />
                </div>
                <StatusBadge status={sensor.status} />
              </div>
              <div className="mb-1">
                <span className="text-3xl font-bold text-slate-800" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  {sensor.value}
                </span>
                <span className="text-sm text-slate-400 ml-1">{sensor.unit}</span>
              </div>
              <p className="text-sm font-medium text-slate-600 mb-0.5">{sensor.label}</p>
              <p className="text-xs text-slate-400 mb-3">{sensor.desc}</p>
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mb-2">
                <div className={`h-full rounded-full ${sensor.bar} transition-all`} style={{ width: `${pct}%` }} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">{sensor.range}</span>
                <TrendBadge trend={sensor.trend} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts grid + Camera */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* 2x2 mini charts */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {miniCharts.map((cfg) => (
            <div key={cfg.key} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm font-semibold text-slate-800">{cfg.label}</p>
                  <p className="text-xs text-slate-400">Últimos 30 min</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: cfg.color }}></span>
                  <span className="text-xs font-semibold" style={{ color: cfg.color, fontFamily: "'JetBrains Mono', monospace" }}>
                    {realtimeData[realtimeData.length - 1][cfg.key as keyof typeof realtimeData[0]]} {cfg.unit}
                  </span>
                </div>
              </div>
              <div className="h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={realtimeData} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
                    <defs>
                      <linearGradient id={`grad-dash-${cfg.key}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={cfg.color} stopOpacity={0.18} />
                        <stop offset="95%" stopColor={cfg.color} stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis
                      dataKey="time"
                      tick={{ fontSize: 9, fill: "#94a3b8" }}
                      axisLine={false}
                      tickLine={false}
                      interval={2}
                    />
                    <YAxis
                      tick={{ fontSize: 9, fill: "#94a3b8" }}
                      axisLine={false}
                      tickLine={false}
                      domain={cfg.domain}
                    />
                    <Tooltip content={<MiniTooltip unit={cfg.unit} />} />
                    {cfg.refLine && (
                      <ReferenceLine
                        y={cfg.refLine}
                        stroke="#f59e0b"
                        strokeDasharray="4 4"
                        strokeWidth={1.5}
                      />
                    )}
                    <Area
                      type="monotone"
                      dataKey={cfg.key}
                      stroke={cfg.color}
                      strokeWidth={2}
                      fill={`url(#grad-dash-${cfg.key})`}
                      dot={false}
                      activeDot={{ r: 3, fill: cfg.color, strokeWidth: 0 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          ))}
        </div>

        {/* Camera feed */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-semibold text-slate-800">Cámara ESP32</h2>
              <p className="text-xs text-slate-400 mt-0.5">Imagen en tiempo real</p>
            </div>
            <span className="flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Live
            </span>
          </div>

          {/* Camera placeholder */}
          <div className="flex-1 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 flex flex-col items-center justify-center gap-3 min-h-[200px] relative overflow-hidden">
            <div className="absolute inset-x-0 h-0.5 bg-cyan-400/40" style={{ animation: "scanline 3s linear infinite" }}></div>
            <div className="w-12 h-12 rounded-full bg-slate-700 border-2 border-slate-600 flex items-center justify-center">
              <Camera size={20} className="text-slate-400" />
            </div>
            <div className="text-center">
              <p className="text-xs font-medium text-slate-300">640 × 480 px</p>
              <p className="text-xs text-slate-500 mt-0.5">Actualización: cada 10 s</p>
            </div>
            {/* Corner brackets */}
            <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-cyan-400/50 rounded-tl"></div>
            <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-cyan-400/50 rounded-tr"></div>
            <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-cyan-400/50 rounded-bl"></div>
            <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-cyan-400/50 rounded-br"></div>
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
            <span>Última captura: 14:32:01</span>
            <span className="text-slate-300">HD · 80%</span>
          </div>
        </div>
      </div>

      {/* AI Analysis summary */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-violet-50 border border-violet-200 flex items-center justify-center">
              <BrainCircuit size={16} className="text-violet-600" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-800">Análisis IA — Resumen Actual</h2>
              <p className="text-xs text-slate-400">Generado hace 2 min · Modelo GPT-4o</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-1">
              <CheckCircle2 size={11} /> Completado
            </span>
            <button
              onClick={() => navigate("/analisis-ia")}
              className="flex items-center gap-1.5 text-xs font-medium text-violet-600 bg-violet-50 border border-violet-200 rounded-lg px-3 py-1.5 hover:bg-violet-100 transition-colors"
            >
              Ver completo <ChevronRight size={11} />
            </button>
          </div>
        </div>

        <div className="bg-gradient-to-r from-violet-50 to-blue-50 rounded-xl p-4 border border-violet-100">
          <p className="text-sm text-slate-700 leading-relaxed">
            El agua analizada presenta <strong>condiciones generalmente aceptables</strong>. El pH de 7.1 se mantiene en rango neutro óptimo, la temperatura de 23.5 °C es adecuada para el uso doméstico. Se detecta que la{" "}
            <span className="font-semibold text-amber-700 bg-amber-100 px-1 rounded">
              turbidez de 3.4 NTU está aproximándose al límite
            </span>
            , lo que puede indicar partículas en suspensión. Los sólidos disueltos totales (321 ppm) están dentro de parámetros normales.{" "}
            <span className="text-slate-500">Se recomienda revisar el sistema de prefiltración.</span>
          </p>
        </div>

        <div className="flex items-center gap-2 mt-3">
          <button 
            onClick={handleGenerateAnalysis}
            disabled={isGenerating}
            className="flex items-center gap-1.5 text-xs font-medium text-white bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg px-3.5 py-2 hover:from-cyan-600 hover:to-blue-700 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <Loader2 size={12} className="animate-spin" />
                Generando...
              </>
            ) : (
              <>
                <BrainCircuit size={12} />
                Generar nuevo análisis
              </>
            )}
          </button>
          <span className="text-xs text-slate-400">Latencia estimada: ~40 s</span>
        </div>
      </div>
    </div>
  );
}