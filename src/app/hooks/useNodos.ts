import { useState, useCallback, useEffect } from "react";
import { getNodos, type NodoDTO } from "../../api/nodos";

export interface UseNodosResult {
  nodos: NodoDTO[];
  loading: boolean;
  error: string | null;
  recargar: () => Promise<void>;
}

export function useNodos(): UseNodosResult {
  const [nodos, setNodos] = useState<NodoDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const recargar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getNodos();
      setNodos(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al cargar nodos");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { recargar(); }, [recargar]);

  return { nodos, loading, error, recargar };
}
