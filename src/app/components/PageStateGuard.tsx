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
        <Loader2 size={20} strokeWidth={1.5} className="text-[var(--scca-muted)] animate-spin" />
        <p className="text-sm text-[var(--scca-muted)]">{loadingText}</p>
      </div>
    );
  }

  if (!errorInit) return null;
  const { code } = parseError(errorInit);

  const tile = (icon: React.ReactNode, title: string, body: React.ReactNode, extra?: React.ReactNode) => (
    <div className="flex flex-col items-center justify-center min-h-64 gap-4 px-6">
      <div className="w-14 h-14 rounded border border-[var(--scca-hair)] flex items-center justify-center bg-[var(--scca-surface)]">
        {icon}
      </div>
      <div className="text-center max-w-sm">
        <p className="text-[15px] font-medium text-[var(--scca-ink)]">{title}</p>
        <p className="text-[13px] text-[var(--scca-muted)] mt-1.5 leading-relaxed">{body}</p>
      </div>
      {extra}
    </div>
  );

  if (code === "NO_NODES" && isCliente) {
    return tile(
      <Cpu size={22} strokeWidth={1.5} className="text-[var(--scca-accent)]" />,
      "Sin dispositivos asignados",
      "Aún no tienes ningún nodo ESP32 asociado a tu cuenta. Contacta al administrador del sistema."
    );
  }

  if (code === "NO_NODES") {
    return tile(
      <Cpu size={22} strokeWidth={1.5} className="text-[var(--scca-warn)]" />,
      "No hay nodos registrados",
      "No se encontraron nodos ESP32 en el sistema. Registra el primer dispositivo desde el módulo de Nodos."
    );
  }

  if (code === "NO_CONNECTION") {
    return tile(
      <WifiOff size={22} strokeWidth={1.5} className="text-[var(--scca-danger)]" />,
      "Sin conexión al servidor",
      <>No se pudo conectar con el backend. Verifica que el servidor esté corriendo en <code className="font-mono text-[11px] bg-[var(--scca-surface)] px-1 py-0.5 rounded-sm">http://localhost:8080</code>.</>
    );
  }

  return tile(
    <ServerOff size={22} strokeWidth={1.5} className="text-[var(--scca-danger)]" />,
    "Error del servidor",
    errorInit,
    <div className="flex items-center gap-2 text-[11px] text-[var(--scca-warn)] bg-[var(--scca-warn-bg)] border border-[var(--scca-hair)] rounded px-3 py-1.5">
      <AlertTriangle size={12} strokeWidth={1.5} />
      <span>Verifica que el backend esté activo en <code className="font-mono">localhost:8080</code></span>
    </div>
  );
}
