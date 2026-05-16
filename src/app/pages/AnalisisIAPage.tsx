import {
  BrainCircuit, Calendar, Filter, AlertTriangle, CheckCircle2,
  Clock, MessageSquare, Sparkles, Droplets, Thermometer, Eye, Zap,
  Waves, Info, Loader2,
} from "lucide-react";
import { useState, useMemo } from "react";
import { useAnalysis, type AnalisisEnriquecido } from "../contexts/AnalysisContext";
import { PageStateGuard } from "../components/PageStateGuard";
import { isoToday } from "../../lib/fechas";
import { StatusBadge } from "../components/shared/StatusBadge";
import { PageHeader } from "../components/shared/PageHeader";

// FIX E: tipado correcto de sensorMeta.
// Las keys coinciden exactamente con los campos de AnalisisEnriquecido,
// eliminando los dos `as any` que había en el componente.
type SensorKey = "ph" | "temp" | "turb" | "tds";

const sensorMeta: {
  key: SensorKey;
  label: string;
  unit: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: string;
  bg: string;
  border: string;
}[] = [
  { key: "ph",   label: "pH",          unit: "",    icon: Droplets,    color: "text-cyan-600",   bg: "bg-cyan-50",   border: "border-cyan-100"   },
  { key: "temp", label: "Temperatura", unit: "°C",  icon: Thermometer, color: "text-orange-500", bg: "bg-orange-50", border: "border-orange-100" },
  { key: "turb", label: "Turbidez",    unit: "NTU", icon: Eye,         color: "text-purple-500", bg: "bg-purple-50", border: "border-purple-100" },
  { key: "tds",  label: "TDS",         unit: "ppm", icon: Zap,         color: "text-emerald-600",bg: "bg-emerald-50",border: "border-emerald-100" },
];

export function AnalisisIAPage() {
  // FIX A: una sola llamada a useAnalysis extrayendo todo lo necesario,
  // incluido errorInit que antes requería una segunda llamada al hook.
  const {
    analyses, isGenerating, generarNuevoAnalisis,
    loadingInit, errorInit, lecturaConImagen,
  } = useAnalysis();

  const [selectedId, setSelectedId]           = useState<number | null>(analyses[0]?.id ?? null);
  const [fromDate, setFromDate]               = useState(isoToday());
  const [toDate, setToDate]                   = useState(isoToday());
  // Rango activo — solo se actualiza al pulsar "Filtrar", no en cada keystroke
  const [activeRange, setActiveRange]         = useState<[string, string] | null>(null);

  // FIX useMemo: antes filteredAnalyses era un useState sincronizado manualmente
  // con useEffect, lo que causaba un render extra y riesgo de desincronización.
  // useMemo es la herramienta correcta para valores derivados de otro estado.
  const filteredAnalyses = useMemo(() => {
    if (!activeRange) return analyses; // sin filtro activo → mostrar todos
    const [from, to] = activeRange.map((s) => new Date(s));
    return analyses.filter((a) => {
      const [datePart, timePart] = a.fecha.split(" ");
      const [dd, mm, yyyy] = datePart.split("/");
      const [hh, mi] = (timePart ?? "00:00").split(":");
      const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd), Number(hh), Number(mi));
      return d >= from && d <= to;
    });
  }, [analyses, activeRange]);

  // Cuando llega un nuevo análisis, seleccionarlo automáticamente
  const latestId = analyses[0]?.id ?? null;
  if (latestId !== null && latestId !== selectedId && !activeRange) {
    setSelectedId(latestId);
  }

  const selected: AnalisisEnriquecido | undefined =
    filteredAnalyses.find((a) => a.id === selectedId) ?? filteredAnalyses[0];

  const handleFilter = () => {
    // Actualizar el rango activo dispara useMemo → filteredAnalyses se recalcula
    setActiveRange([`${fromDate}T00:00:00`, `${toDate}T23:59:59`]);
  };

  const handleGenerateAnalysis = async () => {
    await generarNuevoAnalisis();
    // El useEffect detectará el nuevo análisis en `analyses` y actualizará selectedId.
  };

  const guardEl = <PageStateGuard loadingInit={loadingInit} errorInit={errorInit} loadingText="Cargando análisis..." />;
  if (loadingInit || errorInit) return guardEl;

  return (
    <div className="space-y-5">

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
                <p className="text-xs text-slate-500">Procesando datos de sensores e imagen...</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {sensorMeta.map((s) => (
                <div key={s.key} className={`rounded-lg ${s.bg} border ${s.border} p-2.5`}>
                  <div className="flex items-center gap-1.5 mb-1">
                    <s.icon size={12} className={s.color} />
                    <span className="text-xs text-slate-600">{s.label}</span>
                  </div>
                  {/* FIX E: acceso tipado, sin `as any` */}
                  <p className={`text-lg font-bold ${s.color}`} style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                    {selected ? (selected[s.key] ?? "—") : "—"}
                    <span className="text-xs font-normal text-slate-400 ml-0.5">{s.unit}</span>
                  </p>
                </div>
              ))}
            </div>
            <div className="bg-violet-50 border border-violet-100 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <Loader2 size={14} className="text-violet-600 animate-spin" />
                <span className="text-xs font-medium text-violet-700">Procesando con Gemini Flash Lite...</span>
              </div>
              <div className="w-full bg-violet-200 rounded-full h-1.5 overflow-hidden">
                <div className="bg-violet-600 h-full rounded-full animate-pulse" style={{ width: "70%" }}></div>
              </div>
              <p className="text-xs text-violet-600 mt-2">Tiempo estimado: ~40–60 segundos</p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <PageHeader
        title="Análisis de Inteligencia Artificial"
        subtitle="Interpretación cualitativa de la calidad del agua"
        actions={
          <div className="flex items-center gap-1.5 text-xs text-violet-700 bg-violet-50 border border-violet-200 rounded-full px-3 py-1.5">
            <Sparkles size={12} />
            <span className="font-medium">Gemini Flash Lite · Latencia máx: ~60 s</span>
          </div>
        }
      />

      {/* Filter */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Calendar size={15} className="text-slate-400" />
            <span className="text-sm font-semibold text-slate-700">Filtrar análisis por fecha</span>
          </div>
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5">
            <label className="text-xs text-slate-500">Desde</label>
            <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)}
              className="text-xs text-slate-700 bg-transparent border-none outline-none" />
          </div>
          <span className="text-slate-400 text-sm">→</span>
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5">
            <label className="text-xs text-slate-500">Hasta</label>
            <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)}
              className="text-xs text-slate-700 bg-transparent border-none outline-none" />
          </div>
          <button onClick={handleFilter}
            className="flex items-center gap-1.5 text-xs font-semibold text-white bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg px-4 py-1.5 hover:from-cyan-600 hover:to-blue-700 transition-all shadow-sm">
            <Filter size={12} /> Filtrar
          </button>
          <span className="text-xs text-slate-500 ml-auto">{filteredAnalyses.length} análisis encontrados</span>
        </div>
      </div>

      {/* Main layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Left: lista */}
        <div className="lg:col-span-1 space-y-3">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-800">Análisis disponibles</h2>
              <span className="text-xs text-slate-400 bg-slate-100 rounded-full px-2 py-0.5">{analyses.length}</span>
            </div>
            <div className="p-3 space-y-2 max-h-[400px] overflow-y-auto">
              {filteredAnalyses.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">No hay análisis en el período seleccionado</p>
              ) : filteredAnalyses.map((a) => (
                <button key={a.id} onClick={() => setSelectedId(a.id)}
                  className={`w-full text-left rounded-xl p-3 transition-all border ${selectedId === a.id ? "bg-gradient-to-r from-violet-50 to-blue-50 border-violet-200" : "bg-slate-50 border-transparent hover:bg-slate-100"}`}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={11} className="text-slate-400" />
                      <span className="text-xs font-medium text-slate-600">{a.fecha}</span>
                    </div>
                    <StatusBadge status={a.estado === "Aviso" ? "warning" : "normal"} />
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">{a.resumen}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="flex items-center gap-1 text-xs text-slate-400"><Clock size={9} /> {a.tiempo}</span>
                    <span className="flex items-center gap-1 text-xs text-slate-400"><BrainCircuit size={9} /> IA procesada</span>
                  </div>
                </button>
              ))}
            </div>

            <div className="p-3 border-t border-slate-100">
              <button
                onClick={handleGenerateAnalysis}
                disabled={isGenerating || !lecturaConImagen}
                title={!lecturaConImagen ? "La lectura actual no tiene imagen asociada" : ""}
                className="w-full flex items-center justify-center gap-2 text-xs font-semibold text-white bg-gradient-to-r from-violet-500 to-blue-600 rounded-xl py-2.5 hover:from-violet-600 hover:to-blue-700 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
                {isGenerating
                  ? <><Loader2 size={13} className="animate-spin" /> Generando...</>
                  : <><BrainCircuit size={13} /> Generar nuevo análisis</>}
              </button>
              {!lecturaConImagen && (
                <p className="text-xs text-amber-600 text-center mt-2">Requiere imagen de la cámara ESP32</p>
              )}
              <p className="text-xs text-slate-400 text-center mt-1">Procesamiento: ~40–60 segundos · Gemini Flash Lite</p>
            </div>
          </div>
        </div>

        {/* Right: detalle */}
        <div className="lg:col-span-2 space-y-4">
          {!selected ? (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-10 text-center text-sm text-slate-400">
              No hay análisis para mostrar en el período seleccionado.
            </div>
          ) : (
            <>
              {/* Valores de sensores */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-sm font-semibold text-slate-800">Parámetros del análisis</h2>
                    <p className="text-xs text-slate-400 mt-0.5">Valores registrados al momento del análisis</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1">
                      <Calendar size={10} /> {selected.fecha}
                    </span>
                    <span className="flex items-center gap-1 text-xs font-medium text-slate-500 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1">
                      <Clock size={10} /> {selected.tiempo}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {sensorMeta.map((s) => {
                    // FIX E: acceso tipado, sin `as any`
                    const val = selected[s.key];
                    return (
                      <div key={s.key} className={`rounded-xl ${s.bg} border ${s.border} p-3 text-center`}>
                        <div className="flex items-center justify-center mb-2">
                          <s.icon size={16} className={s.color} />
                        </div>
                        <p className="text-xs text-slate-500 mb-0.5">{s.label}</p>
                        <p className={`text-2xl font-bold ${s.color}`} style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                          {val || "—"}<span className="text-xs font-normal text-slate-400 ml-0.5">{s.unit}</span>
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Texto IA */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-violet-50 border border-violet-200 flex items-center justify-center">
                    <BrainCircuit size={16} className="text-violet-600" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-slate-800">Análisis generado por IA</h2>
                    <p className="text-xs text-slate-400">Interpretación en lenguaje natural · Gemini Flash Lite</p>
                  </div>
                  <span className="ml-auto"><StatusBadge status={selected.estado === "Normal" ? "normal" : "warning"} /></span>
                </div>

                <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl p-4 border border-slate-100">
                  <div className="flex items-start gap-2.5">
                    <MessageSquare size={15} className="text-violet-400 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{selected.texto}</p>
                  </div>
                </div>

                <div className="mt-4 flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-xl p-3.5">
                  <Info size={15} className="text-blue-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-blue-800 mb-0.5">Recomendación</p>
                    <p className="text-xs text-blue-700 leading-relaxed">{selected.recomendacion}</p>
                  </div>
                </div>

                {selected.alerta && (
                  <div className="mt-3 flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-3.5">
                    <AlertTriangle size={15} className="text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-amber-800 mb-0.5">Parámetro fuera de rango óptimo</p>
                      <p className="text-xs text-amber-700">
                        <strong>{selected.alerta.param}:</strong> {selected.alerta.valor} — Límite: {selected.alerta.limite}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-1.5 mt-4 pt-4 border-t border-slate-100 text-xs text-slate-400">
                  <CheckCircle2 size={11} className="text-emerald-500" />
                  Generado en {selected.tiempo}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
