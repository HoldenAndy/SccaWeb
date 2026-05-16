import { useState, useCallback, useEffect } from "react";
import {
  getHistorialPaginado, getDatosGraficos,
  type LecturaDTO, type PageResponse,
} from "../../api/lecturas";
import { evaluarLectura } from "../../domain/calidadAgua";
import { toLocalISOString, formatFechaTabla, isoToday, isoNDaysAgo } from "../../lib/fechas";

export type FilterMode = "Hoy" | "7 días" | "30 días" | "Personalizado";

/**
 * useHistorial — encapsula toda la lógica de datos de HistorialPage.
 *
 * Extraído de HistorialPage donde pageData, grafData, loadingTable,
 * loadingChart, errorData, cargarTabla, cargarGraficos y handleExportCSV
 * vivían mezclados con el JSX (≈120 líneas de lógica).
 *
 * La página queda responsable únicamente de renderizar.
 */
export interface UseHistorialResult {
  // Datos
  pageData: PageResponse<LecturaDTO> | null;
  grafData: LecturaDTO[];
  // Estados de carga
  loadingTable: boolean;
  loadingChart: boolean;
  errorData: string | null;
  // Filtros (controlados por la página via setters)
  filterMode: FilterMode;
  fromDate: string;
  toDate: string;
  customDatesEnabled: boolean;
  page: number;
  // Acciones
  setPage: (page: number) => void;
  setFromDate: (d: string) => void;
  setToDate: (d: string) => void;
  cambiarFiltroMode: (mode: FilterMode) => void;
  aplicarFiltroPersonalizado: () => void;
  exportarCSV: () => Promise<void>;
  recargar: () => void;
}

export function useHistorial(idNodo: number | null, loadingInit: boolean): UseHistorialResult {
  const [filterMode, setFilterMode]           = useState<FilterMode>("Hoy");
  const [fromDate, setFromDate]               = useState(isoToday());
  const [toDate, setToDate]                   = useState(isoToday());
  const [customDatesEnabled, setCustomDatesEnabled] = useState(false);
  const [page, setPage]                       = useState(0);

  const [pageData, setPageData]         = useState<PageResponse<LecturaDTO> | null>(null);
  const [loadingTable, setLoadingTable] = useState(false);
  const [grafData, setGrafData]         = useState<LecturaDTO[]>([]);
  const [loadingChart, setLoadingChart] = useState(false);
  const [errorData, setErrorData]       = useState<string | null>(null);

  // ── rango de fechas activo ────────────────────────────────────────────
  const getRange = useCallback((): [string, string] => {
    if (filterMode === "Personalizado") {
      return [
        toLocalISOString(new Date(`${fromDate}T00:00:00`)),
        toLocalISOString(new Date(`${toDate}T23:59:59`)),
      ];
    }
    const days = filterMode === "7 días" ? 7 : filterMode === "30 días" ? 30 : 1;
    const fin    = new Date();
    const inicio = new Date();
    inicio.setDate(inicio.getDate() - (days - 1));
    inicio.setHours(0, 0, 0, 0);
    return [toLocalISOString(inicio), toLocalISOString(fin)];
  }, [filterMode, fromDate, toDate]);

  // ── fetch tabla ────────────────────────────────────────────────────────
  const cargarTabla = useCallback(async () => {
    if (!idNodo || loadingInit) return;
    setLoadingTable(true);
    setErrorData(null);
    try {
      const [inicio, fin] = getRange();
      const data = await getHistorialPaginado(idNodo, inicio, fin, page, 8);
      setPageData(data);
    } catch (err: unknown) {
      setErrorData(err instanceof Error ? err.message : String(err));
    } finally { setLoadingTable(false); }
  }, [idNodo, loadingInit, page, getRange]);

  // ── fetch gráficos ─────────────────────────────────────────────────────
  const cargarGraficos = useCallback(async () => {
    if (!idNodo || loadingInit) return;
    setLoadingChart(true);
    try {
      const [inicio, fin] = getRange();
      const data = await getDatosGraficos(idNodo, inicio, fin);
      setGrafData(data);
    } catch { /* silencioso */ }
    finally { setLoadingChart(false); }
  }, [idNodo, loadingInit, getRange]);

  // Efectos separados: cambiar página no recarga gráficos
  useEffect(() => { cargarTabla(); }, [cargarTabla]);
  useEffect(() => { cargarGraficos(); }, [cargarGraficos]);

  // Reset de página al cambiar filtro
  useEffect(() => { setPage(0); }, [filterMode, fromDate, toDate]);

  // ── acciones de UI ─────────────────────────────────────────────────────
  const cambiarFiltroMode = useCallback((mode: FilterMode) => {
    setFilterMode(mode);
    setCustomDatesEnabled(mode === "Personalizado");
    if (mode === "7 días")  { setFromDate(isoNDaysAgo(7));  setToDate(isoToday()); }
    if (mode === "30 días") { setFromDate(isoNDaysAgo(30)); setToDate(isoToday()); }
    if (mode === "Hoy")     { setFromDate(isoToday());      setToDate(isoToday()); }
  }, []);

  const aplicarFiltroPersonalizado = useCallback(() => {
    cargarTabla();
    cargarGraficos();
  }, [cargarTabla, cargarGraficos]);

  const recargar = useCallback(() => {
    cargarTabla();
    cargarGraficos();
  }, [cargarTabla, cargarGraficos]);

  // ── export CSV ────────────────────────────────────────────────────────
  const exportarCSV = useCallback(async () => {
    if (!idNodo) return;
    try {
      const [inicio, fin] = getRange();
      const data = await getDatosGraficos(idNodo, inicio, fin);
      if (!data.length) return;

      const headers = ["ID Lectura", "Fecha / Hora", "pH", "Temperatura (°C)", "Turbidez (NTU)", "TDS (ppm)", "Estado"];
      const rows = data.map((r) => [
        r.idLectura,
        formatFechaTabla(r.fechaHora),
        r.ph, r.temperatura, r.turbidez, r.tds,
        evaluarLectura(r) === "critical" ? "Crítico" : evaluarLectura(r) === "warning" ? "Aviso" : "Normal",
      ]);

      const csv  = [headers, ...rows].map((row) => row.map((v) => `"${v}"`).join(",")).join("\n");
      const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = `historial_nodo${idNodo}_${fromDate}_${toDate}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch { /* silencioso */ }
  }, [idNodo, getRange, fromDate, toDate]);

  return {
    pageData, grafData,
    loadingTable, loadingChart, errorData,
    filterMode, fromDate, toDate, customDatesEnabled, page,
    setPage, setFromDate, setToDate,
    cambiarFiltroMode, aplicarFiltroPersonalizado, exportarCSV, recargar,
  };
}
