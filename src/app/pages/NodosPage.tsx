import { Cpu, Plus, RefreshCw, Wifi, WifiOff, MapPin, Hash, Clock, AlertCircle, Loader2, Shield, ChevronRight } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";
import { registrarNodo, type NodoDTO } from "../../api/nodos";
import { useNodos } from "../hooks/useNodos";
import { PageHeader } from "../components/shared/PageHeader";
import { getUsuarios, type UsuarioDTO } from "../../api/auth";
import { formatFechaTabla } from "../../lib/fechas";
import { NodoRegistradoModal } from "../components/shared/NodoRegistradoModal";
import { NodoDetailDrawer } from "../components/shared/NodoDetailDrawer";
import { EmptyState } from "../components/shared/EmptyState";
import { Skeleton } from "../components/shared/Skeleton";
import { sanitizeText, validateMacAddress } from "../../lib/sanitization";
import { toast } from "sonner";

function formatFecha(fecha: string | null): string {
  if (!fecha) return "Sin lecturas";
  return formatFechaTabla(fecha);
}

import { useAnalysis } from "../contexts/AnalysisContext";

export function NodosPage() {
  const { isAdmin, isSoporte } = useAuth();
  const { nodos, loading, error, recargar: recargarNodos } = useNodos();
  const { recargarAnalisis } = useAnalysis();
  const [usuarios, setUsuarios] = useState<UsuarioDTO[]>([]);

  const [macAddress, setMacAddress] = useState("");
  const [ubicacion, setUbicacion] = useState("");
  const [idUsuario, setIdUsuario] = useState<number | "">("");
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [registrado, setRegistrado] = useState<{ nodo: NodoDTO; clienteNombre: string } | null>(null);
  const [drawerNodo, setDrawerNodo] = useState<NodoDTO | null>(null);

  const cargarUsuarios = useCallback(async () => {
    try {
      const data = await getUsuarios();
      setUsuarios(data.filter((u) => u.rol === "CLIENTE"));
    } catch { /* silencioso */ }
  }, []);

  useEffect(() => { cargarUsuarios(); }, [cargarUsuarios]);

  const handleRegistrar = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const cleanMac = macAddress.trim().toUpperCase();
    const cleanUbicacion = sanitizeText(ubicacion);
    if (!cleanMac) { setFormError("La dirección MAC es obligatoria."); return; }
    if (!validateMacAddress(cleanMac)) { setFormError("Formato MAC inválido. Ejemplo: A4:CF:12:B0:7E:F1"); return; }
    if (!cleanUbicacion) { setFormError("La ubicación es obligatoria."); return; }
    if (!idUsuario) { setFormError("Debes asignar el nodo a un cliente."); return; }

    setCreating(true);
    try {
      const nuevo = await registrarNodo({ macAddress: cleanMac, ubicacion: cleanUbicacion, idUsuario: Number(idUsuario) });
      await recargarNodos();
      await recargarAnalisis();
      const cliente = usuarios.find((u) => u.idUsuario === Number(idUsuario));
      setRegistrado({ nodo: nuevo, clienteNombre: cliente?.nombre ?? "Cliente" });
      setMacAddress(""); setUbicacion(""); setIdUsuario("");
      toast.success("Nodo registrado", { description: cleanMac });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al registrar nodo";
      const friendly = msg.includes("ya existe") || msg.includes("MAC") ? "Ya existe un nodo con esa MAC." : msg;
      setFormError(friendly);
      toast.error("No se pudo registrar", { description: friendly });
    } finally { setCreating(false); }
  };

  const nodosActivos = nodos.filter((n) => n.estadoConexion).length;
  const nodosInactivos = nodos.filter((n) => !n.estadoConexion).length;

  const inputBase = "w-full bg-[var(--scca-bg)] border border-[var(--scca-hair)] rounded-sm pl-8 pr-3 py-2 text-[13px] text-[var(--scca-ink)] placeholder:text-[var(--scca-faint)] focus:outline-none focus:border-[var(--scca-accent)] transition-colors";

  return (
    <div>
      <PageHeader
        title="Nodos ESP32"
        subtitle="Dispositivos físicos que muestrean los parámetros del agua y reportan al servidor vía MQTT."
        actions={
          <button onClick={recargarNodos} disabled={loading}
            className="flex items-center gap-1.5 text-[11px] text-[var(--scca-ink-2)] border border-[var(--scca-hair)] rounded-sm px-3 py-1.5 hover:bg-[var(--scca-surface)] disabled:opacity-50 transition-colors">
            <RefreshCw size={11} strokeWidth={1.5} className={loading ? "animate-spin" : ""} /> Actualizar
          </button>
        }
      />

      <div className="px-4 md:px-8 py-6 flex flex-col" style={{ gap: "var(--scca-section-gap)" }}>
        {/* KPI strip */}
        <div className="grid grid-cols-3 border border-[var(--scca-hair)] rounded-md overflow-hidden">
          {[
            { l: "Total",          v: nodos.length,   c: "text-[var(--scca-ink)]"    },
            { l: "Conectados",     v: nodosActivos,   c: "text-[var(--scca-ok)]"     },
            { l: "Desconectados",  v: nodosInactivos, c: "text-[var(--scca-danger)]" },
          ].map((s, i) => (
            <div key={s.l} className={`p-4 ${i > 0 ? "border-l border-[var(--scca-hair)]" : ""}`}>
              <div className="scca-caps">{s.l}</div>
              <div className={`text-[28px] font-mono tabular-nums font-medium ${s.c} tracking-[-0.03em] leading-none mt-1.5`}>
                {loading ? <Skeleton width={42} height={28} /> : s.v}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          {(isAdmin || isSoporte) && (
            <div className="lg:col-span-2">
              <div className="border border-[var(--scca-hair)] rounded-md p-5">
                <div className="scca-caps text-[var(--scca-accent)] mb-1 flex items-center gap-1.5">
                  <Plus size={11} strokeWidth={1.5} /> Registrar
                </div>
                <h2 className="text-[15px] font-medium text-[var(--scca-ink)] mb-5">Nuevo nodo</h2>

                <form onSubmit={handleRegistrar} className="space-y-4">
                  <div>
                    <label className="scca-caps block mb-1.5">Dirección MAC</label>
                    <div className="relative">
                      <Hash size={12} strokeWidth={1.5} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--scca-muted)]" />
                      <input type="text" value={macAddress} onChange={(e) => setMacAddress(e.target.value)} required
                        placeholder="A4:CF:12:B0:7E:F1" maxLength={17}
                        className={`${inputBase} font-mono uppercase`} />
                    </div>
                    <p className="text-[10px] text-[var(--scca-faint)] mt-1 font-mono">Formato: XX:XX:XX:XX:XX:XX</p>
                  </div>
                  <div>
                    <label className="scca-caps block mb-1.5">Ubicación</label>
                    <div className="relative">
                      <MapPin size={12} strokeWidth={1.5} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--scca-muted)]" />
                      <input type="text" value={ubicacion} onChange={(e) => setUbicacion(e.target.value)} required
                        placeholder="Ej: Tanque principal · Azotea" className={inputBase} />
                    </div>
                  </div>
                  <div>
                    <label className="scca-caps block mb-1.5">Asignar a cliente</label>
                    <div className="relative">
                      <Shield size={12} strokeWidth={1.5} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--scca-muted)]" />
                      <select value={idUsuario} onChange={(e) => setIdUsuario(e.target.value === "" ? "" : Number(e.target.value))} required
                        className={`${inputBase} appearance-none`}>
                        <option value="">— Selecciona un cliente —</option>
                        {usuarios.length === 0 ? <option disabled>No hay clientes registrados</option> : usuarios.map((u) => <option key={u.idUsuario} value={u.idUsuario}>{u.nombre} ({u.email})</option>)}
                      </select>
                    </div>
                    {usuarios.length === 0 && <p className="text-[10.5px] text-[var(--scca-warn)] mt-1">Primero registra un usuario con rol CLIENTE.</p>}
                  </div>
                  {formError && (
                    <div className="flex items-start gap-2 bg-[var(--scca-danger-bg)] border border-[var(--scca-hair)] rounded-sm px-3 py-2.5">
                      <AlertCircle size={12} strokeWidth={1.5} className="text-[var(--scca-danger)] mt-0.5 flex-shrink-0" />
                      <p className="text-[11px] text-[var(--scca-danger)]">{formError}</p>
                    </div>
                  )}
                  <button type="submit" disabled={creating || usuarios.length === 0}
                    className="w-full bg-[var(--scca-ink)] text-[var(--scca-bg)] font-medium rounded-sm py-2.5 text-[13px] hover:bg-[var(--scca-ink-2)] disabled:opacity-50 flex items-center justify-center gap-2 transition-colors">
                    {creating ? <><Loader2 size={13} strokeWidth={1.5} className="animate-spin" /> Registrando…</> : <><Plus size={13} strokeWidth={1.5} /> Registrar nodo</>}
                  </button>
                </form>
              </div>
            </div>
          )}

          <div className={(isAdmin || isSoporte) ? "lg:col-span-3" : "lg:col-span-5"}>
            <div className="border border-[var(--scca-hair)] rounded-md overflow-hidden">
              <div className="px-4 py-3 border-b border-[var(--scca-hair)] flex items-center justify-between">
                <div>
                  <h2 className="text-[12px] font-medium text-[var(--scca-ink)]">Nodos registrados</h2>
                  <p className="text-[10.5px] text-[var(--scca-muted)] mt-0.5 font-mono">{nodos.length} dispositivos</p>
                </div>
              </div>
              {loading ? (
                <div className="p-3 space-y-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 py-2">
                      <Skeleton width={32} height={32} rounded="sm" />
                      <div className="flex-1">
                        <Skeleton width="40%" height={13} className="mb-1.5" />
                        <Skeleton width="60%" height={11} />
                      </div>
                      <Skeleton width={40} height={11} />
                    </div>
                  ))}
                </div>
              ) : error ? (
                <EmptyState
                  Icon={AlertCircle}
                  title="Error al cargar nodos"
                  body={error}
                  action={<button onClick={recargarNodos} className="text-[11px] font-medium text-[var(--scca-accent)] hover:underline">Reintentar</button>}
                />
              ) : nodos.length === 0 ? (
                <EmptyState
                  Icon={Cpu}
                  title="No hay nodos registrados todavía"
                  body="Registra el primer dispositivo ESP32 con su MAC y asígnalo a un cliente. Empezará a reportar lecturas en cuanto se conecte al WiFi."
                />
              ) : (
                <div>
                  {nodos.map((nodo, i) => (
                    <button
                      key={nodo.idNodo}
                      onClick={() => setDrawerNodo(nodo)}
                      className={`w-full text-left px-4 py-3.5 hover:bg-[var(--scca-surface)] transition-colors flex items-start justify-between gap-3 ${i < nodos.length - 1 ? "border-b border-[var(--scca-hair-soft)]" : ""}`}
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <div className={`mt-0.5 w-8 h-8 rounded-sm flex items-center justify-center flex-shrink-0 border ${nodo.estadoConexion ? "bg-[var(--scca-ok-bg)] border-[var(--scca-hair)]" : "bg-[var(--scca-surface)] border-[var(--scca-hair)]"}`}>
                          {nodo.estadoConexion ? <Wifi size={13} strokeWidth={1.5} className="text-[var(--scca-ok)]" /> : <WifiOff size={13} strokeWidth={1.5} className="text-[var(--scca-muted)]" />}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[13px] font-medium text-[var(--scca-ink)] font-mono">{nodo.macAddress}</span>
                            <span className={`inline-flex items-center gap-1 text-[10px] font-medium uppercase tracking-[0.08em] ${nodo.estadoConexion ? "text-[var(--scca-ok)]" : "text-[var(--scca-muted)]"}`}>
                              <span className={`w-1 h-1 rounded-full ${nodo.estadoConexion ? "bg-[var(--scca-ok)]" : "bg-[var(--scca-faint)]"}`} />
                              {nodo.estadoConexion ? "En línea" : "Desconectado"}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 mt-1"><MapPin size={10} strokeWidth={1.5} className="text-[var(--scca-muted)] flex-shrink-0" /><span className="text-[11.5px] text-[var(--scca-ink-2)]">{nodo.ubicacion}</span></div>
                          <div className="flex items-center gap-1 mt-0.5"><Clock size={10} strokeWidth={1.5} className="text-[var(--scca-muted)] flex-shrink-0" /><span className="text-[10.5px] text-[var(--scca-muted)] font-mono">Última lectura: {formatFecha(nodo.ultimaLectura)}</span></div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-[var(--scca-faint)] font-mono flex-shrink-0">
                        #{String(nodo.idNodo).padStart(3, "0")}
                        <ChevronRight size={12} strokeWidth={1.5} className="text-[var(--scca-muted)]" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {registrado && <NodoRegistradoModal nodo={registrado.nodo} clienteNombre={registrado.clienteNombre} onClose={() => setRegistrado(null)} />}
      <NodoDetailDrawer nodo={drawerNodo} onClose={() => setDrawerNodo(null)} />
    </div>
  );
}
