import { useState } from "react";
import { useNavigate } from "react-router";
import { Droplets, Eye, EyeOff, Loader2, Lock, Mail, ShieldCheck, AlertCircle, KeyRound } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

type Step = "login" | "cambiar-password";

export function LoginPage() {
  const navigate  = useNavigate();
  const { login, cambiarPassword, user } = useAuth();

  const [step, setStep] = useState<Step>("login");

  // Login form
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd]   = useState(false);

  // Change password form
  const [newPwd, setNewPwd]         = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [showNew, setShowNew]       = useState(false);
  const [showConf, setShowConf]     = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  /* ─── Login ─────────────────────────────────────────────────────────── */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await login(email, password);
      if (data.debeCambiarPassword) {
        setStep("cambiar-password");
      } else {
        navigate("/", { replace: true });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al iniciar sesión";
      // Hacer el mensaje más amigable
      if (msg.includes("401") || msg.toLowerCase().includes("bad credentials") || msg.toLowerCase().includes("unauthorized")) {
        setError("Credenciales incorrectas. Verifica tu correo y contraseña.");
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  /* ─── Cambiar contraseña ─────────────────────────────────────────────── */
  const handleCambiar = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPwd.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (newPwd !== confirmPwd) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);
    try {
      await cambiarPassword(newPwd);
      navigate("/", { replace: true });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al cambiar la contraseña");
    } finally {
      setLoading(false);
    }
  };

  /* ─── Render ────────────────────────────────────────────────────────── */
  return (
    <div
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a1628] via-[#0d1f3c] to-[#0a1628] p-4"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* Background grid decoration */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            "linear-gradient(rgba(6,182,212,.3) 1px,transparent 1px),linear-gradient(90deg,rgba(6,182,212,.3) 1px,transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-xl shadow-cyan-500/30 mb-4">
            <Droplets size={30} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">AquaMonitor</h1>
          <p className="text-sm text-slate-400 mt-1">Sistema Inteligente de Calidad del Agua</p>
        </div>

        {/* Card */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 shadow-2xl">

          {/* ── STEP: LOGIN ───────────────────────────────────────────── */}
          {step === "login" && (
            <>
              <div className="flex items-center gap-2 mb-6">
                <ShieldCheck size={18} className="text-cyan-400" />
                <h2 className="text-base font-semibold text-white">Iniciar sesión</h2>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                {/* Email */}
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">
                    Correo electrónico
                  </label>
                  <div className="relative">
                    <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="usuario@ejemplo.com"
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/60 focus:bg-white/8 transition"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">
                    Contraseña
                  </label>
                  <div className="relative">
                    <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type={showPwd ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-10 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/60 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwd(!showPwd)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                    >
                      {showPwd ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2.5">
                    <AlertCircle size={14} className="text-red-400 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-red-300">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 text-white font-semibold rounded-xl py-2.5 text-sm transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 mt-2"
                >
                  {loading ? (
                    <><Loader2 size={15} className="animate-spin" /> Verificando...</>
                  ) : (
                    "Ingresar"
                  )}
                </button>
              </form>
            </>
          )}

          {/* ── STEP: CAMBIAR PASSWORD ────────────────────────────────── */}
          {step === "cambiar-password" && (
            <>
              <div className="flex items-center gap-2 mb-2">
                <KeyRound size={18} className="text-amber-400" />
                <h2 className="text-base font-semibold text-white">Cambio de contraseña requerido</h2>
              </div>
              <p className="text-xs text-slate-400 mb-5 leading-relaxed">
                Hola <span className="text-cyan-400 font-medium">{user?.nombre}</span>, tu cuenta fue creada por un administrador.
                Por seguridad, debes elegir una contraseña personal antes de continuar.
              </p>

              <form onSubmit={handleCambiar} className="space-y-4">
                {/* Nueva contraseña */}
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">
                    Nueva contraseña
                  </label>
                  <div className="relative">
                    <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type={showNew ? "text" : "password"}
                      value={newPwd}
                      onChange={(e) => setNewPwd(e.target.value)}
                      required
                      minLength={6}
                      placeholder="Mínimo 6 caracteres"
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-10 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500/60 transition"
                    />
                    <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                      {showNew ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                {/* Confirmar */}
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">
                    Confirmar contraseña
                  </label>
                  <div className="relative">
                    <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type={showConf ? "text" : "password"}
                      value={confirmPwd}
                      onChange={(e) => setConfirmPwd(e.target.value)}
                      required
                      placeholder="Repite la contraseña"
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-10 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500/60 transition"
                    />
                    <button type="button" onClick={() => setShowConf(!showConf)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                      {showConf ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                {/* Match indicator */}
                {newPwd && confirmPwd && (
                  <p className={`text-xs ${newPwd === confirmPwd ? "text-emerald-400" : "text-red-400"}`}>
                    {newPwd === confirmPwd ? "✓ Las contraseñas coinciden" : "✗ Las contraseñas no coinciden"}
                  </p>
                )}

                {/* Error */}
                {error && (
                  <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2.5">
                    <AlertCircle size={14} className="text-red-400 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-red-300">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-50 text-white font-semibold rounded-xl py-2.5 text-sm transition-all shadow-lg flex items-center justify-center gap-2 mt-2"
                >
                  {loading ? (
                    <><Loader2 size={15} className="animate-spin" /> Guardando...</>
                  ) : (
                    "Establecer contraseña y continuar"
                  )}
                </button>
              </form>
            </>
          )}
        </div>

        <p className="text-center text-xs text-slate-600 mt-6">
          SCCA · Sistema de Control de Calidad del Agua
        </p>
      </div>
    </div>
  );
}
