import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { Bell, AlertTriangle, Info, CheckCircle2, XCircle, Check } from "lucide-react";
import { useNotifications, type NotifKind } from "../../contexts/NotificationsContext";

const META: Record<NotifKind, { icon: typeof Bell; fg: string; bg: string }> = {
  info:     { icon: Info,          fg: "text-[var(--scca-accent)]", bg: "bg-[var(--scca-accent-soft)]" },
  warning:  { icon: AlertTriangle, fg: "text-[var(--scca-warn)]",   bg: "bg-[var(--scca-warn-bg)]" },
  critical: { icon: XCircle,       fg: "text-[var(--scca-danger)]", bg: "bg-[var(--scca-danger-bg)]" },
  success:  { icon: CheckCircle2,  fg: "text-[var(--scca-ok)]",     bg: "bg-[var(--scca-ok-bg)]" },
};

function ago(ts: number): string {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} h`;
  return `${Math.floor(h / 24)} d`;
}

export function NotificationsBell() {
  const { items, unread, markRead, markAllRead, dismiss } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return;
    const handle = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-1.5 rounded hover:bg-[var(--scca-surface)] transition-colors"
        title="Notificaciones"
      >
        <Bell size={15} strokeWidth={1.5} className="text-[var(--scca-ink-2)]" />
        {unread > 0 && (
          <span className="absolute top-0.5 right-0.5 min-w-[14px] h-[14px] rounded-full bg-[var(--scca-danger)] text-[9px] font-semibold text-white flex items-center justify-center px-1">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 w-[340px] bg-[var(--scca-panel)] border border-[var(--scca-hair)] rounded-md z-50 overflow-hidden scca-fade-in">
          <div className="px-3 py-2.5 border-b border-[var(--scca-hair)] flex items-center justify-between">
            <div>
              <p className="text-[12.5px] font-medium text-[var(--scca-ink)]">Notificaciones</p>
              <p className="text-[10px] text-[var(--scca-muted)] mt-0.5">{unread > 0 ? `${unread} sin leer` : "Todas leídas"}</p>
            </div>
            {items.length > 0 && (
              <button
                onClick={markAllRead}
                className="text-[10.5px] text-[var(--scca-accent)] hover:underline flex items-center gap-1"
              >
                <Check size={11} strokeWidth={1.5} /> Marcar todas
              </button>
            )}
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {items.length === 0 ? (
              <p className="text-[11.5px] text-[var(--scca-muted)] text-center py-10 px-6">
                Sin notificaciones todavía. Aparecerán aquí los avisos de calidad, nodos desconectados y análisis listos.
              </p>
            ) : items.map((n, i) => {
              const meta = META[n.kind];
              return (
                <button
                  key={n.id}
                  onClick={() => { markRead(n.id); if (n.href) { navigate(n.href); setOpen(false); } }}
                  className={`w-full text-left px-3 py-2.5 flex items-start gap-2.5 ${i < items.length - 1 ? "border-b border-[var(--scca-hair-soft)]" : ""} ${!n.read ? "bg-[var(--scca-accent-soft)]/30" : "bg-transparent hover:bg-[var(--scca-surface)]"} transition-colors`}
                >
                  <div className={`w-6 h-6 rounded-sm ${meta.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                    <meta.icon size={11} strokeWidth={1.5} className={meta.fg} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className={`text-[12px] ${!n.read ? "font-semibold" : "font-medium"} text-[var(--scca-ink)] truncate`}>{n.title}</p>
                      <span className="text-[10px] text-[var(--scca-muted)] font-mono flex-shrink-0">{ago(n.createdAt)}</span>
                    </div>
                    {n.body && <p className="text-[11px] text-[var(--scca-muted)] mt-0.5 leading-snug line-clamp-2">{n.body}</p>}
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); dismiss(n.id); }}
                    className="text-[var(--scca-faint)] hover:text-[var(--scca-ink)] text-[14px] leading-none p-0.5"
                    title="Descartar"
                  >×</button>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
