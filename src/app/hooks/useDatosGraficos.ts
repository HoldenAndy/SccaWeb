import { useState, useEffect, useCallback } from "react";
import { getDatosGraficos, type LecturaDTO } from "../../api/lecturas";
import { toLocalISOString } from "../../lib/fechas";

/** Ventana de tiempo que muestra el Dashboard en tiempo real */
const VENTANA_MS  = 2 * 60 * 60 * 1000; // 2 horas

/** Intervalo de refresco automático */
const POLLING_MS  = 30_000;              // 30 segundos

/**
 * useDatosGraficos — encapsula el fetch periódico de datos del sensor.
 *
 * Extraído de DashboardPage donde `chartData`, `loadingChart`,
 * `cargarGraficos` y el setInterval vivían mezclados con el JSX.
 *
 * Comportamiento:
 * - Carga datos de las últimas 2 horas al montar y cada 30 s.
 * - Usa Page Visibility API: omite la llamada si la pestaña está oculta
 *   para no desperdiciar requests mientras la app está en segundo plano.
 * - Se reinicia automáticamente cuando cambia el nodo activo.
 */
export interface UseDatosGraficosResult {
  chartData: LecturaDTO[];
  loadingChart: boolean;
  recargar: () => Promise<void>;
}

export function useDatosGraficos(idNodo: number | null): UseDatosGraficosResult {
  const [chartData, setChartData]     = useState<LecturaDTO[]>([]);
  const [loadingChart, setLoadingChart] = useState(false);

  const recargar = useCallback(async () => {
    if (!idNodo) return;
    setLoadingChart(true);
    try {
      const fin    = new Date();
      const inicio = new Date(fin.getTime() - VENTANA_MS);
      const data   = await getDatosGraficos(idNodo, toLocalISOString(inicio), toLocalISOString(fin));
      setChartData(data);
    } catch { /* silencioso — el Dashboard no bloquea por fallo del gráfico */ }
    finally { setLoadingChart(false); }
  }, [idNodo]);

  useEffect(() => {
    recargar();
    const t = setInterval(() => {
      if (!document.hidden) recargar();
    }, POLLING_MS);
    return () => clearInterval(t);
  }, [recargar]);

  return { chartData, loadingChart, recargar };
}
