import {
  AlertTriangle,
  Clock, RefreshCw, Cpu, ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router";
import { useState, useEffect, useMemo } from "react";
import { useAnalysis } from "../contexts/AnalysisContext";
import { PageStateGuard } from "../components/PageStateGuard";
import { parseFechaBackend, formatHora } from "../../lib/fechas";
import { useDatosGraficos } from "../hooks/useDatosGraficos";
import { evaluarParametro, PARAMETROS_CALIDAD, type ParametroKey } from "../../domain/calidadAgua";
import { calcularTendencia } from "../../lib/tendencias";
import { PageHeader } from "../components/shared/PageHeader";
import { SensorCard } from "../components/shared/SensorCard";
import { MiniChart } from "../components/shared/MiniChart";
import { CameraPanel } from "../components/shared/CameraPanel";
import { AnalysisSummary } from "../components/shared/AnalysisSummary";
import { GenerationModal } from "../components/shared/GenerationModal";
import { sensorMeta } from "../../lib/sensorConfig";

const miniCharts = [
  { key: "ph" as ParametroKey, label: "pH", unit: "", color: "#06b6d4", domain: [6.4, 7.6] as [number, number], refLine: undefined as number | undefined },
  { key: "temperatura" as ParametroKey, label: "Temperatura", unit: "°C", color: "#f97316", domain: [15, 35] as [number, number], refLine: undefined as number | undefined },
  { key: "turbidez" as ParametroKey, label: "Turbidez", unit: "NTU", color: "#a855f7", domain: [0, 5] as [number, number], refLine: PARAMETROS_CALIDAD.turbidez.normalMax },
  { key: "tds" as ParametroKey, label: "TDS", unit: "ppm", color: "#10b981", domain: [0, 600] as [number, number], refLine: undefined as number | undefined },
];

export function DashboardPage() {
  const navigate = useNavigate();
  const {
    ultimaLectura, idNodoActivo, nodos, isGenerating,
    analyses, loadingInit, errorInit,
    generarNuevoAnalisis, lecturaConImagen, cambiarNodoActivo,
  } = useAnalysis();

  const { chartData, loadingChart, recargar: cargarGraficos } = useDatosGraficos(idNodoActivo);
  const [ahora, setAhora] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setAhora(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const chartDataFormatted = useMemo(() => chartData.map((d) => ({ ...d, time: formatHora(d.fechaHora) })), [chartData]);

  const lec = chartData[chartData.length - 1] ?? ultimaLectura;
  const segsDesde = lec ? Math.floor((Date.now() - parseFechaBackend(lec.fechaHora).getTime()) / 1000) : null;
  const turbWarning = lec && evaluarParametro("turbidez", lec.turbidez) !== "normal";
  const nodoActual = nodos.find((n) => n.idNodo === idNodoActivo);

  const handleGenerateAnalysis = async () => {
    await generarNuevoAnalisis();
    navigate("/analisis-ia");
  };

  if (loadingInit || errorInit) {
    return <PageStateGuard loadingInit={loadingInit} errorInit={errorInit} loadingText="Conectando con el backend..." />;
  }

  return (
    <div className="space-y-5">
      {isGenerating && <GenerationModal data={lec} sensors={sensorMeta} />}

      <PageHeader
        title="Panel de Control"
        subtitle={`Monitoreo en tiempo real${segsDesde !== null ? ` · Última lectura hace ${segsDesde}s` : ""}`}
        actions={<>
          {nodos.length > 1 && (
            <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2 py-1.5 shadow-sm">
              <Cpu size={12} className="text-slate-400" />
              <select
                value={idNodoActivo ?? ""}
                onChange={(e) => cambiarNodoActivo(Number(e.target.value))}
                className="text-xs text-slate-700 font-medium bg-transparent border-none outline-none cursor-pointer"
              >
                {nodos.map((n) => (
                  <option key={n.idNodo} value={n.idNodo}>{n.ubicacion} ({n.macAddress})</option>
                ))}
              </select>
              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${nodoActual?.estadoConexion ? "bg-emerald-500" : "bg-red-400"}`}></span>
            </div>
          )}
          <button onClick={cargarGraficos} disabled={loadingChart}
            className="flex items-center gap-1.5 text-xs text-slate-600 bg-white border border-slate-200 rounded-lg px-3 py-2 hover:bg-slate-50 shadow-sm disabled:opacity-50">
            <RefreshCw size={12} className={loadingChart ? "animate-spin" : ""} /> Refrescar
          </button>
          <div className="flex items-center gap-1.5 text-sm bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-sm">
            <Clock size={13} className="text-cyan-500" />
            <span className="text-slate-600 font-medium font-mono text-xs">
              {String(ahora.getHours()).padStart(2, "0")}:{String(ahora.getMinutes()).padStart(2, "0")}:{String(ahora.getSeconds()).padStart(2, "0")}
            </span>
          </div>
        </>}
      />

      {turbWarning && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 shadow-sm">
          <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
            <AlertTriangle size={14} className="text-amber-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-amber-800">Aviso de calidad detectado</p>
            <p className="text-xs text-amber-700 mt-0.5">
              La turbidez ({lec!.turbidez} NTU) está aproximándose al límite máximo recomendado de {PARAMETROS_CALIDAD.turbidez.normalMax} NTU. Se sugiere revisar el sistema de filtración.
            </p>
          </div>
          <button onClick={() => navigate("/analisis-ia")} className="ml-auto text-xs font-medium text-amber-600 hover:text-amber-800 flex items-center gap-1 flex-shrink-0">
            Ver análisis <ChevronRight size={12} />
          </button>
        </div>
      )}

      {!lecturaConImagen && (
        <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 shadow-sm">
          <AlertTriangle size={14} className="text-blue-500 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-blue-700">
            La última lectura no tiene imagen asociada. El análisis IA requiere una imagen del agua capturada por la cámara ESP32.
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {sensorMeta.map((sensor) => (
          <SensorCard
            key={sensor.key}
            sensorKey={sensor.key}
            label={sensor.label}
            unit={sensor.unit}
            Icon={sensor.icon}
            value={lec ? (lec[sensor.key] as number) : null}
            trend={chartData.length > 1 ? calcularTendencia(chartData, sensor.key) : "stable"}
            color={sensor.color}
            bg={sensor.bg}
            border={sensor.border}
            bar={sensor.bar}
            rangeMin={sensor.rangeMin}
            rangeMax={sensor.rangeMax}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {miniCharts.map((cfg) => (
            <MiniChart
              key={cfg.key}
              label={cfg.label}
              unit={cfg.unit}
              color={cfg.color}
              domain={cfg.domain}
              refLine={cfg.refLine}
              dataKey={cfg.key}
              data={chartDataFormatted}
              currentValue={lec ? (lec[cfg.key] as number) : "—"}
              loading={loadingChart}
            />
          ))}
        </div>
        <CameraPanel nodo={nodoActual} lastCaptureTime={lec?.fechaHora} />
      </div>

      <AnalysisSummary
        analyses={analyses}
        isGenerating={isGenerating}
        ultimaLectura={ultimaLectura}
        lecturaConImagen={lecturaConImagen}
        onGenerate={handleGenerateAnalysis}
      />
    </div>
  );
}
