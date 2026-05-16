import { Waves } from "lucide-react";

/**
 * PageHeader — encabezado estándar de página con icono Waves, título y subtítulo.
 *
 * Antes estaba copy-pasteado en las 5 páginas con el mismo JSX.
 * Cualquier cambio de estilo del encabezado (color del icono, tamaño del título)
 * ahora se aplica en un solo lugar.
 */

interface Props {
  title: string;
  subtitle: string;
  /** Acción opcional alineada a la derecha (botones, selectores, etc.) */
  actions?: React.ReactNode;
}

export function PageHeader({ title, subtitle, actions }: Props) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div>
        <div className="flex items-center gap-2 mb-0.5">
          <Waves size={18} className="text-cyan-500" />
          <h1 className="text-xl font-bold text-slate-800">{title}</h1>
        </div>
        <p className="text-sm text-slate-500 ml-6.5">{subtitle}</p>
      </div>
      {actions && (
        <div className="flex items-center gap-2 flex-wrap">
          {actions}
        </div>
      )}
    </div>
  );
}
