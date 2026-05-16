import { useState, useCallback, useEffect } from "react";
import { apiFetch } from "../../api/apiClient";

/**
 * useLogs — encapsula el fetch de logs del servidor.
 *
 * Extraído de LogsPage donde loading/error/data vivían mezclados con el JSX.
 * LogsPage ahora solo se ocupa de filtrar y renderizar.
 *
 * La interfaz LogDTO se define aquí junto al hook porque es específica
 * de este dominio y no existe en la capa api/.
 */
export interface LogDTO {
  idLog: number;
  nivel: string;
  modulo: string;
  mensaje: string;
  fechaHora: string | number[];
}

export interface UseLogsResult {
  logs: LogDTO[];
  loading: boolean;
  error: string | null;
  recargar: () => Promise<void>;
}

export function useLogs(): UseLogsResult {
  const [logs, setLogs]     = useState<LogDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState<string | null>(null);

  const recargar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<LogDTO[]>("/api/v1/logs");
      setLogs(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al cargar los logs");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { recargar(); }, [recargar]);

  return { logs, loading, error, recargar };
}
