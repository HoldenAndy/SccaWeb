import { useState } from "react";
import { useNavigate } from "react-router";
import { Eye, EyeOff, Loader2, Lock, Mail, AlertCircle, KeyRound, ArrowRight } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { sanitizeEmail, sanitizePassword } from "../../lib/sanitization";

type Step = "login" | "cambiar-password";

export function LoginPage() {
  const navigate = useNavigate();
  const { login, cambiarPassword, user } = useAuth();

  const [step, setStep] = useState<Step>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConf, setShowConf] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await login(sanitizeEmail(email), sanitizePassword(password));
      if (data.debeCambiarPassword) setStep("cambiar-password");
      else navigate("/", { replace: true });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al iniciar sesión";
      if (msg.includes("401") || msg.toLowerCase().includes("bad credentials") || msg.toLowerCase().includes("unauthorized")) {
        setError("Credenciales incorrectas. Verifica tu correo y contraseña.");
      } else setError(msg);
    } finally { setLoading(false); }
  };

  const handleCambiar = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const cleanNewPwd = sanitizePassword(newPwd);
    if (cleanNewPwd.length < 6) { setError("La contraseña debe tener al menos 6 caracteres."); return; }
    if (cleanNewPwd !== sanitizePassword(confirmPwd)) { setError("Las contraseñas no coinciden."); return; }
    setLoading(true);
    try {
      await cambiarPassword(cleanNewPwd);
      navigate("/", { replace: true });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al cambiar la contraseña");
    } finally { setLoading(false); }
  };

  const inputBase = "w-full bg-transparent border-b border-[var(--scca-hair)] py-2 pl-7 pr-8 text-[14px] text-[var(--scca-ink)] font-mono tabular-nums placeholder:text-[var(--scca-faint)] focus:outline-none focus:border-[var(--scca-accent)] transition-colors";

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-[var(--scca-bg)]">
      {/* Left: brand poster */}
      <aside className="hidden lg:flex bg-[var(--scca-surface)] border-r border-[var(--scca-hair)] p-12 flex-col justify-between">
        <div>
          <div className="text-[40px] font-semibold text-[var(--scca-ink)] tracking-[-0.05em] leading-none">SCCA</div>
          <p className="text-[13px] text-[var(--scca-muted)] mt-2">Sistema de Control de Calidad del Agua</p>
        </div>
        <p className="text-[22px] leading-[1.35] text-[var(--scca-ink)] max-w-[420px] tracking-[-0.01em]" style={{ textWrap: "balance" } as React.CSSProperties}>
          Lectura continua del agua, interpretada por IA, accesible desde cualquier navegador.
        </p>
        <div className="flex items-center justify-between scca-caps">
          <span>© 2026 · Acceso restringido</span>
          <span className="font-mono" style={{ letterSpacing: 0 }}>v2.1.0</span>
        </div>
      </aside>

      {/* Right: form */}
      <main className="flex items-center justify-center p-8 lg:p-12">
        <div className="w-full max-w-[340px]">
          {step === "login" ? (
            <>
              <div className="scca-caps text-[var(--scca-accent)] mb-2">Acceso al sistema</div>
              <h2 className="text-[26px] font-medium text-[var(--scca-ink)] tracking-[-0.02em]">Inicia sesión</h2>
              <p className="text-[13px] text-[var(--scca-muted)] mt-2">
                Usa las credenciales proporcionadas por el administrador.
              </p>

              <form onSubmit={handleLogin} className="mt-7 flex flex-col gap-5">
                <div>
                  <label className="scca-caps block mb-2">Correo electrónico</label>
                  <div className="relative">
                    <Mail size={13} strokeWidth={1.5} className="absolute left-0 top-1/2 -translate-y-1/2 text-[var(--scca-muted)]" />
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                      placeholder="usuario@correo.com" className={inputBase} />
                  </div>
                </div>
                <div>
                  <label className="scca-caps block mb-2">Contraseña</label>
                  <div className="relative">
                    <Lock size={13} strokeWidth={1.5} className="absolute left-0 top-1/2 -translate-y-1/2 text-[var(--scca-muted)]" />
                    <input type={showPwd ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required
                      placeholder="••••••••" className={inputBase} />
                    <button type="button" onClick={() => setShowPwd(!showPwd)}
                      className="absolute right-0 top-1/2 -translate-y-1/2 text-[var(--scca-muted)] hover:text-[var(--scca-ink)]">
                      {showPwd ? <EyeOff size={13} strokeWidth={1.5} /> : <Eye size={13} strokeWidth={1.5} />}
                    </button>
                  </div>
                </div>
                {error && (
                  <div className="flex items-start gap-2 bg-[var(--scca-danger-bg)] border border-[var(--scca-hair)] rounded-sm px-3 py-2.5">
                    <AlertCircle size={13} strokeWidth={1.5} className="text-[var(--scca-danger)] mt-0.5 flex-shrink-0" />
                    <p className="text-[11px] text-[var(--scca-danger)]">{error}</p>
                  </div>
                )}
                <button type="submit" disabled={loading}
                  className="mt-2 bg-[var(--scca-ink)] text-[var(--scca-bg)] rounded-sm py-2.5 text-[13px] font-medium hover:bg-[var(--scca-ink-2)] disabled:opacity-50 flex items-center justify-center gap-2 transition-colors">
                  {loading
                    ? <><Loader2 size={13} strokeWidth={1.5} className="animate-spin" /> Verificando…</>
                    : <>Iniciar sesión <ArrowRight size={13} strokeWidth={1.5} /></>}
                </button>
              </form>
            </>
          ) : (
            <>
              <div className="scca-caps text-[var(--scca-warn)] mb-2 flex items-center gap-1.5">
                <KeyRound size={11} strokeWidth={1.5} /> Cambio requerido
              </div>
              <h2 className="text-[24px] font-medium text-[var(--scca-ink)] tracking-[-0.02em]">Nueva contraseña</h2>
              <p className="text-[13px] text-[var(--scca-muted)] mt-2 leading-relaxed">
                Hola <span className="text-[var(--scca-accent)] font-medium">{user?.nombre}</span>, tu cuenta fue creada
                por un administrador. Por seguridad, debes elegir una contraseña personal antes de continuar.
              </p>
              <form onSubmit={handleCambiar} className="mt-7 flex flex-col gap-5">
                <div>
                  <label className="scca-caps block mb-2">Nueva contraseña</label>
                  <div className="relative">
                    <Lock size={13} strokeWidth={1.5} className="absolute left-0 top-1/2 -translate-y-1/2 text-[var(--scca-muted)]" />
                    <input type={showNew ? "text" : "password"} value={newPwd} onChange={(e) => setNewPwd(e.target.value)} required minLength={6}
                      placeholder="Mínimo 6 caracteres" className={inputBase} />
                    <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-0 top-1/2 -translate-y-1/2 text-[var(--scca-muted)]">
                      {showNew ? <EyeOff size={13} strokeWidth={1.5} /> : <Eye size={13} strokeWidth={1.5} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="scca-caps block mb-2">Confirmar contraseña</label>
                  <div className="relative">
                    <Lock size={13} strokeWidth={1.5} className="absolute left-0 top-1/2 -translate-y-1/2 text-[var(--scca-muted)]" />
                    <input type={showConf ? "text" : "password"} value={confirmPwd} onChange={(e) => setConfirmPwd(e.target.value)} required
                      placeholder="Repite la contraseña" className={inputBase} />
                    <button type="button" onClick={() => setShowConf(!showConf)} className="absolute right-0 top-1/2 -translate-y-1/2 text-[var(--scca-muted)]">
                      {showConf ? <EyeOff size={13} strokeWidth={1.5} /> : <Eye size={13} strokeWidth={1.5} />}
                    </button>
                  </div>
                </div>
                {newPwd && confirmPwd && (
                  <p className={`text-[11px] ${newPwd === confirmPwd ? "text-[var(--scca-ok)]" : "text-[var(--scca-danger)]"}`}>
                    {newPwd === confirmPwd ? "✓ Las contraseñas coinciden" : "✗ Las contraseñas no coinciden"}
                  </p>
                )}
                {error && (
                  <div className="flex items-start gap-2 bg-[var(--scca-danger-bg)] border border-[var(--scca-hair)] rounded-sm px-3 py-2.5">
                    <AlertCircle size={13} strokeWidth={1.5} className="text-[var(--scca-danger)] mt-0.5 flex-shrink-0" />
                    <p className="text-[11px] text-[var(--scca-danger)]">{error}</p>
                  </div>
                )}
                <button type="submit" disabled={loading}
                  className="mt-2 bg-[var(--scca-ink)] text-[var(--scca-bg)] rounded-sm py-2.5 text-[13px] font-medium hover:bg-[var(--scca-ink-2)] disabled:opacity-50 flex items-center justify-center gap-2 transition-colors">
                  {loading ? <><Loader2 size={13} strokeWidth={1.5} className="animate-spin" /> Guardando…</> : "Establecer y continuar"}
                </button>
              </form>
            </>
          )}
          <p className="mt-10 pt-4 border-t border-[var(--scca-hair-soft)] text-[10px] text-[var(--scca-faint)] tracking-[0.06em] uppercase text-center lg:text-left">
            SCCA · Sistema de Control de Calidad del Agua
          </p>
        </div>
      </main>
    </div>
  );
}
