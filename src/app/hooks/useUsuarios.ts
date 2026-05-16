import { useState, useCallback, useEffect } from "react";
import { getUsuarios, crearUsuario, type UsuarioDTO, type UsuarioRequest } from "../../api/auth";

/**
 * useUsuarios — encapsula el fetch y la creación de usuarios.
 *
 * Extraído de UsuariosPage donde loading/error/data vivían mezclados con el JSX.
 * El componente ahora solo se ocupa de renderizar.
 */
export interface UseUsuariosResult {
  usuarios: UsuarioDTO[];
  loading: boolean;
  error: string | null;
  creating: boolean;
  formError: string | null;
  recargar: () => Promise<void>;
  crear: (req: UsuarioRequest) => Promise<UsuarioDTO>;
  limpiarFormError: () => void;
}

export function useUsuarios(): UseUsuariosResult {
  const [usuarios, setUsuarios] = useState<UsuarioDTO[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const recargar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getUsuarios();
      setUsuarios(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al cargar usuarios");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { recargar(); }, [recargar]);

  const crear = useCallback(async (req: UsuarioRequest): Promise<UsuarioDTO> => {
    setCreating(true);
    setFormError(null);
    try {
      const nuevo = await crearUsuario(req);
      setUsuarios((prev) => [...prev, nuevo]);
      return nuevo;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al crear usuario";
      const formMsg = msg.toLowerCase().includes("ya está registrado") || msg.includes("409")
        ? "Este correo ya está registrado en el sistema."
        : msg;
      setFormError(formMsg);
      throw new Error(formMsg);
    } finally {
      setCreating(false);
    }
  }, []);

  const limpiarFormError = useCallback(() => setFormError(null), []);

  return { usuarios, loading, error, creating, formError, recargar, crear, limpiarFormError };
}
