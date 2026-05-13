import { useState, useEffect, useCallback } from "react";
import {
  ScrollText, RefreshCw, AlertTriangle, Info, Loader2,
  CheckCircle2, XCircle, Waves, Filter,
} from "lucide-react";
import { apiFetch } from "../../api/apiClient";

interface LogDTO {
  idLog: number;
  nivel: string;
  modulo: string;
  mensaje: string;
  fechaHora: string | number[];
}

function parseFecha(fecha: string | number[]): Date {
  if (Array.isArray(fecha)) {
    const [y, mo, d, h = 0, mi = 0, s = 0] = fecha;
    return new Date(y, mo - 1, d, h, mi, s);
  }
  return new Date(fecha);
}

function formatFecha(fecha: string | number[]): string {
  const d = parseFecha(fecha);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

const NIVEL_META: Record<string, { icon: React.ComponentType<any>; bg: string; text: string; border: string }> = {
  INFO:  { icon: Info,          bg: "bg-blue-50",   text: "text-blue-700",   border: "border-blue-200"  },
  WARN:  { icon: AlertTriangle, bg: "bg-amber-50",  text: "text-amber-700",  border: "border-amber-200" },
  ERROR: { icon: XCircle,       bg: "bg-red-50",    text: "text-red-700",    border: "border-red-200"   },
  DEBUG: { icon: CheckCircle2,  bg: "bg-slate-50",  text: "text-slate-600",  border: "border-slate-200" },
};

const defaultMeta = { icon: Info, bg: "bg-slate-50", text: "text-slate-600", border: "border-slate-200" };

export function LogsPage() {
  const [logs, setLogs]           = useState<LogDTO[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [nivelFiltro, setNivelFiltro] = useState<string>("TODOS");

  const cargar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<LogDTO[]>("/api/v1/logs");
      setLogs(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al cargar los logs");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const niveles = ["TODOS", "INFO", "WARN", "ERROR", "DEBUG"];
  const logsFiltrados = nivelFiltro === "TODOS"
    ? logs
    : logs.filter((l) => l.nivel.toUpperCase() === nivelFiltro);

  const conteos = logs.reduce<Record<string, number>>((acc, l) => {
    const n = l.nivel.toUpperCase();
    acc[n] = (acc[n] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-5" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <Waves size={18} className="text-cyan-500" />
            <h1 className="text-xl font-bold text-slate-800">Logs del Sistema</h1>
          </div>
          <p className="text-sm text-slate-500 ml-6.5">
            {logs.length > 0 ? `${logs.length} registros recientes` : "Actividad y eventos del servidor"}
          </p>
        </div>
        <button
          onClick={cargar}
          disabled={loading}
          className="flex items-center gap-1.5 text-xs text-slate-600 bg-white border border-slate-200 rounded-lg px-3 py-2 hover:bg-slate-50 shadow-sm disabled:opacity-50"
        >
          <RefreshCw size={12} className={loading ? "animate-spin" : ""} /> Actualizar
        </button>
      </div>

      {/* Resumen de conteos */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {(["INFO", "WARN", "ERROR", "DEBUG"] as const).map((n) => {
          const meta = NIVEL_META[n] ?? defaultMeta;
          const Icon = meta.icon;
          return (
            <div key={n} className={`bg-white rounded-xl border ${meta.border} p-3 flex items-center gap-3`}>
              <div className={`w-8 h-8 rounded-lg ${meta.bg} flex items-center justify-center flex-shrink-0`}>
                <Icon size={15} className={meta.text} />
              </div>
              <div>
                <p className="text-xs text-slate-500">{n}</p>
                <p className="text-xl font-bold text-slate-800" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  {conteos[n] ?? 0}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filtro por nivel */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-slate-400" />
            <span className="text-sm font-semibold text-slate-700">Filtrar por nivel</span>
          </div>
          {niveles.map((n) => (
            <button
              key={n}
              onClick={() => setNivelFiltro(n)}
              className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors ${
                nivelFiltro === n
                  ? "bg-cyan-500 text-white border-cyan-500 shadow-sm"
                  : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100"
              }`}
            >
              {n} {n !== "TODOS" && conteos[n] ? `(${conteos[n]})` : ""}
            </button>
          ))}
          <span className="ml-auto text-xs text-slate-400">{logsFiltrados.length} registros</span>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <XCircle size={16} className="text-red-500" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Lista de logs */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
          <ScrollText size={15} className="text-slate-400" />
          <h2 className="text-sm font-semibold text-slate-800">Registros recientes</h2>
          <span className="ml-auto text-xs text-slate-400 bg-slate-100 rounded-full px-2.5 py-1">
            Últimos 100
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 gap-2">
            <Loader2 size={20} className="text-cyan-500 animate-spin" />
            <span className="text-sm text-slate-400">Cargando logs...</span>
          </div>
        ) : logsFiltrados.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2 text-slate-400">
            <ScrollText size={28} className="opacity-30" />
            <p className="text-sm">No hay logs para el filtro seleccionado</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {logsFiltrados.map((log) => {
              const meta = NIVEL_META[log.nivel.toUpperCase()] ?? defaultMeta;
              const Icon = meta.icon;
              return (
                <div key={log.idLog} className="px-5 py-3 hover:bg-slate-50 transition-colors flex items-start gap-3">
                  <div className={`mt-0.5 w-6 h-6 rounded-md ${meta.bg} flex items-center justify-center flex-shrink-0`}>
                    <Icon size={12} className={meta.text} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <span className={`text-xs font-semibold px-1.5 py-0.5 rounded border ${meta.bg} ${meta.text} ${meta.border}`}>
                        {log.nivel.toUpperCase()}
                      </span>
                      <span className="text-xs font-medium text-slate-600 bg-slate-100 rounded px-1.5 py-0.5">
                        {log.modulo}
                      </span>
                      <span className="text-xs text-slate-400 ml-auto" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                        {formatFecha(log.fechaHora)}
                      </span>
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed">{log.mensaje}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
