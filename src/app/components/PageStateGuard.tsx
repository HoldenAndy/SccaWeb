import { AlertTriangle, Loader2, WifiOff, ServerOff, Cpu } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { parseError } from "../../lib/errors";

interface Props {
  loadingInit: boolean;
  errorInit: string | null;
  loadingText?: string;
}

export function PageStateGuard({ loadingInit, errorInit, loadingText = "Cargando..." }: Props) {
  const { isCliente } = useAuth();

  if (loadingInit) {
    return (
      <div className="flex flex-col items-center justify-center min-h-64 gap-3">
        <Loader2 size={28} className="text-cyan-500 animate-spin" />
        <p className="text-sm text-slate-500">{loadingText}</p>
      </div>
    );
  }

  if (!errorInit) return null;

  const { code } = parseError(errorInit);

  if (code === "NO_NODES" && isCliente) {
    return (
      <div className="flex flex-col items-center justify-center min-h-64 gap-4">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center">
          <Cpu size={28} className="text-blue-400" />
        </div>
        <div className="text-center max-w-sm">
          <p className="text-base font-semibold text-slate-700 mb-1">Sin dispositivos asignados</p>
          <p className="text-sm text-slate-400 leading-relaxed">
            Aún no tienes ningún nodo ESP32 asociado a tu cuenta. Contacta al administrador del sistema para que registre tu dispositivo.
          </p>
        </div>
      </div>
    );
  }

  if (code === "NO_NODES") {
    return (
      <div className="flex flex-col items-center justify-center min-h-64 gap-4">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center">
          <Cpu size={28} className="text-amber-400" />
        </div>
        <div className="text-center max-w-sm">
          <p className="text-base font-semibold text-slate-700 mb-1">No hay nodos registrados</p>
          <p className="text-sm text-slate-400 leading-relaxed">
            No se encontraron nodos ESP32 en el sistema. Ve a la sección de administración para registrar el primer dispositivo.
          </p>
        </div>
      </div>
    );
  }

  if (code === "NO_CONNECTION") {
    return (
      <div className="flex flex-col items-center justify-center min-h-64 gap-4">
        <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center">
          <WifiOff size={28} className="text-red-400" />
        </div>
        <div className="text-center max-w-sm">
          <p className="text-base font-semibold text-slate-700 mb-1">Sin conexión al servidor</p>
          <p className="text-sm text-slate-400 leading-relaxed">
            No se pudo conectar con el backend. Verifica que el servidor esté corriendo en{" "}
            <code className="text-xs bg-slate-100 px-1 py-0.5 rounded">http://localhost:8080</code>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-64 gap-4">
      <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center">
        <ServerOff size={28} className="text-red-400" />
      </div>
      <div className="text-center max-w-sm">
        <p className="text-base font-semibold text-slate-700 mb-1">Error del servidor</p>
        <p className="text-sm text-slate-400 leading-relaxed">{errorInit}</p>
      </div>
      <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2">
        <AlertTriangle size={13} className="text-amber-500" />
        <p className="text-xs text-amber-700">Verifica que el backend esté activo en <code>localhost:8080</code></p>
      </div>
    </div>
  );
}
