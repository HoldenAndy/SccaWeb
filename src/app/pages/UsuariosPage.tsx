import { Users, UserPlus, Mail, Lock, User, Shield, Loader2, AlertCircle, Eye, EyeOff, RefreshCw } from "lucide-react";
import { useState } from "react";
import { type RolUsuario } from "../../api/auth";
import { useUsuarios } from "../hooks/useUsuarios";
import { PageHeader } from "../components/shared/PageHeader";
import { CredentialsModal } from "../components/shared/CredentialsModal";
import { RolBadge } from "../components/shared/RolBadge";
import { EmptyState } from "../components/shared/EmptyState";
import { Skeleton } from "../components/shared/Skeleton";
import { sanitizeText, sanitizeEmail, validateEmail, validateName } from "../../lib/sanitization";
import { toast } from "sonner";

const ROLES: { value: RolUsuario; label: string; fg: string; bg: string }[] = [
  { value: "ADMINISTRADOR", label: "Administrador", fg: "text-[var(--scca-danger)]", bg: "bg-[var(--scca-danger-bg)]" },
  { value: "CLIENTE",       label: "Cliente",       fg: "text-[var(--scca-accent)]", bg: "bg-[var(--scca-accent-soft)]" },
  { value: "SOPORTE",       label: "Soporte",       fg: "text-[var(--scca-warn)]",   bg: "bg-[var(--scca-warn-bg)]" },
  { value: "GESTIONADOR",   label: "Gestionador",   fg: "text-[#4a2570]",            bg: "bg-[#f4eef9]" },
];

function generarPasswordTemporal(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#";
  let pwd = "";
  for (let i = 0; i < 10; i++) pwd += chars[Math.floor(Math.random() * chars.length)];
  return pwd;
}

export function UsuariosPage() {
  const { usuarios, loading, error, creating, formError, recargar, crear, limpiarFormError } = useUsuarios();

  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState(() => generarPasswordTemporal());
  const [rol, setRol] = useState<RolUsuario>("CLIENTE");
  const [showPwd, setShowPwd] = useState(false);
  const [creds, setCreds] = useState<{ nombre: string; email: string; password: string; rol: RolUsuario } | null>(null);

  const handleCrear = async (e: React.FormEvent) => {
    e.preventDefault();
    limpiarFormError();
    const cleanNombre = sanitizeText(nombre);
    const cleanEmail = sanitizeEmail(email);
    if (!cleanNombre || !cleanEmail || !password) return;
    if (!validateName(cleanNombre)) return;
    if (!validateEmail(cleanEmail)) return;
    if (password.length < 6) return;
    try {
      const nuevo = await crear({ nombre: cleanNombre, email: cleanEmail, password, rol });
      setCreds({ nombre: nuevo.nombre, email: nuevo.email, password, rol: nuevo.rol });
      setNombre(""); setEmail(""); setPassword(generarPasswordTemporal()); setRol("CLIENTE");
      toast.success("Usuario creado", { description: `${nuevo.nombre} · ${nuevo.rol}` });
    } catch { /* formError viene del hook */ }
  };

  const inputBase = "w-full bg-[var(--scca-bg)] border border-[var(--scca-hair)] rounded-sm pl-8 pr-3 py-2 text-[13px] text-[var(--scca-ink)] placeholder:text-[var(--scca-faint)] focus:outline-none focus:border-[var(--scca-accent)] transition-colors";

  return (
    <div>
      <PageHeader
        title="Gestión de usuarios"
        subtitle="Cuentas con acceso al sistema y sus roles asociados. Solo administradores pueden crear o modificar."
        actions={
          <button onClick={recargar} disabled={loading}
            className="flex items-center gap-1.5 text-[11px] text-[var(--scca-ink-2)] border border-[var(--scca-hair)] rounded-sm px-3 py-1.5 hover:bg-[var(--scca-surface)] disabled:opacity-50 transition-colors">
            <RefreshCw size={11} strokeWidth={1.5} className={loading ? "animate-spin" : ""} /> Actualizar
          </button>
        }
      />

      <div className="px-4 md:px-8 py-6 grid grid-cols-1 lg:grid-cols-5 gap-5">
        <div className="lg:col-span-2">
          <div className="border border-[var(--scca-hair)] rounded-md p-5">
            <div className="scca-caps text-[var(--scca-accent)] mb-1 flex items-center gap-1.5">
              <UserPlus size={11} strokeWidth={1.5} /> Registrar
            </div>
            <h2 className="text-[15px] font-medium text-[var(--scca-ink)] mb-5">Nuevo usuario</h2>

            <form onSubmit={handleCrear} className="space-y-4">
              <div>
                <label className="scca-caps block mb-1.5">Nombre completo</label>
                <div className="relative">
                  <User size={12} strokeWidth={1.5} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--scca-muted)]" />
                  <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} required placeholder="Ej: Juan Pérez García" className={inputBase} />
                </div>
              </div>
              <div>
                <label className="scca-caps block mb-1.5">Correo electrónico</label>
                <div className="relative">
                  <Mail size={12} strokeWidth={1.5} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--scca-muted)]" />
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="usuario@correo.com" className={inputBase} />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="scca-caps">Contraseña temporal</label>
                  <button type="button" onClick={() => setPassword(generarPasswordTemporal())} className="text-[10.5px] text-[var(--scca-accent)] hover:underline font-medium">Regenerar</button>
                </div>
                <div className="relative">
                  <Lock size={12} strokeWidth={1.5} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--scca-muted)]" />
                  <input type={showPwd ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6}
                    className={`${inputBase} font-mono pr-8 tabular-nums`} />
                  <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--scca-muted)]">
                    {showPwd ? <EyeOff size={12} strokeWidth={1.5} /> : <Eye size={12} strokeWidth={1.5} />}
                  </button>
                </div>
                <p className="text-[10px] text-[var(--scca-faint)] mt-1">El usuario deberá cambiarla al primer inicio.</p>
              </div>
              <div>
                <label className="scca-caps block mb-1.5">Rol</label>
                <div className="grid grid-cols-2 gap-2">
                  {ROLES.map((r) => (
                    <button key={r.value} type="button" onClick={() => setRol(r.value)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-sm border text-[11px] font-medium transition-all ${
                        rol === r.value
                          ? `${r.bg} ${r.fg} border-current`
                          : "bg-[var(--scca-bg)] border-[var(--scca-hair)] text-[var(--scca-muted)] hover:bg-[var(--scca-surface)]"
                      }`}>
                      <Shield size={10} strokeWidth={1.5} />{r.label}
                    </button>
                  ))}
                </div>
              </div>
              {formError && (
                <div className="flex items-start gap-2 bg-[var(--scca-danger-bg)] border border-[var(--scca-hair)] rounded-sm px-3 py-2.5">
                  <AlertCircle size={12} strokeWidth={1.5} className="text-[var(--scca-danger)] mt-0.5 flex-shrink-0" />
                  <p className="text-[11px] text-[var(--scca-danger)]">{formError}</p>
                </div>
              )}
              <button type="submit" disabled={creating}
                className="w-full bg-[var(--scca-ink)] text-[var(--scca-bg)] font-medium rounded-sm py-2.5 text-[13px] hover:bg-[var(--scca-ink-2)] disabled:opacity-50 flex items-center justify-center gap-2 transition-colors">
                {creating ? <><Loader2 size={13} strokeWidth={1.5} className="animate-spin" /> Creando…</> : <><UserPlus size={13} strokeWidth={1.5} /> Crear usuario</>}
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-5">
          <div className="border border-[var(--scca-hair)] rounded-md overflow-hidden">
            <div className="px-4 py-3 border-b border-[var(--scca-hair)] flex items-center justify-between">
              <h2 className="text-[12px] font-medium text-[var(--scca-ink)]">Usuarios registrados</h2>
              <span className="text-[10.5px] text-[var(--scca-muted)] font-mono">{usuarios.length} usuarios</span>
            </div>
            {loading ? (
              <div className="p-3 space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 py-2">
                    <Skeleton width={26} height={26} rounded="sm" />
                    <div className="flex-1">
                      <Skeleton width="35%" height={13} className="mb-1.5" />
                      <Skeleton width="60%" height={11} />
                    </div>
                    <Skeleton width={70} height={14} />
                  </div>
                ))}
              </div>
            ) : error ? (
              <EmptyState Icon={AlertCircle} title="Error al cargar usuarios" body={error} action={<button onClick={recargar} className="text-[11px] font-medium text-[var(--scca-accent)] hover:underline">Reintentar</button>} />
            ) : usuarios.length === 0 ? (
              <EmptyState Icon={Users} title="Sin usuarios todavía" body="Crea el primer usuario usando el formulario de la izquierda. Si es un administrador, podrá registrar más después." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-[var(--scca-surface)]">
                      {["ID", "Nombre", "Correo", "Rol"].map((h) => (
                        <th key={h} className="scca-caps text-left px-4 py-2.5 border-b border-[var(--scca-hair)]">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {usuarios.map((u, i) => (
                      <tr key={u.idUsuario}
                          className={`hover:bg-[var(--scca-surface)] transition-colors ${i < usuarios.length - 1 ? "border-b border-[var(--scca-hair-soft)]" : ""} ${i % 2 === 1 ? "bg-[var(--scca-zebra)]" : ""}`}>
                        <td className="px-4 py-3 text-[11px] text-[var(--scca-faint)] font-mono">U{String(u.idUsuario).padStart(4, "0")}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-6 h-6 rounded-sm bg-[var(--scca-ink)] text-[var(--scca-bg)] flex items-center justify-center text-[10px] font-semibold flex-shrink-0">
                              {u.nombre.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-[13px] font-medium text-[var(--scca-ink)]">{u.nombre}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-[11.5px] text-[var(--scca-muted)] font-mono">{u.email}</td>
                        <td className="px-4 py-3"><RolBadge rol={u.rol} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="border border-[var(--scca-hair)] rounded-md p-5">
            <div className="scca-caps mb-3">Permisos por rol</div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { rol: "ADMINISTRADOR" as RolUsuario, perms: ["Gestionar usuarios", "Ver nodos", "Ver logs", "Todo el sistema"] },
                { rol: "SOPORTE"        as RolUsuario, perms: ["Registrar nodos", "Ver lecturas", "Ver logs"] },
                { rol: "GESTIONADOR"    as RolUsuario, perms: ["Nodos asignados", "Ver lecturas", "Análisis IA"] },
                { rol: "CLIENTE"        as RolUsuario, perms: ["Sus nodos", "Historial personal"] },
              ].map(({ rol: r, perms }) => {
                const meta = ROLES.find((x) => x.value === r)!;
                return (
                  <div key={r} className="border border-[var(--scca-hair)] rounded-sm p-3">
                    <div className={`flex items-center gap-1.5 mb-2 ${meta.fg}`}>
                      <Shield size={10} strokeWidth={1.5} />
                      <span className="text-[10px] font-semibold uppercase tracking-[0.08em]">{meta.label}</span>
                    </div>
                    <ul className="space-y-0.5">
                      {perms.map((p) => (
                        <li key={p} className="text-[11px] text-[var(--scca-ink-2)] flex items-center gap-1.5">
                          <span className={`w-1 h-1 rounded-full ${meta.fg.replace("text-", "bg-")}`} />{p}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {creds && <CredentialsModal creds={creds} onClose={() => setCreds(null)} />}
    </div>
  );
}
