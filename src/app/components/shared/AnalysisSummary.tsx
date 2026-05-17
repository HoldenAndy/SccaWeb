import { BrainCircuit, Loader2, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router";
import type { AnalisisEnriquecido, LecturaDTO } from "../../../contexts/AnalysisContext";

interface AnalysisSummaryProps {
  analyses: AnalisisEnriquecido[];
  isGenerating: boolean;
  ultimaLectura: LecturaDTO | null;
  lecturaConImagen: boolean;
  onGenerate: () => Promise<void>;
}

export function AnalysisSummary({ analyses, isGenerating, ultimaLectura, lecturaConImagen, onGenerate }: AnalysisSummaryProps) {
  const navigate = useNavigate();
  if (analyses.length === 0) return null;
  const a = analyses[0];

  return (
    <div className="border border-[var(--scca-hair)] rounded-md p-5">
      <div className="flex items-center justify-between gap-4 mb-3">
        <div>
          <div className="scca-caps text-[var(--scca-accent)] mb-1">Análisis IA · más reciente</div>
          <p className="text-[11px] text-[var(--scca-muted)] font-mono">{a.fecha} · latencia {a.tiempo} · gemini-flash-lite</p>
        </div>
        <button
          onClick={() => navigate("/analisis-ia")}
          className="flex items-center gap-1 text-[11px] font-medium text-[var(--scca-accent)] hover:text-[var(--scca-accent-2)]"
        >
          Ver completo <ChevronRight size={11} strokeWidth={1.5} />
        </button>
      </div>
      <p className="text-[14px] text-[var(--scca-ink)] leading-relaxed" style={{ textWrap: "pretty" } as React.CSSProperties}>
        {a.resumen}
      </p>
      <div className="flex items-center gap-3 mt-4 pt-3 border-t border-[var(--scca-hair-soft)]">
        <button
          onClick={onGenerate}
          disabled={isGenerating || !ultimaLectura || !lecturaConImagen}
          className="flex items-center gap-1.5 text-[12px] font-medium text-[var(--scca-bg)] bg-[var(--scca-ink)] rounded-sm px-3 py-1.5 hover:bg-[var(--scca-ink-2)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          title={!lecturaConImagen ? "La lectura actual no tiene imagen asociada" : ""}
        >
          {isGenerating
            ? <><Loader2 size={11} strokeWidth={1.5} className="animate-spin" /> Generando...</>
            : <><BrainCircuit size={11} strokeWidth={1.5} /> Generar nuevo análisis</>}
        </button>
        {!lecturaConImagen && (
          <span className="text-[11px] text-[var(--scca-warn)]">Requiere imagen de la cámara</span>
        )}
      </div>
    </div>
  );
}
