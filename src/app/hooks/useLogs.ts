import { useState, useCallback, useEffect } from "react";
import { getLogs, type LogDTO } from "../../api/logs";

export interface UseLogsResult {
  logs: LogDTO[];
  loading: boolean;
  error: string | null;
  recargar: () => Promise<void>;
}

export function useLogs(): UseLogsResult {
  const [logs, setLogs] = useState<LogDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const recargar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getLogs();
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
