import { useState, useCallback, useEffect } from "react";
import {
  getHistorialPaginado, getDatosGraficos,
  type LecturaDTO, type PageResponse,
} from "../../api/lecturas";
import { toLocalISOString, isoToday, isoNDaysAgo } from "../../lib/fechas";
import { PAGINATION } from "../../lib/config";

export type FilterMode = "Hoy" | "7 días" | "30 días" | "Personalizado";

export interface UseHistorialResult {
  pageData: PageResponse<LecturaDTO> | null;
  grafData: LecturaDTO[];
  loadingTable: boolean;
  loadingChart: boolean;
  errorData: string | null;
  filterMode: FilterMode;
  fromDate: string;
  toDate: string;
  customDatesEnabled: boolean;
  page: number;
  setPage: (page: number) => void;
  setFromDate: (d: string) => void;
  setToDate: (d: string) => void;
  cambiarFiltroMode: (mode: FilterMode) => void;
  aplicarFiltroPersonalizado: () => void;
  recargar: () => void;
}

export function useHistorial(idNodo: number | null, loadingInit: boolean): UseHistorialResult {
  const [filterMode, setFilterMode] = useState<FilterMode>("Hoy");
  const [fromDate, setFromDate] = useState(isoToday());
  const [toDate, setToDate] = useState(isoToday());
  const [customDatesEnabled, setCustomDatesEnabled] = useState(false);
  const [page, setPage] = useState(0);

  const [pageData, setPageData] = useState<PageResponse<LecturaDTO> | null>(null);
  const [loadingTable, setLoadingTable] = useState(false);
  const [grafData, setGrafData] = useState<LecturaDTO[]>([]);
  const [loadingChart, setLoadingChart] = useState(false);
  const [errorData, setErrorData] = useState<string | null>(null);

  const getRange = useCallback((): [string, string] => {
    if (filterMode === "Personalizado") {
      return [
        toLocalISOString(new Date(`${fromDate}T00:00:00`)),
        toLocalISOString(new Date(`${toDate}T23:59:59`)),
      ];
    }
    const days = filterMode === "7 días" ? 7 : filterMode === "30 días" ? 30 : 1;
    const fin = new Date();
    const inicio = new Date();
    inicio.setDate(inicio.getDate() - (days - 1));
    inicio.setHours(0, 0, 0, 0);
    return [toLocalISOString(inicio), toLocalISOString(fin)];
  }, [filterMode, fromDate, toDate]);

  const cargarTabla = useCallback(async () => {
    if (!idNodo || loadingInit) return;
    setLoadingTable(true);
    setErrorData(null);
    try {
      const [inicio, fin] = getRange();
      const data = await getHistorialPaginado(idNodo, inicio, fin, page, PAGINATION.TABLE_PAGE_SIZE);
      setPageData(data);
    } catch (err: unknown) {
      setErrorData(err instanceof Error ? err.message : String(err));
    } finally { setLoadingTable(false); }
  }, [idNodo, loadingInit, page, getRange]);

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

  useEffect(() => { cargarTabla(); }, [cargarTabla]);
  useEffect(() => { cargarGraficos(); }, [cargarGraficos]);
  useEffect(() => { setPage(0); }, [filterMode, fromDate, toDate]);

  const cambiarFiltroMode = useCallback((mode: FilterMode) => {
    setFilterMode(mode);
    setCustomDatesEnabled(mode === "Personalizado");
    if (mode === "7 días") { setFromDate(isoNDaysAgo(7)); setToDate(isoToday()); }
    if (mode === "30 días") { setFromDate(isoNDaysAgo(30)); setToDate(isoToday()); }
    if (mode === "Hoy") { setFromDate(isoToday()); setToDate(isoToday()); }
  }, []);

  const aplicarFiltroPersonalizado = useCallback(() => {
    cargarTabla();
    cargarGraficos();
  }, [cargarTabla, cargarGraficos]);

  const recargar = useCallback(() => {
    cargarTabla();
    cargarGraficos();
  }, [cargarTabla, cargarGraficos]);

  return {
    pageData, grafData,
    loadingTable, loadingChart, errorData,
    filterMode, fromDate, toDate, customDatesEnabled, page,
    setPage, setFromDate, setToDate,
    cambiarFiltroMode, aplicarFiltroPersonalizado, recargar,
  };
}
