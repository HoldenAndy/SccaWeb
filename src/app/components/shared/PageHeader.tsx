interface Props {
  title: string;
  subtitle: string;
  actions?: React.ReactNode;
}

export function PageHeader({ title, subtitle, actions }: Props) {
  return (
    <div className="border-b border-[var(--scca-hair)] px-4 md:px-8 py-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-[26px] font-medium text-[var(--scca-ink)] tracking-[-0.02em] leading-[1.1]">
            {title}
          </h1>
          <p className="text-[13px] text-[var(--scca-muted)] mt-2 max-w-[640px] leading-snug">
            {subtitle}
          </p>
        </div>
        {actions && <div className="flex items-center gap-2 flex-wrap flex-shrink-0">{actions}</div>}
      </div>
    </div>
  );
}
