import {
  createContext, useContext, useState, useEffect, useCallback, ReactNode,
} from "react";
import { generarAnalisis, getAnalisisPorNodoPaginado } from "../../api/analisis";
import {
  getUltimaLectura, getHistorialPaginado,
  toLocalISOString,
  type LecturaDTO,
} from "../../api/lecturas";
import { getImagenPorLectura } from "../../api/imagenes";
import { getNodos, getMisNodos, type NodoDTO } from "../../api/nodos";
import { enriquecerAnalisis, type AnalisisEnriquecido } from "../../lib/analisis";
import { PAGINATION, DATE_RANGE } from "../../lib/config";

interface AnalysisContextType {
  analyses: AnalisisEnriquecido[];
  ultimaLectura: LecturaDTO | null;
  idNodoActivo: number | null;
  nodos: NodoDTO[];
  isGenerating: boolean;
  loadingInit: boolean;
  errorInit: string | null;
  lecturaConImagen: boolean;
  setIsGenerating: (v: boolean) => void;
  addAnalysis: (a: AnalisisEnriquecido) => void;
  generarNuevoAnalisis: () => Promise<void>;
  recargarAnalisis: () => Promise<void>;
  cambiarNodoActivo: (idNodo: number) => void;
}

const AnalysisContext = createContext<AnalysisContextType | undefined>(undefined);

interface AnalysisProviderProps {
  children: ReactNode;
  token: string | null;
}

export function AnalysisProvider({ children, token }: AnalysisProviderProps) {
  const [analyses, setAnalyses] = useState<AnalisisEnriquecido[]>([]);
  const [ultimaLectura, setUltimaLectura] = useState<LecturaDTO | null>(null);
  const [idNodoActivo, setIdNodoActivo] = useState<number | null>(null);
  const [nodos, setNodos] = useState<NodoDTO[]>([]);
  const [lecturaMap, setLecturaMap] = useState<Map<number, LecturaDTO>>(new Map());
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingInit, setLoadingInit] = useState(true);
  const [errorInit, setErrorInit] = useState<string | null>(null);
  const [lecturaConImagen, setLecturaConImagen] = useState(false);

  const cargarDatosDeNodo = useCallback(async (idNodo: number) => {
    setLoadingInit(true);
    try {
      let ultima: LecturaDTO | null = null;
      try {
        ultima = await getUltimaLectura(idNodo);
        setUltimaLectura(ultima);
      } catch {
        setUltimaLectura(null);
      }

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

      const map = new Map<number, LecturaDTO>();
      try {
        const fin = new Date();
        const inicio = new Date(fin);
        inicio.setFullYear(inicio.getFullYear() - DATE_RANGE.HISTORY_YEARS);
        const page = await getHistorialPaginado(
          idNodo,
          toLocalISOString(inicio),
          toLocalISOString(fin),
          0,
          PAGINATION.LECTURAS_MAX,
          "fechaHora",
          "desc",
        );
        for (const l of page.content) map.set(l.idLectura, l);
        if (ultima) map.set(ultima.idLectura, ultima);
      } catch { /* sin lecturas */ }
      setLecturaMap(map);

      try {
        const fin = new Date();
        const inicio = new Date(fin);
        inicio.setFullYear(inicio.getFullYear() - DATE_RANGE.HISTORY_YEARS);
        const page = await getAnalisisPorNodoPaginado(
          idNodo,
          toLocalISOString(inicio),
          toLocalISOString(fin),
          0, PAGINATION.ANALYSIS_PAGE_SIZE,
        );
        setAnalyses(page.content.map((a) => enriquecerAnalisis(a, map)));
      } catch {
        setAnalyses([]);
      }
    } finally {
      setLoadingInit(false);
    }
  }, []);

  const cargarDatos = useCallback(async () => {
    try {
      setLoadingInit(true);
      setErrorInit(null);

      let todosNodos: NodoDTO[] = [];
      try {
        todosNodos = await getNodos();
      } catch {
        try {
          todosNodos = await getMisNodos();
        } catch { /* sin nodos */ }
      }

      if (!todosNodos.length) {
        setErrorInit("No se encontraron nodos en el backend.");
        setLoadingInit(false);
        return;
      }

      setNodos(todosNodos);
      const nodoInicial = todosNodos.find((n) => n.estadoConexion) ?? todosNodos[0];
      setIdNodoActivo(nodoInicial.idNodo);
      await cargarDatosDeNodo(nodoInicial.idNodo);
    } catch (err: unknown) {
      setErrorInit(err instanceof Error ? err.message : String(err));
      setLoadingInit(false);
    }
  }, [cargarDatosDeNodo]);

  useEffect(() => {
    if (!token) {
      setAnalyses([]);
      setUltimaLectura(null);
      setIdNodoActivo(null);
      setNodos([]);
      setLecturaMap(new Map());
      setErrorInit(null);
      setLoadingInit(false);
      return;
    }
    cargarDatos();
  }, [token, cargarDatos]);

  const cambiarNodoActivo = useCallback((idNodo: number) => {
    setIdNodoActivo(idNodo);
    cargarDatosDeNodo(idNodo);
  }, [cargarDatosDeNodo]);

  const generarNuevoAnalisis = useCallback(async () => {
    if (!ultimaLectura) return;
    setIsGenerating(true);
    try {
      const dto = await generarAnalisis(ultimaLectura.idLectura);
      const nuevaMap = new Map(lecturaMap);
      nuevaMap.set(ultimaLectura.idLectura, ultimaLectura);
      setLecturaMap(nuevaMap);
      setAnalyses((prev) => [enriquecerAnalisis(dto, nuevaMap), ...prev]);
    } finally {
      setIsGenerating(false);
    }
  }, [ultimaLectura, lecturaMap]);

  const addAnalysis = useCallback((a: AnalisisEnriquecido) => {
    setAnalyses((prev) => [a, ...prev]);
  }, []);

  return (
    <AnalysisContext.Provider value={{
      analyses, ultimaLectura, idNodoActivo, nodos,
      isGenerating, loadingInit, errorInit, lecturaConImagen,
      setIsGenerating, addAnalysis, generarNuevoAnalisis,
      recargarAnalisis: cargarDatos, cambiarNodoActivo,
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
