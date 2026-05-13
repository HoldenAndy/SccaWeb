import {
  createContext, useContext, useState, useEffect, useCallback, ReactNode,
} from "react";
import { generarAnalisis, getAnalisisPorNodoPaginado, type AnalisisDTO } from "../../api/analisis";
import {
  getUltimaLectura, getHistorialCompleto,
  parseFechaBackend, toLocalISOString,
  type LecturaDTO,
} from "../../api/lecturas";
import { getImagenPorLectura } from "../../api/imagenes";
import { getNodos } from "../../api/nodos";

export interface AnalisisEnriquecido {
  id: number;
  idLectura: number;
  fecha: string;
  fechaISO: string;
  resumen: string;
  estado: "Normal" | "Aviso";
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
  analyses: AnalisisEnriquecido[];
  ultimaLectura: LecturaDTO | null;
  idNodoActivo: number | null;
  isGenerating: boolean;
  loadingInit: boolean;
  errorInit: string | null;
  lecturaConImagen: boolean;
  setIsGenerating: (v: boolean) => void;
  addAnalysis: (a: AnalisisEnriquecido) => void;
  generarNuevoAnalisis: () => Promise<void>;
  recargarAnalisis: () => Promise<void>;
}


function formatFecha(fecha: string | number[]): string {
  const d = parseFechaBackend(fecha);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function getFechaISO(fecha: string | number[]): string {
  return parseFechaBackend(fecha).toISOString().split("T")[0];
}

function msToTiempo(ms: number): string {
  return ms < 1000 ? `${ms}ms` : `${Math.round(ms / 1000)}s`;
}

function detectarAlerta(turb: number, ph: number): AnalisisEnriquecido["alerta"] {
  if (turb > 4)          return { param: "Turbidez", valor: `${turb} NTU`, limite: "4.0 NTU" };
  if (ph < 6.5 || ph > 8.5) return { param: "pH", valor: `${ph}`, limite: "6.5 – 8.5" };
  return null;
}

function enriquecer(a: AnalisisDTO, lecturaMap: Map<number, LecturaDTO>): AnalisisEnriquecido {
  const lec  = lecturaMap.get(a.idLectura);
  const ph   = lec?.ph ?? 0;
  const temp = lec?.temperatura ?? 0;
  const turb = lec?.turbidez ?? 0;
  const tds  = lec?.tds ?? 0;

  const alerta = detectarAlerta(turb, ph);
  const primeraLinea = a.resultadoTexto.split("\n").find((l) => l.trim()) ?? "";
  const resumen = primeraLinea.length > 120 ? primeraLinea.slice(0, 120) + "…" : primeraLinea;

  const lineas = a.resultadoTexto.split("\n").map((l) => l.trim()).filter(Boolean);
  const recIdx = lineas.findLastIndex((l) => /^(Se recomienda|Recomendaci)/i.test(l));
  const recomendacion = recIdx !== -1 ? lineas[recIdx] : "Continuar con el monitoreo regular.";

  return {
    id: a.idAnalisis,
    idLectura: a.idLectura,
    fecha: formatFecha(a.fechaHora),
    fechaISO: getFechaISO(a.fechaHora),
    resumen,
    estado: alerta ? "Aviso" : "Normal",
    ph, temp, turb, tds,
    tiempo: msToTiempo(a.tiempoResMs),
    texto: a.resultadoTexto,
    recomendacion,
    alerta,
  };
}

const AnalysisContext = createContext<AnalysisContextType | undefined>(undefined);

export function AnalysisProvider({ children }: { children: ReactNode }) {
  const [analyses, setAnalyses]                 = useState<AnalisisEnriquecido[]>([]);
  const [ultimaLectura, setUltimaLectura]       = useState<LecturaDTO | null>(null);
  const [idNodoActivo, setIdNodoActivo]         = useState<number | null>(null);
  const [lecturaMap, setLecturaMap]             = useState<Map<number, LecturaDTO>>(new Map());
  const [isGenerating, setIsGenerating]         = useState(false);
  const [loadingInit, setLoadingInit]           = useState(true);
  const [errorInit, setErrorInit]               = useState<string | null>(null);
  const [lecturaConImagen, setLecturaConImagen] = useState(false); // FIX #7

  const cargarDatos = useCallback(async () => {
    try {
      setLoadingInit(true);
      setErrorInit(null);

      // 1. Nodo activo — esto sí es crítico, sin nodo no hay nada que mostrar
      const nodos = await getNodos();
      const nodo = nodos.find((n) => n.estadoConexion) ?? nodos[0] ?? null;
      if (!nodo) { setErrorInit("No se encontraron nodos en el backend."); return; }
      setIdNodoActivo(nodo.idNodo);

      // 2. Última lectura — puede no existir si el nodo aún no envió datos.
      //    No abortar: dejar ultimaLectura en null y continuar.
      let ultima: LecturaDTO | null = null;
      try {
        ultima = await getUltimaLectura(nodo.idNodo);
        setUltimaLectura(ultima);
      } catch {
        // 404: nodo sin lecturas todavía — es válido
        setUltimaLectura(null);
      }

      // 3. Verificar imagen solo si hay lectura
      if (ultima) {
        try {
          await getImagenPorLectura(ultima.idLectura);
          setLecturaConImagen(true);
        } catch {
          setLecturaConImagen(false);
        }
      } else {
        setLecturaConImagen(false);
      }

      // 4. Historial de lecturas para el mapa idLectura → sensores
      const map = new Map<number, LecturaDTO>();
      try {
        const lecturas = await getHistorialCompleto(nodo.idNodo);
        for (const l of lecturas) map.set(l.idLectura, l);
        if (ultima) map.set(ultima.idLectura, ultima);
      } catch {
        // Sin lecturas — el mapa queda vacío, los análisis mostrarán 0 en sensores
      }
      setLecturaMap(map);

      // 5. Historial de análisis del nodo (último año)
      try {
        const fin    = new Date();
        const inicio = new Date(fin);
        inicio.setFullYear(inicio.getFullYear() - 1);
        const page = await getAnalisisPorNodoPaginado(
          nodo.idNodo,
          toLocalISOString(inicio),
          toLocalISOString(fin),
          0,
          50
        );
        setAnalyses(page.content.map((a) => enriquecer(a, map)));
      } catch {
        // Sin análisis todavía — lista vacía
        setAnalyses([]);
      }

    } catch (err: unknown) {
      // Solo llega aquí si falla getNodos() — error real de conexión
      setErrorInit(err instanceof Error ? err.message : String(err));
    } finally {
      setLoadingInit(false);
    }
  }, []);

  useEffect(() => { cargarDatos(); }, [cargarDatos]);

  // FIX #4: este es el único lugar que maneja isGenerating.
  // Los componentes NO deben llamar setIsGenerating por separado.
  const generarNuevoAnalisis = useCallback(async () => {
    if (!ultimaLectura) return;
    setIsGenerating(true);
    try {
      const dto = await generarAnalisis(ultimaLectura.idLectura);
      const nuevaMap = new Map(lecturaMap);
      nuevaMap.set(ultimaLectura.idLectura, ultimaLectura);
      setLecturaMap(nuevaMap);
      setAnalyses((prev) => [enriquecer(dto, nuevaMap), ...prev]);
    } finally {
      setIsGenerating(false);
    }
  }, [ultimaLectura, lecturaMap]);

  const addAnalysis = useCallback((a: AnalisisEnriquecido) => {
    setAnalyses((prev) => [a, ...prev]);
  }, []);

  return (
    <AnalysisContext.Provider value={{
      analyses, ultimaLectura, idNodoActivo,
      isGenerating, loadingInit, errorInit, lecturaConImagen,
      setIsGenerating, addAnalysis, generarNuevoAnalisis, recargarAnalisis: cargarDatos,
    }}>
      {children}
    </AnalysisContext.Provider>
  );
}

export function useAnalysis() {
  const ctx = useContext(AnalysisContext);
  if (!ctx) throw new Error("useAnalysis must be used within AnalysisProvider");
  return ctx;
}
