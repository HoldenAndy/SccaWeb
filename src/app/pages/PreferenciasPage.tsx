import { Sun, Moon, Monitor, Maximize2, Minimize2 } from "lucide-react";
import { PageHeader } from "../components/shared/PageHeader";
import { useUIPrefs } from "../contexts/UIPrefsContext";
import { useNotifications } from "../contexts/NotificationsContext";
import { useAuth } from "../contexts/AuthContext";
import { RolBadge } from "../components/shared/RolBadge";

const Card = ({ label, title, desc, children }: { label: string; title: string; desc: string; children: React.ReactNode }) => (
  <section className="border border-[var(--scca-hair)] rounded-md p-5">
    <div className="scca-caps text-[var(--scca-accent)] mb-1">{label}</div>
    <h2 className="text-[16px] font-medium text-[var(--scca-ink)] tracking-[-0.01em]">{title}</h2>
    <p className="text-[12px] text-[var(--scca-muted)] mt-1 leading-relaxed max-w-[520px]">{desc}</p>
    <div className="mt-4">{children}</div>
  </section>
);

const Seg = <T extends string>({ value, onChange, options }: { value: T; onChange: (v: T) => void; options: { v: T; label: string; icon?: typeof Sun }[] }) => (
  <div className="inline-flex border border-[var(--scca-hair)] rounded-sm overflow-hidden">
    {options.map((o, i) => {
      const active = value === o.v;
      return (
        <button
          key={o.v}
          onClick={() => onChange(o.v)}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-[12px] transition-colors ${
            active ? "bg-[var(--scca-ink)] text-[var(--scca-bg)]" : "text-[var(--scca-ink-2)] hover:bg-[var(--scca-surface)]"
          } ${i > 0 ? "border-l border-[var(--scca-hair)]" : ""}`}
        >
          {o.icon && <o.icon size={12} strokeWidth={1.5} />}
          {o.label}
        </button>
      );
    })}
  </div>
);

export function PreferenciasPage() {
  const { theme, setTheme, density, setDensity, liveTail, setLiveTail } = useUIPrefs();
  const { items: notifs, clear: clearNotifs, markAllRead } = useNotifications();
  const { user } = useAuth();

  return (
    <div>
      <PageHeader
        title="Preferencias"
        subtitle="Ajusta la apariencia, densidad y notificaciones de tu cuenta. Las preferencias se guardan en tu navegador."
      />

      <div className="px-4 md:px-8 py-6 max-w-[820px] flex flex-col" style={{ gap: "var(--scca-section-gap)" }}>
        {/* Perfil */}
        <section className="border border-[var(--scca-hair)] rounded-md p-5">
          <div className="scca-caps text-[var(--scca-accent)] mb-1">Cuenta</div>
          <h2 className="text-[16px] font-medium text-[var(--scca-ink)] tracking-[-0.01em]">Perfil</h2>
          <p className="text-[12px] text-[var(--scca-muted)] mt-1">Tu sesión actual.</p>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded bg-[var(--scca-ink)] text-[var(--scca-bg)] flex items-center justify-center text-[14px] font-semibold">
                {user?.nombre?.charAt(0).toUpperCase() ?? "U"}
              </div>
              <div className="min-w-0">
                <p className="text-[14px] font-medium text-[var(--scca-ink)] truncate">{user?.nombre ?? "—"}</p>
                <p className="text-[11px] text-[var(--scca-muted)] font-mono truncate">{user?.email ?? "—"}</p>
              </div>
            </div>
            <div className="flex flex-col gap-2 text-[12px]">
              <div className="flex items-center justify-between">
                <span className="scca-caps">Rol</span>
                {user?.rol ? <RolBadge rol={user.rol} /> : <span className="text-[var(--scca-muted)]">—</span>}
              </div>
              <div className="flex items-center justify-between">
                <span className="scca-caps">Sesión</span>
                <span className="text-[var(--scca-ink-2)] font-mono">Activa</span>
              </div>
            </div>
          </div>
        </section>

        {/* Apariencia */}
        <Card
          label="Apariencia"
          title="Tema y densidad"
          desc="Cambia entre tema claro, oscuro o el del sistema. La densidad compacta reduce el espaciado para mostrar más datos en pantalla."
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
            <div>
              <div className="scca-caps mb-2">Tema</div>
              <Seg
                value={theme}
                onChange={(v) => setTheme(v as "light" | "dark" | "system")}
                options={[
                  { v: "light",  label: "Claro",  icon: Sun },
                  { v: "system", label: "Auto",   icon: Monitor },
                  { v: "dark",   label: "Oscuro", icon: Moon },
                ]}
              />
            </div>
            <div>
              <div className="scca-caps mb-2">Densidad</div>
              <Seg
                value={density}
                onChange={(v) => setDensity(v as "comfortable" | "compact")}
                options={[
                  { v: "comfortable", label: "Estándar", icon: Maximize2 },
                  { v: "compact",     label: "Compacta", icon: Minimize2 },
                ]}
              />
            </div>
          </div>
        </Card>

        {/* Notificaciones */}
        <Card
          label="Avisos"
          title="Notificaciones"
          desc="El sistema te avisa cuando un análisis IA termina, cuando un nodo se desconecta o cuando un parámetro sale del rango seguro."
        >
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="text-[12px] text-[var(--scca-ink-2)]">
              <strong className="text-[var(--scca-ink)]">{notifs.length}</strong> {notifs.length === 1 ? "notificación" : "notificaciones"} en memoria
              {notifs.length > 0 && <span className="text-[var(--scca-muted)] ml-1.5">· {notifs.filter((n) => !n.read).length} sin leer</span>}
            </div>
            <div className="flex gap-2">
              {notifs.some((n) => !n.read) && (
                <button onClick={markAllRead} className="text-[11px] text-[var(--scca-accent)] border border-[var(--scca-hair)] rounded-sm px-3 py-1.5 hover:bg-[var(--scca-surface)] transition-colors">
                  Marcar todas leídas
                </button>
              )}
              {notifs.length > 0 && (
                <button onClick={clearNotifs} className="text-[11px] text-[var(--scca-danger)] border border-[var(--scca-hair)] rounded-sm px-3 py-1.5 hover:bg-[var(--scca-danger-bg)] transition-colors">
                  Limpiar todas
                </button>
              )}
            </div>
          </div>
        </Card>

        {/* Live tail */}
        <Card
          label="Operación"
          title="Auto-actualización de Logs"
          desc="Cuando está activa, el módulo de Registros refresca cada 5 segundos y resalta brevemente las filas nuevas (estilo tail)."
        >
          <button
            onClick={() => setLiveTail(!liveTail)}
            className={`flex items-center gap-2 text-[12px] rounded-sm px-3 py-2 border transition-colors ${
              liveTail
                ? "bg-[var(--scca-ok-bg)] border-[var(--scca-hair)] text-[var(--scca-ok)]"
                : "bg-[var(--scca-bg)] border-[var(--scca-hair)] text-[var(--scca-ink-2)] hover:bg-[var(--scca-surface)]"
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${liveTail ? "bg-[var(--scca-ok)] animate-pulse" : "bg-[var(--scca-faint)]"}`} />
            Auto-actualización {liveTail ? "activa" : "desactivada"}
          </button>
        </Card>

        <p className="text-[11px] text-[var(--scca-faint)] text-center pt-2">
          Las preferencias se guardan localmente en este navegador. Cerrar sesión no las borra.
        </p>
      </div>
    </div>
  );
}
