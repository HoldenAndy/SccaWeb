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

  const copyToClipboard = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    } catch { /* fallback silencioso */ }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center"><CheckCircle2 size={15} className="text-emerald-600" /></div>
            <div><h3 className="text-sm font-semibold text-slate-800">¡Usuario creado exitosamente!</h3><p className="text-xs text-slate-400">Comparte estas credenciales de forma segura</p></div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
        </div>
        <div className="p-5 space-y-3">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2">
            <AlertCircle size={13} className="text-amber-600 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-amber-700">Comparte estas credenciales con el usuario de forma segura. Al iniciar sesión por primera vez, se le pedirá que cambie su contraseña.</p>
          </div>
          <div><label className="block text-xs font-medium text-slate-500 mb-1">Nombre</label><div className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-700 font-medium">{creds.nombre}</div></div>
          <div><label className="block text-xs font-medium text-slate-500 mb-1">Correo electrónico</label>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-700 font-mono">{creds.email}</div>
              <button onClick={() => copyToClipboard(creds.email, "email")} className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl border text-xs font-medium transition-all ${copied === "email" ? "bg-emerald-50 border-emerald-200 text-emerald-600" : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"}`}>
                {copied === "email" ? <CheckCircle2 size={13} /> : <Copy size={13} />}{copied === "email" ? "Copiado" : "Copiar"}
              </button>
            </div>
          </div>
          <div><label className="block text-xs font-medium text-slate-500 mb-1">Contraseña temporal</label>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-700 font-mono tracking-wider">{creds.password}</div>
              <button onClick={() => copyToClipboard(creds.password, "pwd")} className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl border text-xs font-medium transition-all ${copied === "pwd" ? "bg-emerald-50 border-emerald-200 text-emerald-600" : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"}`}>
                {copied === "pwd" ? <CheckCircle2 size={13} /> : <Copy size={13} />}{copied === "pwd" ? "Copiado" : "Copiar"}
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between pt-1"><span className="text-xs text-slate-500">Rol asignado:</span><RolBadge rol={creds.rol} /></div>
          <button onClick={() => copyToClipboard(`Credenciales de acceso - AquaMonitor\nNombre: ${creds.nombre}\nCorreo: ${creds.email}\nContraseña temporal: ${creds.password}\nRol: ${creds.rol}\n\nINSTRUCCIONES: Al ingresar por primera vez deberás cambiar tu contraseña.`, "all")}
            className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border text-xs font-medium transition-all ${copied === "all" ? "bg-emerald-50 border-emerald-200 text-emerald-600" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
            {copied === "all" ? <CheckCircle2 size={13} /> : <Copy size={13} />}{copied === "all" ? "¡Copiado todo!" : "Copiar credenciales completas"}
          </button>
        </div>
        <div className="px-5 pb-5"><button onClick={onClose} className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl py-2.5 text-sm hover:from-cyan-600 hover:to-blue-700 transition-all">Entendido, cerrar</button></div>
      </div>
    </div>
  );
}
