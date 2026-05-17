import { AlertTriangle, Clock, RefreshCw, Cpu, ChevronRight, BrainCircuit } from "lucide-react";
import { useNavigate } from "react-router";
import { useState, useEffect, useMemo, useRef } from "react";
import { toast } from "sonner";
import { useAnalysis } from "../contexts/AnalysisContext";
import { useNotifications } from "../contexts/NotificationsContext";
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
import { SkeletonKPI, SkeletonChart } from "../components/shared/Skeleton";
import { sensorMeta } from "../../lib/sensorConfig";

const miniCharts = [
  { key: "ph"          as ParametroKey, label: "pH",          unit: "",    color: "#1d3a6f", domain: [6.4, 7.6] as [number, number], refLine: undefined as number | undefined },
  { key: "temperatura" as ParametroKey, label: "Temperatura", unit: "°C",  color: "#c25e1a", domain: [15, 35]   as [number, number], refLine: undefined as number | undefined },
  { key: "turbidez"    as ParametroKey, label: "Turbidez",    unit: "NTU", color: "#5a2b7a", domain: [0, 5]     as [number, number], refLine: PARAMETROS_CALIDAD.turbidez.normalMax },
  { key: "tds"         as ParametroKey, label: "TDS",         unit: "ppm", color: "#1f5a3c", domain: [0, 600]   as [number, number], refLine: undefined as number | undefined },
];

export function DashboardPage() {
  const navigate = useNavigate();
  const {
    ultimaLectura, idNodoActivo, nodos, isGenerating,
    analyses, loadingInit, errorInit,
    generarNuevoAnalisis, lecturaConImagen, cambiarNodoActivo,
  } = useAnalysis();
  const { push: pushNotif } = useNotifications();

  const { chartData, loadingChart, recargar: cargarGraficos } = useDatosGraficos(idNodoActivo);
  const [ahora, setAhora] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setAhora(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const chartDataFormatted = useMemo(
    () => chartData.map((d) => ({ ...d, time: formatHora(d.fechaHora) })),
    [chartData]
  );

  const lec = chartData[chartData.length - 1] ?? ultimaLectura;
  const lecPrev = chartData[chartData.length - 2] ?? null;
  const segsDesde = lec ? Math.floor((Date.now() - parseFechaBackend(lec.fechaHora).getTime()) / 1000) : null;
  const turbWarning = lec && evaluarParametro("turbidez", lec.turbidez) !== "normal";
  const nodoActual = nodos.find((n) => n.idNodo === idNodoActivo);

  // Notify whenever a brand-new analysis arrives (A4 + C16)
  const lastSeenAnalysisIdRef = useRef<number | null>(null);
  useEffect(() => {
    const newest = analyses[0]?.id ?? null;
    if (newest !== null && lastSeenAnalysisIdRef.current !== null && newest !== lastSeenAnalysisIdRef.current) {
      pushNotif({
        kind: analyses[0].estado === "Aviso" ? "warning" : "success",
        title: `Análisis #${String(newest).padStart(3, "0")} generado`,
        body: analyses[0].resumen,
        href: "/analisis-ia",
      });
    }
    lastSeenAnalysisIdRef.current = newest;
  }, [analyses, pushNotif]);

  // Notify whenever a node goes from connected → disconnected
  const prevNodosRef = useRef<typeof nodos>([]);
  useEffect(() => {
    nodos.forEach((n) => {
      const prev = prevNodosRef.current.find((p) => p.idNodo === n.idNodo);
      if (prev?.estadoConexion && !n.estadoConexion) {
        pushNotif({
          kind: "critical",
          title: `Nodo ${n.macAddress} desconectado`,
          body: `Ubicación: ${n.ubicacion}. No reporta lecturas.`,
          href: "/nodos",
        });
      }
    });
    prevNodosRef.current = nodos;
  }, [nodos, pushNotif]);

  const handleGenerateAnalysis = async () => {
    const toastId = toast.loading("Generando análisis IA…", { description: "Latencia típica ~47 s" });
    try {
      await generarNuevoAnalisis();
      toast.success("Análisis generado", { id: toastId, description: "Listo para revisar en el módulo Análisis IA" });
      navigate("/analisis-ia");
    } catch (err: unknown) {
      toast.error("No se pudo generar el análisis", { id: toastId, description: err instanceof Error ? err.message : "Intenta de nuevo en unos segundos" });
    }
  };

  if (loadingInit || errorInit) {
    return <PageStateGuard loadingInit={loadingInit} errorInit={errorInit} loadingText="Conectando con el backend…" />;
  }

  // Compute deltas per sensor (current vs previous reading)
  const deltaOf = (key: ParametroKey): number | null => {
    if (!lec || !lecPrev) return null;
    const cur = lec[key] as number;
    const prev = lecPrev[key] as number;
    if (typeof cur !== "number" || typeof prev !== "number") return null;
    return cur - prev;
  };

  return (
    <div>
      {isGenerating && <GenerationModal data={lec} sensors={sensorMeta} />}

      <PageHeader
        title="Panel de control"
        subtitle={`Monitoreo en tiempo real del nodo activo${segsDesde !== null ? ` · última lectura hace ${segsDesde}s` : ""}.`}
        actions={
          <>
            {nodos.length > 1 && (
              <div className="flex items-center gap-1.5 border border-[var(--scca-hair)] rounded-sm px-2 py-1.5 bg-[var(--scca-bg)]">
                <Cpu size={11} strokeWidth={1.5} className="text-[var(--scca-muted)]" />
                <select
                  value={idNodoActivo ?? ""}
                  onChange={(e) => cambiarNodoActivo(Number(e.target.value))}
                  className="text-[11px] text-[var(--scca-ink-2)] bg-transparent border-none outline-none cursor-pointer"
                >
                  {nodos.map((n) => (<option key={n.idNodo} value={n.idNodo}>{n.ubicacion} ({n.macAddress})</option>))}
                </select>
                <span className={`w-1.5 h-1.5 rounded-full ${nodoActual?.estadoConexion ? "bg-[var(--scca-ok)]" : "bg-[var(--scca-faint)]"}`} />
              </div>
            )}
            <button
              onClick={cargarGraficos}
              disabled={loadingChart}
              className="flex items-center gap-1.5 text-[11px] text-[var(--scca-ink-2)] border border-[var(--scca-hair)] rounded-sm px-3 py-1.5 hover:bg-[var(--scca-surface)] disabled:opacity-50 transition-colors"
            >
              <RefreshCw size={11} strokeWidth={1.5} className={loadingChart ? "animate-spin" : ""} /> Refrescar
            </button>
            <button
              onClick={handleGenerateAnalysis}
              disabled={!lecturaConImagen || isGenerating}
              title={!lecturaConImagen ? "La lectura actual no tiene imagen ESP32-CAM asociada" : "Generar nuevo análisis IA"}
              className="flex items-center gap-1.5 text-[11px] text-[var(--scca-bg)] bg-[var(--scca-ink)] rounded-sm px-3 py-1.5 hover:bg-[var(--scca-ink-2)] disabled:opacity-40 transition-colors"
            >
              <BrainCircuit size={11} strokeWidth={1.5} /> Generar análisis
            </button>
            <div className="flex items-center gap-1.5 text-[12px] border border-[var(--scca-hair)] rounded-sm px-2.5 py-1.5">
              <Clock size={11} strokeWidth={1.5} className="text-[var(--scca-accent)]" />
              <span className="text-[var(--scca-ink-2)] font-mono tabular-nums text-[11px]">
                {String(ahora.getHours()).padStart(2, "0")}:{String(ahora.getMinutes()).padStart(2, "0")}:{String(ahora.getSeconds()).padStart(2, "0")}
              </span>
            </div>
          </>
        }
      />

      <div className="px-4 md:px-8 py-6 flex flex-col" style={{ gap: "var(--scca-section-gap)" }}>
        {turbWarning && (
          <div className="flex items-start gap-3 bg-[var(--scca-warn-bg)] border border-[var(--scca-hair)] rounded-sm px-4 py-3">
            <AlertTriangle size={13} strokeWidth={1.5} className="text-[var(--scca-warn)] mt-0.5" />
            <div className="flex-1">
              <p className="text-[12.5px] font-semibold text-[var(--scca-warn)]">Aviso de calidad — turbidez fuera de banda</p>
              <p className="text-[11.5px] text-[var(--scca-warn)] mt-0.5 opacity-85">
                La turbidez ({lec!.turbidez} NTU) supera el límite recomendado de {PARAMETROS_CALIDAD.turbidez.normalMax} NTU. Revisa el sistema de filtración.
              </p>
            </div>
            <button
              onClick={() => navigate("/analisis-ia")}
              className="text-[11px] font-medium text-[var(--scca-warn)] hover:underline flex items-center gap-1 flex-shrink-0"
            >
              Ver análisis <ChevronRight size={11} strokeWidth={1.5} />
            </button>
          </div>
        )}

        {!lecturaConImagen && (
          <div className="flex items-start gap-3 bg-[var(--scca-accent-soft)] border border-[var(--scca-hair)] rounded-sm px-4 py-2.5">
            <AlertTriangle size={12} strokeWidth={1.5} className="text-[var(--scca-accent)] mt-0.5 flex-shrink-0" />
            <p className="text-[11px] text-[var(--scca-ink-2)]">
              La última lectura no tiene imagen asociada. El análisis IA requiere una imagen del agua capturada por la cámara ESP32.
            </p>
          </div>
        )}

        <section>
          <div className="scca-caps mb-3">Parámetros actuales</div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {loadingChart && chartData.length === 0
              ? Array.from({ length: 4 }).map((_, i) => <SkeletonKPI key={i} />)
              : sensorMeta.map((sensor) => (
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
                  delta={deltaOf(sensor.key)}
                />
              ))
            }
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <div className="scca-caps mb-3">Últimas 2 horas</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {loadingChart && chartDataFormatted.length === 0
                ? Array.from({ length: 4 }).map((_, i) => <SkeletonChart key={i} height={140} />)
                : miniCharts.map((cfg) => (
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
                ))
              }
            </div>
          </div>
          <div>
            <div className="scca-caps mb-3">Cámara</div>
            <CameraPanel nodo={nodoActual} lastCaptureTime={lec?.fechaHora} />
          </div>
        </section>

        <AnalysisSummary
          analyses={analyses}
          isGenerating={isGenerating}
          ultimaLectura={ultimaLectura}
          lecturaConImagen={lecturaConImagen}
          onGenerate={handleGenerateAnalysis}
        />
      </div>
    </div>
  );
}
