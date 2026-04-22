interface WireframeAnnotationProps {
  label: string;
  className?: string;
}

export function WireframeAnnotation({ label, className = "" }: WireframeAnnotationProps) {
  return (
    <div className={`inline-flex items-center ${className}`}>
      <div className="flex items-center gap-1 bg-slate-700 text-white text-xs font-mono px-2 py-0.5 rounded-sm">
        <span className="text-slate-300">▸</span>
        <span>{label}</span>
      </div>
    </div>
  );
}

interface WireframeSectionProps {
  title: string;
  note?: string;
  children: React.ReactNode;
  className?: string;
  dashed?: boolean;
}

export function WireframeSection({
  title,
  note,
  children,
  className = "",
  dashed = true,
}: WireframeSectionProps) {
  return (
    <div className={`relative ${className}`}>
      {/* Section label */}
      <div className="flex items-center gap-2 mb-2">
        <WireframeAnnotation label={title} />
        {note && (
          <span className="text-xs font-mono text-slate-400 italic">{note}</span>
        )}
      </div>
      <div
        className={`${
          dashed
            ? "border-2 border-dashed border-slate-300 rounded-lg"
            : "border border-slate-200 rounded-lg"
        } bg-white`}
      >
        {children}
      </div>
    </div>
  );
}

export function WireframePlaceholder({
  label,
  height = "h-32",
  className = "",
}: {
  label: string;
  height?: string;
  className?: string;
}) {
  return (
    <div
      className={`${height} border-2 border-dashed border-slate-300 rounded-lg bg-slate-50 flex flex-col items-center justify-center gap-2 ${className}`}
    >
      <div className="w-8 h-8 border-2 border-dashed border-slate-300 rounded flex items-center justify-center">
        <span className="text-slate-400 text-lg">⊠</span>
      </div>
      <span className="text-xs font-mono text-slate-400 text-center px-2">{label}</span>
    </div>
  );
}

export function WireframeTag({ children, color = "slate" }: { children: React.ReactNode; color?: string }) {
  return (
    <span className="inline-flex items-center gap-1 border border-dashed border-slate-300 bg-slate-50 text-slate-500 text-xs font-mono px-2 py-0.5 rounded">
      {children}
    </span>
  );
}
