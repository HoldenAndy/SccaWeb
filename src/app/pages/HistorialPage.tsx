import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import {
  Download,
  Filter,
  Droplets,
  Thermometer,
  Eye,
  Zap,
  ChevronLeft,
  ChevronRight,
  Waves,
  TrendingUp,
  TrendingDown,
  Calendar,
} from "lucide-react";
import { useState } from "react";

// Generate mock historical data
const generateData = (points: number) => {
  const data = [];
  const base = new Date("2026-03-25T00:00:00");
  for (let i = 0; i < points; i++) {
    const d = new Date(base.getTime() + i * 4 * 60 * 60 * 1000);
    const day = d.getDate();
    const hour = d.getHours();
    data.push({
      fecha: `${day}/04 ${String(hour).padStart(2, "0")}:00`,
      ph: +(6.85 + Math.sin(i * 0.3) * 0.35 + Math.random() * 0.15).toFixed(2),
      temperatura: +(22 + Math.sin(i * 0.2) * 2.5 + Math.random() * 1).toFixed(1),
      turbidez: +(2.0 + Math.sin(i * 0.4 + 1) * 1.2 + Math.random() * 0.4).toFixed(2),
      tds: Math.floor(295 + Math.sin(i * 0.25) * 30 + Math.random() * 15),
    });
  }
  return data;
};

const histData = generateData(42);

const tableData = [
  { fecha: "01/04/2026 14:30", ph: 7.10, temp: 23.5, turb: 3.4, tds: 321 },
  { fecha: "01/04/2026 14:00", ph: 6.20, temp: 23.2, turb: 4.5, tds: 318 },
  { fecha: "01/04/2026 13:30", ph: 5.70, temp: 34.0, turb: 6.8, tds: 540 },
  { fecha: "01/04/2026 13:00", ph: 7.20, temp: 24.1, turb: 2.5, tds: 312 },
  { fecha: "01/04/2026 12:30", ph: 8.60, temp: 31.2, turb: 2.2, tds: 308 },
  { fecha: "01/04/2026 12:00", ph: 7.30, temp: 25.0, turb: 2.0, tds: 298 },
  { fecha: "01/04/2026 11:30", ph: 9.20, temp: 24.8, turb: 1.8, tds: 640 },
  { fecha: "01/04/2026 11:00", ph: 7.18, temp: 24.2, turb: 2.1, tds: 310 },
];

// Returns 'normal' | 'warning' | 'critical'
function phLevel(v: number) {
  if (v >= 6.5 && v <= 8.5) return "normal";
  if ((v >= 6.0 && v < 6.5) || (v > 8.5 && v <= 9.0)) return "warning";
  return "critical";
}
function tempLevel(v: number) {
  if (v >= 15 && v <= 30) return "normal";
  if ((v >= 12 && v < 15) || (v > 30 && v <= 33)) return "warning";
  return "critical";
}
function turbLevel(v: number) {
  if (v <= 4) return "normal";
  if (v <= 6) return "warning";
  return "critical";
}
function tdsLevel(v: number) {
  if (v <= 500) return "normal";
  if (v <= 600) return "warning";
  return "critical";
}

function getOverallStatus(ph: number, temp: number, turb: number, tds: number) {
  const levels = [phLevel(ph), tempLevel(temp), turbLevel(turb), tdsLevel(tds)];
  if (levels.includes("critical")) return "Crítico";
  if (levels.includes("warning")) return "Aviso";
  return "Normal";
}

function ValueCell({ value, level, unit }: { value: number; level: "normal" | "warning" | "critical"; unit?: string }) {
  const styles = {
    normal:   { text: "text-emerald-600", bg: "bg-emerald-50",  border: "border-emerald-200" },
    warning:  { text: "text-amber-600",   bg: "bg-amber-50",    border: "border-amber-200"   },
    critical: { text: "text-red-600",     bg: "bg-red-50",      border: "border-red-200"     },
  };
  const s = styles[level];
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-sm font-semibold px-2 py-0.5 rounded-lg border ${s.text} ${s.bg} ${s.border}`}
      style={{ fontFamily: "'JetBrains Mono', monospace" }}
    >
      {value}{unit && <span className="text-xs font-normal opacity-70 ml-0.5">{unit}</span>}
    </span>
  );
}

const CustomTooltip = ({ active, payload, label, unit }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl shadow-lg px-3 py-2">
        <p className="text-xs font-semibold text-slate-500 mb-1">{label}</p>
        <p className="text-sm font-bold" style={{ color: payload[0].color }}>
          {payload[0].value} {unit}
        </p>
      </div>
    );
  }
  return null;
};

const chartConfigs = [
  {
    key: "ph",
    label: "pH",
    unit: "",
    icon: Droplets,
    color: "#06b6d4",
    gradient: ["#06b6d4", "#0891b2"],
    fill: "#e0f9ff",
    refLine: 7.0,
    refLabel: "Neutro",
    min: 6.5,
    max: 8.5,
    stat: { min: 6.88, max: 7.45, avg: 7.16 },
  },
  {
    key: "temperatura",
    label: "Temperatura",
    unit: "°C",
    icon: Thermometer,
    color: "#f97316",
    gradient: ["#f97316", "#ea580c"],
    fill: "#fff7ed",
    refLine: undefined,
    refLabel: undefined,
    min: 15,
    max: 30,
    stat: { min: 20.8, max: 25.4, avg: 23.1 },
  },
  {
    key: "turbidez",
    label: "Turbidez",
    unit: "NTU",
    icon: Eye,
    color: "#a855f7",
    gradient: ["#a855f7", "#9333ea"],
    fill: "#faf5ff",
    refLine: 4.0,
    refLabel: "Límite máx.",
    min: 0,
    max: 5,
    stat: { min: 1.2, max: 3.8, avg: 2.5 },
  },
  {
    key: "tds",
    label: "TDS",
    unit: "ppm",
    icon: Zap,
    color: "#10b981",
    gradient: ["#10b981", "#059669"],
    fill: "#ecfdf5",
    refLine: 500,
    refLabel: "Límite",
    min: 0,
    max: 500,
    stat: { min: 290, max: 338, avg: 312 },
  },
];

export function HistorialPage() {
  const [fromDate, setFromDate] = useState("2026-04-01");
  const [toDate, setToDate] = useState("2026-04-01");
  const [activeParams, setActiveParams] = useState(["ph", "temperatura", "turbidez", "tds"]);
  const [page, setPage] = useState(1);
  const [filterMode, setFilterMode] = useState("Hoy");
  const [customDatesEnabled, setCustomDatesEnabled] = useState(false);
  const [filteredTableData, setFilteredTableData] = useState(tableData);
  const totalPages = 12;
  const itemsPerPage = 8;

  const toggleParam = (key: string) => {
    setActiveParams((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleFilterModeChange = (mode: string) => {
    setFilterMode(mode);
    setCustomDatesEnabled(mode === "Personalizado");
  };

  const handleFilter = () => {
    const from = new Date(fromDate);
    from.setHours(0, 0, 0, 0);
    const to = new Date(toDate);
    to.setHours(23, 59, 59, 999);

    const filtered = tableData.filter((row) => {
      // Parsear fecha "01/04/2026 14:30"
      const [datePart, timePart] = row.fecha.split(" ");
      const [day, month, year] = datePart.split("/").map(Number);
      const rowDate = new Date(year, month - 1, day);
      return rowDate >= from && rowDate <= to;
    });
    setFilteredTableData(filtered);
    setPage(1);
  };

  const paginatedData = filteredTableData.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  return (
    <div className="space-y-5" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <Waves size={18} className="text-cyan-500" />
            <h1 className="text-xl font-bold text-slate-800">Historial de Datos</h1>
          </div>
          <p className="text-sm text-slate-500 ml-6.5">Evolución histórica de los 4 parámetros · 72 registros</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 text-sm text-slate-600 bg-white border border-slate-200 rounded-lg px-3 py-2 hover:bg-slate-50 transition-colors shadow-sm">
            <Download size={13} /> Exportar CSV
          </button>
          <button className="flex items-center gap-1.5 text-sm text-slate-600 bg-white border border-slate-200 rounded-lg px-3 py-2 hover:bg-slate-50 transition-colors shadow-sm">
            <Download size={13} /> Exportar PDF
          </button>
        </div>
      </div>

      {/* Filter bar */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Calendar size={15} className="text-slate-400" />
            <span className="text-sm font-semibold text-slate-700">Rango de fechas</span>
          </div>

          {/* Quick presets */}
          <div className="flex items-center gap-1.5 ml-1">
            {["Hoy", "7 días", "30 días", "Personalizado"].map((opt) => (
              <button
                key={opt}
                onClick={() => handleFilterModeChange(opt)}
                className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors border ${
                  filterMode === opt
                    ? "bg-cyan-500 text-white border-cyan-500 shadow-sm"
                    : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className={`flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 ${!customDatesEnabled ? 'opacity-50' : ''}`}>
              <label className="text-xs text-slate-500">Desde</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                disabled={!customDatesEnabled}
                className="text-xs text-slate-700 bg-transparent border-none outline-none disabled:cursor-not-allowed"
              />
            </div>
            <span className="text-slate-400 text-sm">→</span>
            <div className={`flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 ${!customDatesEnabled ? 'opacity-50' : ''}`}>
              <label className="text-xs text-slate-500">Hasta</label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                disabled={!customDatesEnabled}
                className="text-xs text-slate-700 bg-transparent border-none outline-none disabled:cursor-not-allowed"
              />
            </div>
            <button 
              onClick={handleFilter}
              disabled={!customDatesEnabled}
              className="flex items-center gap-1.5 text-xs font-semibold text-white bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg px-4 py-1.5 hover:from-cyan-600 hover:to-blue-700 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Filter size={12} /> Aplicar
            </button>
          </div>

          {/* Parameter toggles */}
          <div className="flex items-center gap-1.5 ml-auto flex-wrap">
            {chartConfigs.map((c) => (
              <button
                key={c.key}
                onClick={() => toggleParam(c.key)}
                className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg border transition-all ${
                  activeParams.includes(c.key)
                    ? "border-transparent text-white shadow-sm"
                    : "bg-slate-50 border-slate-200 text-slate-400"
                }`}
                style={
                  activeParams.includes(c.key)
                    ? { backgroundColor: c.color }
                    : {}
                }
              >
                <c.icon size={11} />
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Charts grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {chartConfigs
          .filter((c) => activeParams.includes(c.key))
          .map((cfg) => (
            <div key={cfg.key} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
              {/* Chart header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: cfg.fill }}
                  >
                    <cfg.icon size={15} style={{ color: cfg.color }} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{cfg.label}</p>
                    <p className="text-xs text-slate-400">Rango: {cfg.min} – {cfg.max} {cfg.unit}</p>
                  </div>
                </div>
                {/* Stats */}
                <div className="hidden sm:flex items-center gap-3 text-xs text-slate-500">
                  <div className="text-center">
                    <p className="text-slate-400">Mín</p>
                    <p className="font-semibold text-slate-700" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                      {cfg.stat.min}
                    </p>
                  </div>
                  <div className="w-px h-6 bg-slate-100"></div>
                  <div className="text-center">
                    <p className="text-slate-400">Máx</p>
                    <p className="font-semibold text-slate-700" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                      {cfg.stat.max}
                    </p>
                  </div>
                  <div className="w-px h-6 bg-slate-100"></div>
                  <div className="text-center">
                    <p className="text-slate-400">Prom</p>
                    <p className="font-semibold text-slate-700" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                      {cfg.stat.avg}
                    </p>
                  </div>
                </div>
              </div>

              {/* Chart */}
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={histData} margin={{ top: 5, right: 5, left: -22, bottom: 0 }}>
                    <defs>
                      <linearGradient id={`grad-${cfg.key}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={cfg.color} stopOpacity={0.2} />
                        <stop offset="95%" stopColor={cfg.color} stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis
                      dataKey="fecha"
                      tick={{ fontSize: 9, fill: "#94a3b8" }}
                      interval={6}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 9, fill: "#94a3b8" }}
                      axisLine={false}
                      tickLine={false}
                      domain={[cfg.min, cfg.max]}
                    />
                    <Tooltip content={<CustomTooltip unit={cfg.unit} />} />
                    {cfg.refLine && (
                      <ReferenceLine
                        y={cfg.refLine}
                        stroke="#f59e0b"
                        strokeDasharray="4 4"
                        strokeWidth={1.5}
                        label={{ value: cfg.refLabel, fontSize: 9, fill: "#f59e0b", position: "insideTopRight" }}
                      />
                    )}
                    <Area
                      type="monotone"
                      dataKey={cfg.key}
                      stroke={cfg.color}
                      strokeWidth={2}
                      fill={`url(#grad-${cfg.key})`}
                      dot={false}
                      activeDot={{ r: 4, fill: cfg.color, strokeWidth: 0 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Trend note */}
              <div className="flex items-center gap-1.5 mt-2">
                <TrendingUp size={12} style={{ color: cfg.color }} />
                <span className="text-xs text-slate-400">Tendencia del período seleccionado</span>
              </div>
            </div>
          ))}
      </div>

      {/* Data table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-800">Registros Históricos</h2>
            <p className="text-xs text-slate-400 mt-0.5">Mostrando 1–8 de 72 registros</p>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-500">Ordenar por:</span>
            <select className="text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 outline-none">
              <option>Fecha (reciente)</option>
              <option>Fecha (antiguo)</option>
              <option>pH</option>
              <option>Turbidez</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                {["Fecha / Hora", "pH", "Temp. (°C)", "Turbidez (NTU)", "TDS (ppm)", "Estado"].map((h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {paginatedData.map((row, i) => {
                const ph   = phLevel(row.ph);
                const temp = tempLevel(row.temp);
                const turb = turbLevel(row.turb);
                const tds  = tdsLevel(row.tds);
                const status = getOverallStatus(row.ph, row.temp, row.turb, row.tds);
                return (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-xs text-slate-600" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                      {row.fecha}
                    </td>
                    <td className="px-4 py-3">
                      <ValueCell value={row.ph} level={ph} />
                    </td>
                    <td className="px-4 py-3">
                      <ValueCell value={row.temp} level={temp} unit="°C" />
                    </td>
                    <td className="px-4 py-3">
                      <ValueCell value={row.turb} level={turb} unit="NTU" />
                    </td>
                    <td className="px-4 py-3">
                      <ValueCell value={row.tds} level={tds} unit="ppm" />
                    </td>
                    <td className="px-4 py-3">
                      {status === "Crítico" ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold bg-red-100 text-red-700 border border-red-200 rounded-full px-2.5 py-0.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> Crítico
                        </span>
                      ) : status === "Aviso" ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200 rounded-full px-2.5 py-0.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Aviso
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-full px-2.5 py-0.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Normal
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-500">Página {page} de {totalPages}</span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors text-slate-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={13} />
            </button>
            {[...Array(Math.min(3, totalPages))].map((_, i) => {
              const pageNum = i + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-medium transition-colors ${
                    page === pageNum
                      ? "bg-cyan-500 text-white border border-cyan-500"
                      : "border border-slate-200 text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            {totalPages > 3 && (
              <>
                <span className="text-slate-400 text-xs px-1">...</span>
                <button
                  onClick={() => setPage(totalPages)}
                  className={`w-7 h-7 flex items-center justify-center rounded-lg border text-xs font-medium transition-colors ${
                    page === totalPages
                      ? "bg-cyan-500 text-white border-cyan-500"
                      : "border-slate-200 text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  {totalPages}
                </button>
              </>
            )}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors text-slate-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}