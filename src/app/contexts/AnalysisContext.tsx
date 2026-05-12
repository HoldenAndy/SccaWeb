import { createContext, useContext, useState, ReactNode } from "react";

interface Analysis {
  id: number;
  fecha: string;
  fechaISO: string;
  resumen: string;
  estado: string;
  ph: number;
  temp: number;
  turb: number;
  tds: number;
  tiempo: string;
  texto: string;
  recomendacion: string;
  alerta: { param: string; valor: string; limite: string } | null;
}

interface AnalysisContextType {
  analyses: Analysis[];
  addAnalysis: (analysis: Analysis) => void;
  isGenerating: boolean;
  setIsGenerating: (value: boolean) => void;
}

const AnalysisContext = createContext<AnalysisContextType | undefined>(undefined);

const mockAnalyses: Analysis[] = [
  {
    id: 1,
    fecha: "01/04/2026 14:32",
    fechaISO: "2026-04-01",
    resumen: "Turbidez elevada detectada — revisión de filtros recomendada.",
    estado: "Aviso",
    ph: 7.1,
    temp: 23.5,
    turb: 3.4,
    tds: 321,
    tiempo: "42s",
    texto: `El análisis de los parámetros del agua indica condiciones generalmente aceptables para consumo y uso doméstico.

El pH de 7.1 se encuentra dentro del rango neutro óptimo (6.5–8.5), lo que indica que el agua no es ni ácida ni alcalina en exceso, un indicador positivo de su calidad general.

La temperatura de 23.5 °C es adecuada y no representa riesgo microbiológico por temperatura extrema, manteniéndose dentro del rango recomendado.

Sin embargo, se detecta que la turbidez de 3.4 NTU está aproximándose al límite aceptable de 4 NTU. Esto puede indicar la presencia de partículas en suspensión como sedimentos finos, materia orgánica o inicio de proliferación de microorganismos. Se recomienda revisar el sistema de filtración.

Los Sólidos Disueltos Totales (321 ppm) están dentro de los parámetros normales para agua de uso doméstico, sin representar riesgo inmediato.`,
    recomendacion: "Revisar el prefiltro del sistema de filtración y aumentar la frecuencia de monitoreo de turbidez durante las próximas 3–4 horas.",
    alerta: { param: "Turbidez", valor: "3.4 NTU", limite: "4.0 NTU" },
  },
  {
    id: 2,
    fecha: "01/04/2026 10:00",
    fechaISO: "2026-04-01",
    resumen: "Todos los parámetros dentro de rangos normales. Sin alertas.",
    estado: "Normal",
    ph: 7.3,
    temp: 22.8,
    turb: 2.1,
    tds: 305,
    tiempo: "38s",
    texto: `Todos los parámetros del agua analizados se encuentran dentro de los rangos aceptables para uso doméstico y consumo seguro.

El pH de 7.3 indica un nivel levemente básico pero completamente dentro del rango saludable. La temperatura de 22.8 °C es óptima. La turbidez de 2.1 NTU refleja agua con buena claridad visual y baja concentración de partículas en suspensión.

Los Sólidos Disueltos Totales de 305 ppm indican una mineralización moderada, adecuada para consumo humano.`,
    recomendacion: "No se requieren acciones inmediatas. Continuar con el monitoreo regular cada 30 minutos.",
    alerta: null,
  },
  {
    id: 3,
    fecha: "31/03/2026 20:15",
    fechaISO: "2026-03-31",
    resumen: "Condiciones óptimas. pH estable, turbidez baja.",
    estado: "Normal",
    ph: 7.2,
    temp: 21.5,
    turb: 1.8,
    tds: 298,
    tiempo: "45s",
    texto: `El agua muestra condiciones óptimas en todos los parámetros evaluados. El pH de 7.2 es prácticamente neutro, ideal para consumo. La temperatura de 21.5 °C es adecuada. La turbidez de 1.8 NTU es excelente, indicando agua muy clara. Los TDS de 298 ppm son adecuados.`,
    recomendacion: "Condiciones ideales. Mantener el sistema de monitoreo activo.",
    alerta: null,
  },
];

export function AnalysisProvider({ children }: { children: ReactNode }) {
  const [analyses, setAnalyses] = useState<Analysis[]>(mockAnalyses);
  const [isGenerating, setIsGenerating] = useState(false);

  const addAnalysis = (analysis: Analysis) => {
    setAnalyses((prev) => [analysis, ...prev]);
  };

  return (
    <AnalysisContext.Provider value={{ analyses, addAnalysis, isGenerating, setIsGenerating }}>
      {children}
    </AnalysisContext.Provider>
  );
}

export function useAnalysis() {
  const context = useContext(AnalysisContext);
  if (context === undefined) {
    throw new Error("useAnalysis must be used within an AnalysisProvider");
  }
  return context;
}
