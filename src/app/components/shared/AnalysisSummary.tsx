import { BrainCircuit, Loader2, CheckCircle2, ChevronRight } from "lucide-react";
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

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-violet-50 border border-violet-200 flex items-center justify-center">
            <BrainCircuit size={16} className="text-violet-600" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-800">Análisis IA — Resumen Actual</h2>
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
        <button
          onClick={onGenerate}
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
  );
}
