import { CheckCircle2, Copy, AlertCircle, X } from "lucide-react";
import { useState } from "react";
import { type RolUsuario } from "../../../api/auth";
import { RolBadge } from "./RolBadge";

interface Props {
  creds: { nombre: string; email: string; password: string; rol: RolUsuario };
  onClose: () => void;
}

export function CredentialsModal({ creds, onClose }: Props) {
  const [copied, setCopied] = useState<string | null>(null);

  const copy = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    } catch { /* silencioso */ }
  };

  const fieldRow = (label: string, value: string, key: string, mono = true) => (
    <div>
      <label className="scca-caps block mb-1.5">{label}</label>
      <div className="flex items-center gap-2">
        <div className={`flex-1 bg-[var(--scca-surface)] border border-[var(--scca-hair)] rounded px-3 py-2 text-[13px] text-[var(--scca-ink)] ${mono ? "font-mono tabular-nums" : ""}`}>
          {value}
        </div>
        <button
          onClick={() => copy(value, key)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded border text-[11px] font-medium transition-colors ${
            copied === key
              ? "border-[var(--scca-ok)] text-[var(--scca-ok)] bg-[var(--scca-ok-bg)]"
              : "border-[var(--scca-hair)] text-[var(--scca-ink-2)] hover:bg-[var(--scca-surface)]"
          }`}
        >
          {copied === key ? <CheckCircle2 size={12} strokeWidth={1.5} /> : <Copy size={12} strokeWidth={1.5} />}
          {copied === key ? "Copiado" : "Copiar"}
        </button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--scca-bg)] border border-[var(--scca-hair)] rounded-md w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-[var(--scca-hair)]">
          <div>
            <div className="scca-caps text-[var(--scca-ok)] mb-1">Usuario creado</div>
            <h3 className="text-[16px] font-medium text-[var(--scca-ink)]">Credenciales generadas</h3>
            <p className="text-[11px] text-[var(--scca-muted)] mt-0.5">Compártelas de forma segura</p>
          </div>
          <button onClick={onClose} className="text-[var(--scca-muted)] hover:text-[var(--scca-ink)] p-1">
            <X size={16} strokeWidth={1.5} />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div className="flex items-start gap-2 bg-[var(--scca-warn-bg)] border border-[var(--scca-hair)] rounded-sm px-3 py-2.5">
            <AlertCircle size={12} strokeWidth={1.5} className="text-[var(--scca-warn)] mt-0.5 flex-shrink-0" />
            <p className="text-[11px] text-[var(--scca-warn)] leading-relaxed">
              Al iniciar sesión por primera vez, el usuario deberá cambiar su contraseña.
            </p>
          </div>
          {fieldRow("Nombre", creds.nombre, "name", false)}
          {fieldRow("Correo electrónico", creds.email, "email")}
          {fieldRow("Contraseña temporal", creds.password, "pwd")}
          <div className="flex items-center justify-between pt-1">
            <span className="scca-caps">Rol asignado</span>
            <RolBadge rol={creds.rol} />
          </div>
          <button
            onClick={() => copy(
              `Credenciales SCCA\nNombre: ${creds.nombre}\nCorreo: ${creds.email}\nContraseña temporal: ${creds.password}\nRol: ${creds.rol}\n\nAl ingresar por primera vez deberás cambiar tu contraseña.`,
              "all"
            )}
            className={`w-full flex items-center justify-center gap-2 py-2 rounded border text-[12px] font-medium transition-colors ${
              copied === "all"
                ? "border-[var(--scca-ok)] text-[var(--scca-ok)] bg-[var(--scca-ok-bg)]"
                : "border-[var(--scca-hair)] text-[var(--scca-ink-2)] hover:bg-[var(--scca-surface)]"
            }`}
          >
            {copied === "all" ? <CheckCircle2 size={12} strokeWidth={1.5} /> : <Copy size={12} strokeWidth={1.5} />}
            {copied === "all" ? "Copiado todo" : "Copiar credenciales completas"}
          </button>
        </div>
        <div className="px-5 pb-5">
          <button
            onClick={onClose}
            className="w-full bg-[var(--scca-ink)] text-[var(--scca-bg)] font-medium rounded-sm py-2.5 text-[13px] hover:bg-[var(--scca-ink-2)] transition-colors"
          >
            Entendido, cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
