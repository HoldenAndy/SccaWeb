import {
  createContext, useContext, useState, useEffect, useCallback, ReactNode,
} from "react";
import { generarAnalisis, getAnalisisPorNodoPaginado, type AnalisisDTO } from "../../api/analisis";
import {
  getUltimaLectura, getHistorialPaginado,
  parseFechaBackend, toLocalISOString,
  type LecturaDTO,
} from "../../api/lecturas";
// FIX #3: eliminado getHistorialCompleto — pedía TODO el historial sin límite.
// Con dispositivos que envían lecturas cada pocos segundos durante meses,
// eso podía ser decenas de miles de registros solo para construir un Map de lookup.
// Ahora se usa getHistorialPaginado con un cap de 500 registros del último año,
// suficiente para enriquecer los análisis con sus valores de sensores.
import { getImagenPorLectura } from "../../api/imagenes";
import { getNodos, getMisNodos, type NodoDTO } from "../../api/nodos";
// Lógica de negocio centralizada en el dominio — elimina umbrales hardcodeados aquí.
import { detectarAlerta } from "../../domain/calidadAgua";

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
  nodos: NodoDTO[];
  isGenerating: boolean;
  loadingInit: boolean;
  errorInit: string | null;
  lecturaConImagen: boolean;
  generarNuevoAnalisis: () => Promise<void>;
  recargarAnalisis: () => Promise<void>;
  cambiarNodoActivo: (idNodo: number) => void;
}

// ─── helpers ──────────────────────────────────────────────────────────────

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

// ─── context ──────────────────────────────────────────────────────────────

const AnalysisContext = createContext<AnalysisContextType | undefined>(undefined);

// ─── provider ─────────────────────────────────────────────────────────────

interface AnalysisProviderProps {
  children: ReactNode;
  /** Token JWT proveniente de AuthProvider vía InnerApp. Null = sin sesión. */
  token: string | null;
}

export function AnalysisProvider({ children, token }: AnalysisProviderProps) {
  const [analyses, setAnalyses]                 = useState<AnalisisEnriquecido[]>([]);
  const [ultimaLectura, setUltimaLectura]       = useState<LecturaDTO | null>(null);
  const [idNodoActivo, setIdNodoActivo]         = useState<number | null>(null);
  const [nodos, setNodos]                       = useState<NodoDTO[]>([]);
  const [lecturaMap, setLecturaMap]             = useState<Map<number, LecturaDTO>>(new Map());
  const [isGenerating, setIsGenerating]         = useState(false);
  const [loadingInit, setLoadingInit]           = useState(true);
  const [errorInit, setErrorInit]               = useState<string | null>(null);
  const [lecturaConImagen, setLecturaConImagen] = useState(false);

  const cargarDatosDeNodo = useCallback(async (idNodo: number) => {
    setLoadingInit(true);
    try {
      // 1. Última lectura
      let ultima: LecturaDTO | null = null;
      try {
        ultima = await getUltimaLectura(idNodo);
        setUltimaLectura(ultima);
      } catch {
        setUltimaLectura(null);
      }

      // 2. Verificar imagen asociada
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

      // 3. Mapa idLectura → sensores (para enriquecer análisis con valores reales)
      // FIX #3: antes se llamaba getHistorialCompleto sin ningún límite de registros.
      // Ahora pedimos máximo 500 lecturas del último año — cubre todos los análisis
      // que se cargan en el paso 4 (también del último año, máx 50) con margen amplio,
      // sin arriesgar traer decenas de miles de filas de un dispositivo muy activo.
      const map = new Map<number, LecturaDTO>();
      try {
        const fin    = new Date();
        const inicio = new Date(fin);
        inicio.setFullYear(inicio.getFullYear() - 1);
        const page = await getHistorialPaginado(
          idNodo,
          toLocalISOString(inicio),
          toLocalISOString(fin),
          0,
          500,
          "fechaHora",
          "desc",
        );
        for (const l of page.content) map.set(l.idLectura, l);
        if (ultima) map.set(ultima.idLectura, ultima);
      } catch { /* sin lecturas */ }
      setLecturaMap(map);

      // 4. Historial de análisis del nodo (último año)
      try {
        const fin    = new Date();
        const inicio = new Date(fin);
        inicio.setFullYear(inicio.getFullYear() - 1);
        const page = await getAnalisisPorNodoPaginado(
          idNodo,
          toLocalISOString(inicio),
          toLocalISOString(fin),
          0, 50
        );
        setAnalyses(page.content.map((a) => enriquecer(a, map)));
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

  // Solo se dispara cuando el token cambia:
  // - null  → limpiar todo (logout)
  // - valor → cargar datos del backend
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
      setAnalyses((prev) => [enriquecer(dto, nuevaMap), ...prev]);
    } finally {
      setIsGenerating(false);
    }
  }, [ultimaLectura, lecturaMap]);

  return (
    <AnalysisContext.Provider value={{
      analyses, ultimaLectura, idNodoActivo, nodos,
      isGenerating, loadingInit, errorInit, lecturaConImagen,
      generarNuevoAnalisis,
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
