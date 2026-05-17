import { Users, UserPlus, Mail, Lock, User, Shield, Loader2, AlertCircle, Eye, EyeOff, RefreshCw } from "lucide-react";
import { useState } from "react";
import { type RolUsuario } from "../../api/auth";
import { useUsuarios } from "../hooks/useUsuarios";
import { PageHeader } from "../components/shared/PageHeader";
import { CredentialsModal } from "../components/shared/CredentialsModal";
import { RolBadge } from "../components/shared/RolBadge";
import { sanitizeText, sanitizeEmail, validateEmail, validateName } from "../../lib/sanitization";

const ROLES: { value: RolUsuario; label: string; color: string; bg: string }[] = [
  { value: "ADMINISTRADOR", label: "Administrador", color: "text-red-600", bg: "bg-red-50 border-red-200" },
  { value: "CLIENTE", label: "Cliente", color: "text-blue-600", bg: "bg-blue-50 border-blue-200" },
  { value: "SOPORTE", label: "Soporte", color: "text-amber-600", bg: "bg-amber-50 border-amber-200" },
  { value: "GESTIONADOR", label: "Gestionador", color: "text-violet-600", bg: "bg-violet-50 border-violet-200" },
];

function generarPasswordTemporal(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#";
  let pwd = "";
  for (let i = 0; i < 10; i++) {
    pwd += chars[Math.floor(Math.random() * chars.length)];
  }
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
      setNombre("");
      setEmail("");
      setPassword(generarPasswordTemporal());
      setRol("CLIENTE");
    } catch {
      // formError is set by the hook
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestión de Usuarios"
        subtitle="Registra nuevos usuarios y administra el acceso al sistema"
        actions={
          <button onClick={recargar} disabled={loading}
            className="flex items-center gap-1.5 text-xs text-slate-600 bg-white border border-slate-200 rounded-lg px-3 py-2 hover:bg-slate-50 shadow-sm disabled:opacity-50">
            <RefreshCw size={12} className={loading ? "animate-spin" : ""} /> Actualizar
          </button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-lg bg-cyan-50 border border-cyan-100 flex items-center justify-center"><UserPlus size={15} className="text-cyan-600" /></div>
              <h2 className="text-sm font-semibold text-slate-800">Registrar nuevo usuario</h2>
            </div>
            <form onSubmit={handleCrear} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Nombre completo</label>
                <div className="relative">
                  <User size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} required placeholder="Ej: Juan Pérez García"
                    className="w-full border border-slate-200 rounded-xl pl-8.5 pr-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-100 transition" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Correo electrónico</label>
                <div className="relative">
                  <Mail size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="usuario@correo.com"
                    className="w-full border border-slate-200 rounded-xl pl-8.5 pr-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-100 transition" />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-slate-600">Contraseña temporal</label>
                  <button type="button" onClick={() => setPassword(generarPasswordTemporal())} className="text-xs text-cyan-600 hover:text-cyan-700 font-medium">Regenerar</button>
                </div>
                <div className="relative">
                  <Lock size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type={showPwd ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6}
                    className="w-full border border-slate-200 rounded-xl pl-8.5 pr-10 py-2.5 text-sm text-slate-800 font-mono focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-100 transition" />
                  <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showPwd ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                </div>
                <p className="text-xs text-slate-400 mt-1">El usuario deberá cambiarla al primer inicio de sesión.</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Rol en el sistema</label>
                <div className="grid grid-cols-2 gap-2">
                  {ROLES.map((r) => (
                    <button key={r.value} type="button" onClick={() => setRol(r.value)}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-medium transition-all ${rol === r.value ? `${r.bg} ${r.color} ring-2 ring-current ring-offset-1` : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100"}`}>
                      <Shield size={11} />{r.label}
                    </button>
                  ))}
                </div>
              </div>
              {formError && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-xl px-3 py-2.5">
                  <AlertCircle size={13} className="text-red-500 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-red-600">{formError}</p>
                </div>
              )}
              <button type="submit" disabled={creating}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 disabled:opacity-50 text-white font-semibold rounded-xl py-2.5 text-sm transition-all shadow-sm flex items-center justify-center gap-2">
                {creating ? <><Loader2 size={14} className="animate-spin" /> Creando cuenta...</> : <><UserPlus size={14} /> Crear usuario</>}
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-800">Usuarios registrados</h2>
              <span className="text-xs text-slate-400 bg-slate-100 rounded-full px-2.5 py-1 font-medium">{usuarios.length} usuarios</span>
            </div>
            {loading ? (
              <div className="flex items-center justify-center py-16 gap-2"><Loader2 size={20} className="text-cyan-500 animate-spin" /><span className="text-sm text-slate-400">Cargando usuarios...</span></div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-16 gap-2"><AlertCircle size={20} className="text-red-400" /><p className="text-sm text-red-500">{error}</p></div>
            ) : usuarios.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-2 text-slate-400"><Users size={28} className="opacity-30" /><p className="text-sm">No hay usuarios registrados</p></div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead><tr className="text-xs text-slate-500 bg-slate-50 border-b border-slate-100">
                    <th className="text-left px-5 py-3 font-medium">ID</th>
                    <th className="text-left px-5 py-3 font-medium">Nombre</th>
                    <th className="text-left px-5 py-3 font-medium">Correo</th>
                    <th className="text-left px-5 py-3 font-medium">Rol</th>
                  </tr></thead>
                  <tbody className="divide-y divide-slate-50">
                    {usuarios.map((u) => (
                      <tr key={u.idUsuario} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-5 py-3.5 text-xs text-slate-400 font-mono">#{u.idUsuario}</td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center flex-shrink-0">
                              <span className="text-xs font-bold text-white">{u.nombre.charAt(0).toUpperCase()}</span>
                            </div>
                            <span className="text-sm font-medium text-slate-700">{u.nombre}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-sm text-slate-500">{u.email}</td>
                        <td className="px-5 py-3.5"><RolBadge rol={u.rol} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          <div className="mt-4 bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
            <h3 className="text-xs font-semibold text-slate-600 mb-3 uppercase tracking-wide">Permisos por rol</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { rol: "ADMINISTRADOR" as RolUsuario, permisos: ["Gestionar usuarios", "Ver nodos", "Ver logs", "Todo el sistema"] },
                { rol: "SOPORTE" as RolUsuario, permisos: ["Registrar nodos", "Ver lecturas", "Ver logs del sistema"] },
                { rol: "GESTIONADOR" as RolUsuario, permisos: ["Ver nodos asignados", "Ver lecturas", "Análisis IA"] },
                { rol: "CLIENTE" as RolUsuario, permisos: ["Ver sus propios nodos", "Historial personal"] },
              ].map(({ rol: r, permisos }) => {
                const meta = ROLES.find((x) => x.value === r)!;
                return (
                  <div key={r} className={`rounded-xl border p-3 ${meta.bg}`}>
                    <div className={`flex items-center gap-1.5 mb-2 ${meta.color}`}><Shield size={11} /><span className="text-xs font-semibold">{meta.label}</span></div>
                    <ul className="space-y-0.5">
                      {permisos.map((p) => (
                        <li key={p} className="text-xs text-slate-500 flex items-center gap-1"><span className={`w-1 h-1 rounded-full ${meta.color.replace("text-", "bg-")}`}></span>{p}</li>
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
