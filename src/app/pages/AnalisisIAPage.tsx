import {
  BrainCircuit, Calendar, Filter, AlertTriangle, CheckCircle2,
  Clock, MessageSquare, Sparkles, Droplets, Thermometer, Eye, Zap,
  Waves, Info, Loader2,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useAnalysis } from "../contexts/AnalysisContext";

const sensorMeta = [
  { key: "ph",   label: "pH",          unit: "",    icon: Droplets,    color: "text-cyan-600",   bg: "bg-cyan-50",   border: "border-cyan-100" },
  { key: "temp", label: "Temperatura", unit: "°C",  icon: Thermometer, color: "text-orange-500", bg: "bg-orange-50", border: "border-orange-100" },
  { key: "turb", label: "Turbidez",    unit: "NTU", icon: Eye,         color: "text-purple-500", bg: "bg-purple-50", border: "border-purple-100" },
  { key: "tds",  label: "TDS",         unit: "ppm", icon: Zap,         color: "text-emerald-600",bg: "bg-emerald-50",border: "border-emerald-100" },
];

function isoToday(): string {
  return new Date().toISOString().split("T")[0];
}

export function AnalisisIAPage() {
  const { analyses, isGenerating, generarNuevoAnalisis, loadingInit, lecturaConImagen } = useAnalysis();

  // FIX #9: selectedId sincronizado con el análisis más reciente
  const [selectedId, setSelectedId] = useState<number | null>(analyses[0]?.id ?? null);

  // FIX #8: fechas iniciales al día de hoy, no hardcodeadas
  const [fromDate, setFromDate] = useState(isoToday());
  const [toDate, setToDate]     = useState(isoToday());
  const [filteredAnalyses, setFilteredAnalyses] = useState(analyses);

  // Sincronizar filteredAnalyses cuando cambia analyses (e.g. tras generar nuevo)
  useEffect(() => {
    setFilteredAnalyses(analyses);
    // FIX #9: si se acaba de agregar un análisis nuevo, seleccionarlo automáticamente
    if (analyses.length > 0 && selectedId !== analyses[0].id) {
      setSelectedId(analyses[0].id);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [analyses]);

  const selected = filteredAnalyses.find((a) => a.id === selectedId) ?? filteredAnalyses[0];

  const handleFilter = () => {
    const from = new Date(`${fromDate}T00:00:00`);
    const to   = new Date(`${toDate}T23:59:59`);
    const filtered = analyses.filter((a) => {
      const d = new Date(a.fechaISO);
      return d >= from && d <= to;
    });
    setFilteredAnalyses(filtered);
    if (filtered.length > 0) setSelectedId(filtered[0].id);
  };

  // FIX #4 / #9: NO llamar setIsGenerating — solo llamar generarNuevoAnalisis
  // El useEffect de arriba detectará el nuevo análisis y actualizará selectedId
  const handleGenerateAnalysis = async () => {
    await generarNuevoAnalisis();
  };

  if (loadingInit)
    return <div className="flex items-center justify-center min-h-64"><Loader2 size={24} className="text-cyan-500 animate-spin" /><span className="ml-2 text-sm text-slate-500">Cargando análisis...</span></div>;

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
                  <p className={`text-lg font-bold ${s.color}`} style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                    {selected ? (selected as any)[s.key] || "—" : "—"}
                    <span className="text-xs font-normal text-slate-400 ml-0.5">{s.unit}</span>
                  </p>
                </div>
              ))}
            </div>
            <div className="bg-violet-50 border border-violet-100 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <Loader2 size={14} className="text-violet-600 animate-spin" />
                {/* FIX #8: nombre correcto del modelo */}
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <Waves size={18} className="text-cyan-500" />
            <h1 className="text-xl font-bold text-slate-800">Análisis de Inteligencia Artificial</h1>
          </div>
          <p className="text-sm text-slate-500 ml-6.5">Interpretación cualitativa de la calidad del agua</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-violet-700 bg-violet-50 border border-violet-200 rounded-full px-3 py-1.5">
          <Sparkles size={12} />
          {/* FIX #8 */}
          <span className="font-medium">Gemini Flash Lite · Latencia máx: ~60 s</span>
        </div>
      </div>

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

        {/* Left: list */}
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
                    {a.estado === "Aviso"
                      ? <span className="inline-flex items-center gap-1 text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200 rounded-full px-2 py-0.5"><span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Aviso</span>
                      : <span className="inline-flex items-center gap-1 text-xs font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-full px-2 py-0.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Normal</span>
                    }
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
              {/* FIX #7 #8 #9: botón con estado correcto y modelo correcto */}
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

        {/* Right: detail */}
        <div className="lg:col-span-2 space-y-4">
          {!selected ? (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-10 text-center text-sm text-slate-400">
              No hay análisis para mostrar en el período seleccionado.
            </div>
          ) : (
            <>
              {/* Sensor values */}
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
                    const val = (selected as any)[s.key] as number;
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

              {/* AI text */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-violet-50 border border-violet-200 flex items-center justify-center">
                    <BrainCircuit size={16} className="text-violet-600" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-slate-800">Análisis generado por IA</h2>
                    {/* FIX #8 */}
                    <p className="text-xs text-slate-400">Interpretación en lenguaje natural · Gemini Flash Lite</p>
                  </div>
                  {selected.estado === "Normal"
                    ? <span className="ml-auto flex items-center gap-1 text-xs font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-full px-2.5 py-1"><CheckCircle2 size={11} /> Sin alertas</span>
                    : <span className="ml-auto flex items-center gap-1 text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200 rounded-full px-2.5 py-1"><AlertTriangle size={11} /> Aviso detectado</span>
                  }
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
