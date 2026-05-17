import { Waves } from "lucide-react";

interface Props {
  title: string;
  subtitle: string;
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
