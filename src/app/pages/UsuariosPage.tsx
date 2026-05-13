import { useState, useEffect, useCallback } from "react";
import {
  Users, UserPlus, Mail, Lock, User, Shield,
  CheckCircle2, Copy, Loader2, AlertCircle, Eye, EyeOff, RefreshCw, X,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import {
  getUsuarios, crearUsuario,
  type UsuarioDTO, type UsuarioRequest, type RolUsuario,
} from "../../api/auth";

const ROLES: { value: RolUsuario; label: string; color: string; bg: string }[] = [
  { value: "ADMINISTRADOR", label: "Administrador", color: "text-red-600",    bg: "bg-red-50 border-red-200"     },
  { value: "CLIENTE",       label: "Cliente",        color: "text-blue-600",   bg: "bg-blue-50 border-blue-200"   },
  { value: "SOPORTE",       label: "Soporte",        color: "text-amber-600",  bg: "bg-amber-50 border-amber-200" },
  { value: "GESTIONADOR",   label: "Gestionador",    color: "text-violet-600", bg: "bg-violet-50 border-violet-200" },
];

function RolBadge({ rol }: { rol: RolUsuario }) {
  const meta = ROLES.find((r) => r.value === rol) ?? ROLES[1];
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border ${meta.bg} ${meta.color}`}>
      <Shield size={10} />
      {meta.label}
    </span>
  );
}

/** Genera una contraseña temporal segura */
function generarPasswordTemporal(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#";
  let pwd = "";
  for (let i = 0; i < 10; i++) {
    pwd += chars[Math.floor(Math.random() * chars.length)];
  }
  return pwd;
}

interface CredencialesModal {
  nombre: string;
  email: string;
  password: string;
  rol: RolUsuario;
}

export function UsuariosPage() {
  const { token } = useAuth();

  /* ─── Estados ────────────────────────────────────────────────────────── */
  const [usuarios, setUsuarios]   = useState<UsuarioDTO[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);

  // Form
  const [nombre, setNombre]       = useState("");
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState(generarPasswordTemporal());
  const [rol, setRol]             = useState<RolUsuario>("CLIENTE");
  const [showPwd, setShowPwd]     = useState(false);
  const [creating, setCreating]   = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Modal de credenciales
  const [creds, setCreds] = useState<CredencialesModal | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  /* ─── Cargar usuarios ────────────────────────────────────────────────── */
  const cargar = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getUsuarios(token);
      setUsuarios(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al cargar usuarios");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { cargar(); }, [cargar]);

  /* ─── Crear usuario ──────────────────────────────────────────────────── */
  const handleCrear = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!nombre.trim() || !email.trim() || !password.trim()) {
      setFormError("Completa todos los campos.");
      return;
    }
    if (password.length < 6) {
      setFormError("La contraseña temporal debe tener al menos 6 caracteres.");
      return;
    }

    setCreating(true);
    try {
      const req: UsuarioRequest = { nombre: nombre.trim(), email: email.trim(), password, rol };
      const nuevo = await crearUsuario(req, token!);
      setUsuarios((prev) => [...prev, nuevo]);

      // Mostrar modal con credenciales
      setCreds({ nombre: nuevo.nombre, email: nuevo.email, password, rol: nuevo.rol });

      // Resetear form
      setNombre("");
      setEmail("");
      setPassword(generarPasswordTemporal());
      setRol("CLIENTE");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al crear usuario";
      if (msg.toLowerCase().includes("ya está registrado") || msg.includes("409")) {
        setFormError("Este correo ya está registrado en el sistema.");
      } else {
        setFormError(msg);
      }
    } finally {
      setCreating(false);
    }
  };

  /* ─── Copiar al portapapeles ────────────────────────────────────────── */
  const copyToClipboard = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      /* fallback silencioso */
    }
  };

  /* ─── Render ─────────────────────────────────────────────────────────── */
  return (
    <div className="space-y-6" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <Users size={20} className="text-cyan-500" />
            <h1 className="text-xl font-bold text-slate-800">Gestión de Usuarios</h1>
          </div>
          <p className="text-sm text-slate-500 ml-7">Registra nuevos usuarios y administra el acceso al sistema</p>
        </div>
        <button
          onClick={cargar}
          disabled={loading}
          className="flex items-center gap-1.5 text-xs text-slate-600 bg-white border border-slate-200 rounded-lg px-3 py-2 hover:bg-slate-50 shadow-sm disabled:opacity-50"
        >
          <RefreshCw size={12} className={loading ? "animate-spin" : ""} /> Actualizar
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* ── Formulario de registro ─────────────────────────────────── */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-lg bg-cyan-50 border border-cyan-100 flex items-center justify-center">
                <UserPlus size={15} className="text-cyan-600" />
              </div>
              <h2 className="text-sm font-semibold text-slate-800">Registrar nuevo usuario</h2>
            </div>

            <form onSubmit={handleCrear} className="space-y-4">
              {/* Nombre */}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Nombre completo</label>
                <div className="relative">
                  <User size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    required
                    placeholder="Ej: Juan Pérez García"
                    className="w-full border border-slate-200 rounded-xl pl-8.5 pr-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-100 transition"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Correo electrónico</label>
                <div className="relative">
                  <Mail size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="usuario@correo.com"
                    className="w-full border border-slate-200 rounded-xl pl-8.5 pr-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-100 transition"
                  />
                </div>
              </div>

              {/* Contraseña temporal */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-slate-600">Contraseña temporal</label>
                  <button
                    type="button"
                    onClick={() => setPassword(generarPasswordTemporal())}
                    className="text-xs text-cyan-600 hover:text-cyan-700 font-medium"
                  >
                    Regenerar
                  </button>
                </div>
                <div className="relative">
                  <Lock size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPwd ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full border border-slate-200 rounded-xl pl-8.5 pr-10 py-2.5 text-sm text-slate-800 font-mono focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-100 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(!showPwd)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPwd ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                </div>
                <p className="text-xs text-slate-400 mt-1">El usuario deberá cambiarla al primer inicio de sesión.</p>
              </div>

              {/* Rol */}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Rol en el sistema</label>
                <div className="grid grid-cols-2 gap-2">
                  {ROLES.map((r) => (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => setRol(r.value)}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-medium transition-all ${
                        rol === r.value
                          ? `${r.bg} ${r.color} ring-2 ring-current ring-offset-1`
                          : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100"
                      }`}
                    >
                      <Shield size={11} />
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Error */}
              {formError && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-xl px-3 py-2.5">
                  <AlertCircle size={13} className="text-red-500 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-red-600">{formError}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={creating}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 disabled:opacity-50 text-white font-semibold rounded-xl py-2.5 text-sm transition-all shadow-sm flex items-center justify-center gap-2"
              >
                {creating ? (
                  <><Loader2 size={14} className="animate-spin" /> Creando cuenta...</>
                ) : (
                  <><UserPlus size={14} /> Crear usuario</>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* ── Tabla de usuarios ──────────────────────────────────────── */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-800">Usuarios registrados</h2>
              <span className="text-xs text-slate-400 bg-slate-100 rounded-full px-2.5 py-1 font-medium">
                {usuarios.length} usuarios
              </span>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-16 gap-2">
                <Loader2 size={20} className="text-cyan-500 animate-spin" />
                <span className="text-sm text-slate-400">Cargando usuarios...</span>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-16 gap-2">
                <AlertCircle size={20} className="text-red-400" />
                <p className="text-sm text-red-500">{error}</p>
              </div>
            ) : usuarios.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-2 text-slate-400">
                <Users size={28} className="opacity-30" />
                <p className="text-sm">No hay usuarios registrados</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-xs text-slate-500 bg-slate-50 border-b border-slate-100">
                      <th className="text-left px-5 py-3 font-medium">ID</th>
                      <th className="text-left px-5 py-3 font-medium">Nombre</th>
                      <th className="text-left px-5 py-3 font-medium">Correo</th>
                      <th className="text-left px-5 py-3 font-medium">Rol</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {usuarios.map((u) => (
                      <tr key={u.idUsuario} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-5 py-3.5 text-xs text-slate-400 font-mono">#{u.idUsuario}</td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center flex-shrink-0">
                              <span className="text-xs font-bold text-white">
                                {u.nombre.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <span className="text-sm font-medium text-slate-700">{u.nombre}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-sm text-slate-500">{u.email}</td>
                        <td className="px-5 py-3.5">
                          <RolBadge rol={u.rol} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Info de roles */}
          <div className="mt-4 bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
            <h3 className="text-xs font-semibold text-slate-600 mb-3 uppercase tracking-wide">Permisos por rol</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { rol: "ADMINISTRADOR" as RolUsuario, permisos: ["Gestionar usuarios", "Ver nodos", "Ver logs", "Todo el sistema"] },
                { rol: "SOPORTE"       as RolUsuario, permisos: ["Registrar nodos", "Ver lecturas", "Ver logs del sistema"] },
                { rol: "GESTIONADOR"  as RolUsuario, permisos: ["Ver nodos asignados", "Ver lecturas", "Análisis IA"] },
                { rol: "CLIENTE"      as RolUsuario, permisos: ["Ver sus propios nodos", "Historial personal"] },
              ].map(({ rol: r, permisos }) => {
                const meta = ROLES.find((x) => x.value === r)!;
                return (
                  <div key={r} className={`rounded-xl border p-3 ${meta.bg}`}>
                    <div className={`flex items-center gap-1.5 mb-2 ${meta.color}`}>
                      <Shield size={11} />
                      <span className="text-xs font-semibold">{meta.label}</span>
                    </div>
                    <ul className="space-y-0.5">
                      {permisos.map((p) => (
                        <li key={p} className="text-xs text-slate-500 flex items-center gap-1">
                          <span className={`w-1 h-1 rounded-full ${meta.color.replace("text-", "bg-")}`}></span>
                          {p}
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

      {/* ── Modal de Credenciales ───────────────────────────────────────── */}
      {creds && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" style={{ fontFamily: "'Inter', sans-serif" }}>
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                  <CheckCircle2 size={15} className="text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-800">¡Usuario creado exitosamente!</h3>
                  <p className="text-xs text-slate-400">Comparte estas credenciales de forma segura</p>
                </div>
              </div>
              <button onClick={() => setCreds(null)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-3">
              {/* Aviso */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2">
                <AlertCircle size={13} className="text-amber-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-amber-700">
                  Comparte estas credenciales con el usuario de forma segura. Al iniciar sesión por primera vez, se le pedirá que cambie su contraseña.
                </p>
              </div>

              {/* Nombre */}
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Nombre</label>
                <div className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-700 font-medium">
                  {creds.nombre}
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Correo electrónico</label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-700 font-mono">
                    {creds.email}
                  </div>
                  <button
                    onClick={() => copyToClipboard(creds.email, "email")}
                    className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl border text-xs font-medium transition-all ${
                      copied === "email"
                        ? "bg-emerald-50 border-emerald-200 text-emerald-600"
                        : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                    }`}
                  >
                    {copied === "email" ? <CheckCircle2 size={13} /> : <Copy size={13} />}
                    {copied === "email" ? "Copiado" : "Copiar"}
                  </button>
                </div>
              </div>

              {/* Contraseña */}
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Contraseña temporal</label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-700 font-mono tracking-wider">
                    {creds.password}
                  </div>
                  <button
                    onClick={() => copyToClipboard(creds.password, "pwd")}
                    className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl border text-xs font-medium transition-all ${
                      copied === "pwd"
                        ? "bg-emerald-50 border-emerald-200 text-emerald-600"
                        : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                    }`}
                  >
                    {copied === "pwd" ? <CheckCircle2 size={13} /> : <Copy size={13} />}
                    {copied === "pwd" ? "Copiado" : "Copiar"}
                  </button>
                </div>
              </div>

              {/* Rol */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-slate-500">Rol asignado:</span>
                <RolBadge rol={creds.rol} />
              </div>

              {/* Copiar todo */}
              <button
                onClick={() =>
                  copyToClipboard(
                    `Credenciales de acceso - AquaMonitor\nNombre: ${creds.nombre}\nCorreo: ${creds.email}\nContraseña temporal: ${creds.password}\nRol: ${creds.rol}\n\nINSTRUCCIONES: Al ingresar por primera vez deberás cambiar tu contraseña.`,
                    "all"
                  )
                }
                className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border text-xs font-medium transition-all ${
                  copied === "all"
                    ? "bg-emerald-50 border-emerald-200 text-emerald-600"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {copied === "all" ? <CheckCircle2 size={13} /> : <Copy size={13} />}
                {copied === "all" ? "¡Copiado todo!" : "Copiar credenciales completas"}
              </button>
            </div>

            <div className="px-5 pb-5">
              <button
                onClick={() => setCreds(null)}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl py-2.5 text-sm hover:from-cyan-600 hover:to-blue-700 transition-all"
              >
                Entendido, cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
