import { BrainCircuit, Calendar, Filter, AlertTriangle, CheckCircle2, Clock, Info, Loader2, Columns, Sparkles } from "lucide-react";
import { useState, useMemo, useEffect, useRef } from "react";
import { useAnalysis } from "../contexts/AnalysisContext";
import { type AnalisisEnriquecido } from "../../lib/analisis";
import { PageStateGuard } from "../components/PageStateGuard";
import { isoToday } from "../../lib/fechas";
import { StatusBadge } from "../components/shared/StatusBadge";
import { PageHeader } from "../components/shared/PageHeader";
import { GenerationModal } from "../components/shared/GenerationModal";
import { EmptyState } from "../components/shared/EmptyState";
import { SkeletonText } from "../components/shared/Skeleton";
import { AnalysisCompareModal } from "../components/shared/AnalysisCompareModal";
import { analysisSensorMeta } from "../../lib/sensorConfig";
import { toast } from "sonner";

export function AnalisisIAPage() {
  const { analyses, isGenerating, generarNuevoAnalisis, loadingInit, errorInit, lecturaConImagen } = useAnalysis();

  const [selectedId, setSelectedId] = useState<number | null>(analyses[0]?.id ?? null);
  const [fromDate, setFromDate] = useState(isoToday());
  const [toDate, setToDate] = useState(isoToday());
  const [activeRange, setActiveRange] = useState<[string, string] | null>(null);
  const [compareOpen, setCompareOpen] = useState(false);

  const prevLatestIdRef = useRef<number | null>(analyses[0]?.id ?? null);
  useEffect(() => {
    const latestId = analyses[0]?.id ?? null;
    if (latestId !== null && latestId !== prevLatestIdRef.current) {
      prevLatestIdRef.current = latestId;
      if (!activeRange) setSelectedId(latestId);
    }
  }, [analyses, activeRange]);

  const filteredAnalyses = useMemo(() => {
    if (!activeRange) return analyses;
    const [from, to] = activeRange.map((s) => new Date(s));
    return analyses.filter((a) => {
      const [datePart, timePart] = a.fecha.split(" ");
      const [dd, mm, yyyy] = datePart.split("/");
      const [hh, mi] = (timePart ?? "00:00").split(":");
      const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd), Number(hh), Number(mi));
      return d >= from && d <= to;
    });
  }, [analyses, activeRange]);

  const selected: AnalisisEnriquecido | undefined =
    filteredAnalyses.find((a) => a.id === selectedId) ?? filteredAnalyses[0];

  const handleFilter = () => setActiveRange([`${fromDate}T00:00:00`, `${toDate}T23:59:59`]);
  const handleGenerate = async () => {
    const id = toast.loading("Generando análisis IA…", { description: "Procesando lectura + imagen ESP32-CAM" });
    try {
      await generarNuevoAnalisis();
      toast.success("Análisis generado", { id });
    } catch (err: unknown) {
      toast.error("Error al generar análisis", { id, description: err instanceof Error ? err.message : undefined });
    }
  };

  if (loadingInit || errorInit) return <PageStateGuard loadingInit={loadingInit} errorInit={errorInit} loadingText="Cargando análisis…" />;

  return (
    <div>
      {isGenerating && <GenerationModal data={selected} sensors={analysisSensorMeta} />}
      {compareOpen && analyses.length >= 2 && (
        <AnalysisCompareModal analyses={analyses} initialIdA={selectedId} onClose={() => setCompareOpen(false)} />
      )}

      <PageHeader
        title="Análisis de inteligencia artificial"
        subtitle="Interpretación cualitativa de la calidad del agua mediante el modelo Gemini Flash Lite. Latencia típica ~47 s."
        actions={
          <>
            {analyses.length >= 2 && (
              <button
                onClick={() => setCompareOpen(true)}
                className="flex items-center gap-1.5 text-[11px] text-[var(--scca-ink-2)] border border-[var(--scca-hair)] rounded-sm px-3 py-1.5 hover:bg-[var(--scca-surface)] transition-colors"
              >
                <Columns size={11} strokeWidth={1.5} /> Comparar dos
              </button>
            )}
            <div className="flex items-center gap-1.5 text-[10.5px] uppercase tracking-[0.08em] text-[var(--scca-accent)] border border-[var(--scca-hair)] rounded-sm px-2.5 py-1">
              <Sparkles size={10} strokeWidth={1.5} />
              Gemini Flash Lite · ~60 s
            </div>
          </>
        }
      />

      <div className="px-4 md:px-8 py-6 flex flex-col" style={{ gap: "var(--scca-section-gap)" }}>
        {/* Filter row */}
        <div className="border border-[var(--scca-hair)] rounded-md p-3 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Calendar size={12} strokeWidth={1.5} className="text-[var(--scca-muted)]" />
            <span className="scca-caps">Filtrar por fecha</span>
          </div>
          <div className="flex items-center gap-1.5 border border-[var(--scca-hair)] rounded-sm px-2.5 py-1.5">
            <label className="text-[10px] text-[var(--scca-muted)]">Desde</label>
            <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)}
              className="text-[11px] text-[var(--scca-ink)] bg-transparent border-none outline-none font-mono" />
          </div>
          <span className="text-[var(--scca-faint)]">→</span>
          <div className="flex items-center gap-1.5 border border-[var(--scca-hair)] rounded-sm px-2.5 py-1.5">
            <label className="text-[10px] text-[var(--scca-muted)]">Hasta</label>
            <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)}
              className="text-[11px] text-[var(--scca-ink)] bg-transparent border-none outline-none font-mono" />
          </div>
          <button onClick={handleFilter}
            className="flex items-center gap-1.5 text-[11px] font-medium text-[var(--scca-bg)] bg-[var(--scca-ink)] rounded-sm px-3 py-1.5 hover:bg-[var(--scca-ink-2)] transition-colors">
            <Filter size={11} strokeWidth={1.5} /> Aplicar
          </button>
          {activeRange && (
            <button
              onClick={() => setActiveRange(null)}
              className="text-[10.5px] text-[var(--scca-muted)] hover:text-[var(--scca-ink)] transition-colors"
            >
              Limpiar
            </button>
          )}
          <span className="ml-auto text-[11px] text-[var(--scca-muted)]">
            <span className="font-mono">{filteredAnalyses.length}</span> análisis
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* List */}
          <aside className="lg:col-span-1">
            <div className="scca-caps mb-3">Historial</div>
            <div className="border border-[var(--scca-hair)] rounded-md overflow-hidden">
              <div className="max-h-[460px] overflow-y-auto">
                {filteredAnalyses.length === 0 ? (
                  <EmptyState
                    Icon={BrainCircuit}
                    title={activeRange ? "Sin análisis en el período" : "Sin análisis registrados"}
                    body={activeRange
                      ? "Prueba ampliando el rango de fechas, o limpia el filtro para ver todos."
                      : "Genera el primero usando el botón inferior. El modelo combinará la última lectura con la imagen ESP32-CAM."}
                    size="sm"
                  />
                ) : filteredAnalyses.map((a, i) => {
                  const active = a.id === selectedId;
                  return (
                    <button key={a.id} onClick={() => setSelectedId(a.id)}
                      className={`relative w-full text-left p-3 transition-colors ${
                        active ? "bg-[var(--scca-surface)]" : "bg-[var(--scca-bg)] hover:bg-[var(--scca-surface)]"
                      } ${i > 0 ? "border-t border-[var(--scca-hair-soft)]" : ""}`}>
                      {active && <span className="absolute left-0 top-0 bottom-0 w-[2px] bg-[var(--scca-accent)]" aria-hidden />}
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-mono text-[var(--scca-ink-2)] font-medium">#{String(a.id).padStart(3, "0")}</span>
                        <StatusBadge status={a.estado === "Aviso" ? "warning" : "normal"} />
                      </div>
                      <p className="text-[10.5px] font-mono text-[var(--scca-muted)] mb-1.5">{a.fecha}</p>
                      <p className="text-[11.5px] text-[var(--scca-ink-2)] leading-snug line-clamp-2">{a.resumen}</p>
                      <div className="flex items-center gap-3 mt-2 text-[10px] text-[var(--scca-faint)] font-mono">
                        <span className="flex items-center gap-1"><Clock size={9} strokeWidth={1.5} /> {a.tiempo}</span>
                        <span>IA procesada</span>
                      </div>
                    </button>
                  );
                })}
              </div>
              <div className="p-3 border-t border-[var(--scca-hair)]">
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating || !lecturaConImagen}
                  className="w-full flex items-center justify-center gap-1.5 text-[11.5px] font-medium text-[var(--scca-bg)] bg-[var(--scca-ink)] rounded-sm py-2 hover:bg-[var(--scca-ink-2)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isGenerating
                    ? <><Loader2 size={11} strokeWidth={1.5} className="animate-spin" /> Generando…</>
                    : <><BrainCircuit size={11} strokeWidth={1.5} /> Generar nuevo análisis</>}
                </button>
                {!lecturaConImagen && (
                  <p className="text-[10px] text-[var(--scca-warn)] text-center mt-2">Requiere imagen ESP32-CAM</p>
                )}
                <p className="text-[10px] text-[var(--scca-faint)] text-center mt-1">Procesamiento ~40–60 s · Gemini Flash Lite</p>
              </div>
            </div>
          </aside>

          {/* Detail */}
          <article className="lg:col-span-2">
            {!selected ? (
              <div className="border border-[var(--scca-hair)] rounded-md">
                <EmptyState
                  Icon={BrainCircuit}
                  title={activeRange ? "Sin análisis para mostrar" : "Aún no se ha generado ningún análisis"}
                  body={activeRange
                    ? "Ningún análisis cae dentro del rango. Limpia el filtro o amplía el período."
                    : "El sistema generará interpretaciones cualitativas combinando los sensores y la imagen del agua. Empieza por crear el primero."}
                />
              </div>
            ) : (
              <div className="border border-[var(--scca-hair)] rounded-md">
                <div className="px-5 py-4 border-b border-[var(--scca-hair)] flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="scca-caps text-[var(--scca-accent)] mb-1">Análisis #{String(selected.id).padStart(3, "0")} · {selected.estado}</div>
                    <h2 className="text-[20px] font-medium text-[var(--scca-ink)] tracking-[-0.01em] leading-snug" style={{ textWrap: "balance" } as React.CSSProperties}>
                      {selected.resumen}
                    </h2>
                  </div>
                  <div className="text-right text-[11px] font-mono text-[var(--scca-muted)] flex-shrink-0">
                    <div>{selected.fecha}</div>
                    <div className="text-[var(--scca-faint)] mt-0.5">Latencia {selected.tiempo}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4">
                  {analysisSensorMeta.map((s, i) => {
                    const val = selected[s.key];
                    return (
                      <div key={s.key} className={`p-4 ${i % 4 !== 0 ? "border-l border-[var(--scca-hair-soft)]" : ""} ${i >= 2 && "border-t sm:border-t-0 border-[var(--scca-hair-soft)]"}`}>
                        <div className="scca-caps" style={{ fontSize: 10 }}>{s.label}</div>
                        <div className="mt-1.5 flex items-baseline gap-1">
                          <span className={`text-[26px] font-mono tabular-nums font-medium ${s.color} tracking-[-0.03em] leading-none`}>{val || "—"}</span>
                          <span className="text-[11px] text-[var(--scca-muted)]">{s.unit}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="px-5 py-5 border-t border-[var(--scca-hair)]">
                  <div className="scca-caps mb-2">Interpretación del modelo</div>
                  {isGenerating ? <SkeletonText lines={4} /> : (
                    <p className="scca-prose">{selected.texto}</p>
                  )}
                </div>

                <div className="px-5 pb-5">
                  <div className="bg-[var(--scca-accent-soft)] border-l-2 border-[var(--scca-accent)] rounded-sm p-3.5">
                    <div className="scca-caps text-[var(--scca-accent)] mb-1 flex items-center gap-1.5">
                      <Info size={11} strokeWidth={1.5} /> Recomendación
                    </div>
                    <p className="text-[13px] text-[var(--scca-ink-2)] leading-relaxed">{selected.recomendacion}</p>
                  </div>

                  {selected.alerta && (
                    <div className="mt-3 bg-[var(--scca-warn-bg)] border border-[var(--scca-hair)] rounded-sm p-3.5 flex items-start gap-3">
                      <AlertTriangle size={13} strokeWidth={1.5} className="text-[var(--scca-warn)] flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[12px] font-semibold text-[var(--scca-warn)]">Parámetro fuera de rango óptimo</p>
                        <p className="text-[12px] text-[var(--scca-warn)] mt-0.5 opacity-85">
                          <strong>{selected.alerta.param}:</strong> {selected.alerta.valor} — límite {selected.alerta.limite}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="mt-4 pt-4 border-t border-[var(--scca-hair-soft)] flex items-center justify-between text-[10.5px] text-[var(--scca-muted)] font-mono">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 size={11} strokeWidth={1.5} className="text-[var(--scca-ok)]" />
                      Generado en {selected.tiempo} con gemini-flash-lite
                    </span>
                    {analyses.length >= 2 && (
                      <button
                        onClick={() => setCompareOpen(true)}
                        className="flex items-center gap-1 text-[var(--scca-accent)] hover:underline font-sans"
                      >
                        <Columns size={10} strokeWidth={1.5} /> Comparar con otro
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </article>
        </div>
      </div>
    </div>
  );
}
