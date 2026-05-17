import { useState, useEffect, useCallback } from "react";
import { getDatosGraficos, type LecturaDTO } from "../../api/lecturas";
import { toLocalISOString } from "../../lib/fechas";
import { DASHBOARD } from "../../lib/config";

export interface UseDatosGraficosResult {
  chartData: LecturaDTO[];
  loadingChart: boolean;
  recargar: () => Promise<void>;
}

export function useDatosGraficos(idNodo: number | null): UseDatosGraficosResult {
  const [chartData, setChartData] = useState<LecturaDTO[]>([]);
  const [loadingChart, setLoadingChart] = useState(false);

  const recargar = useCallback(async () => {
    if (!idNodo) return;
    setLoadingChart(true);
    try {
      const fin = new Date();
      const inicio = new Date(fin.getTime() - DASHBOARD.CHART_WINDOW_MS);
      const data = await getDatosGraficos(idNodo, toLocalISOString(inicio), toLocalISOString(fin));
      setChartData(data);
    } catch { /* silencioso */ }
    finally { setLoadingChart(false); }
  }, [idNodo]);

  useEffect(() => {
    recargar();
    const t = setInterval(() => {
      if (!document.hidden) recargar();
    }, DASHBOARD.POLLING_MS);
    return () => clearInterval(t);
  }, [recargar]);

  return { chartData, loadingChart, recargar };
}
