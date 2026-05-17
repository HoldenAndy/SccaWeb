import { Cpu, Plus, RefreshCw, Wifi, WifiOff, MapPin, Hash, Clock, AlertCircle, Loader2, Activity, Shield } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";
import { registrarNodo, type NodoDTO } from "../../api/nodos";
import { useNodos } from "../hooks/useNodos";
import { PageHeader } from "../components/shared/PageHeader";
import { getUsuarios, type UsuarioDTO } from "../../api/auth";
import { formatFechaTabla } from "../../lib/fechas";
import { NodoRegistradoModal } from "../components/shared/NodoRegistradoModal";
import { sanitizeText, validateMacAddress } from "../../lib/sanitization";

function formatFecha(fecha: string | null): string {
  if (!fecha) return "Sin lecturas";
  return formatFechaTabla(fecha);
}

export function NodosPage() {
  const { isAdmin, isSoporte } = useAuth();

  const { nodos, loading, error, recargar: recargarNodos } = useNodos();
  const [usuarios, setUsuarios] = useState<UsuarioDTO[]>([]);

  const [macAddress, setMacAddress] = useState("");
  const [ubicacion, setUbicacion] = useState("");
  const [idUsuario, setIdUsuario] = useState<number | "">("");
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [registrado, setRegistrado] = useState<{ nodo: NodoDTO; clienteNombre: string } | null>(null);

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
    if (!validateMacAddress(cleanMac)) { setFormError("Formato de MAC inválido. Ejemplo: A4:CF:12:B0:7E:F1"); return; }
    if (!cleanUbicacion) { setFormError("La ubicación es obligatoria."); return; }
    if (!idUsuario) { setFormError("Debes asignar el nodo a un cliente."); return; }

    setCreating(true);
    try {
      const nuevo = await registrarNodo({
        macAddress: cleanMac,
        ubicacion: cleanUbicacion,
        idUsuario: Number(idUsuario),
      });
      await recargarNodos();
      const cliente = usuarios.find((u) => u.idUsuario === Number(idUsuario));
      setRegistrado({ nodo: nuevo, clienteNombre: cliente?.nombre ?? "Cliente" });
      setMacAddress("");
      setUbicacion("");
      setIdUsuario("");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al registrar nodo";
      if (msg.includes("ya existe") || msg.includes("MAC")) {
        setFormError("Ya existe un nodo registrado con esa dirección MAC.");
      } else {
        setFormError(msg);
      }
    } finally {
      setCreating(false);
    }
  };

  const nodosActivos = nodos.filter((n) => n.estadoConexion).length;
  const nodosInactivos = nodos.filter((n) => !n.estadoConexion).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestión de Nodos ESP32"
        subtitle="Registra y monitorea los dispositivos de medición"
        actions={
          <button onClick={recargarNodos} disabled={loading}
            className="flex items-center gap-1.5 text-xs text-slate-600 bg-white border border-slate-200 rounded-lg px-3 py-2 hover:bg-slate-50 shadow-sm disabled:opacity-50">
            <RefreshCw size={12} className={loading ? "animate-spin" : ""} /> Actualizar
          </button>
        }
      />

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl border border-slate-100 p-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-cyan-50 flex items-center justify-center"><Cpu size={15} className="text-cyan-600" /></div>
          <div><p className="text-xs text-slate-500">Total</p><p className="text-xl font-bold text-slate-800" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{nodos.length}</p></div>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 p-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center"><Wifi size={15} className="text-emerald-600" /></div>
          <div><p className="text-xs text-slate-500">Conectados</p><p className="text-xl font-bold text-emerald-700" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{nodosActivos}</p></div>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 p-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center"><WifiOff size={15} className="text-red-400" /></div>
          <div><p className="text-xs text-slate-500">Desconectados</p><p className="text-xl font-bold text-red-500" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{nodosInactivos}</p></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {(isAdmin || isSoporte) && (
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 rounded-lg bg-cyan-50 border border-cyan-100 flex items-center justify-center"><Plus size={15} className="text-cyan-600" /></div>
                <h2 className="text-sm font-semibold text-slate-800">Registrar nuevo nodo</h2>
              </div>
              <form onSubmit={handleRegistrar} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">Dirección MAC</label>
                  <div className="relative">
                    <Hash size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="text" value={macAddress} onChange={(e) => setMacAddress(e.target.value)} required placeholder="A4:CF:12:B0:7E:F1" maxLength={17}
                      className="w-full border border-slate-200 rounded-xl pl-8.5 pr-4 py-2.5 text-sm text-slate-800 font-mono placeholder:text-slate-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-100 transition uppercase" />
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Formato: XX:XX:XX:XX:XX:XX</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">Ubicación del dispositivo</label>
                  <div className="relative">
                    <MapPin size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="text" value={ubicacion} onChange={(e) => setUbicacion(e.target.value)} required placeholder="Ej: Tanque principal - Azotea"
                      className="w-full border border-slate-200 rounded-xl pl-8.5 pr-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-100 transition" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">Asignar a cliente</label>
                  <div className="relative">
                    <Shield size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <select value={idUsuario} onChange={(e) => setIdUsuario(e.target.value === "" ? "" : Number(e.target.value))} required
                      className="w-full border border-slate-200 rounded-xl pl-8.5 pr-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-100 transition bg-white appearance-none">
                      <option value="">— Selecciona un cliente —</option>
                      {usuarios.length === 0 ? <option disabled>No hay clientes registrados</option> : usuarios.map((u) => <option key={u.idUsuario} value={u.idUsuario}>{u.nombre} ({u.email})</option>)}
                    </select>
                  </div>
                  {usuarios.length === 0 && <p className="text-xs text-amber-600 mt-1">Primero registra un usuario con rol CLIENTE.</p>}
                </div>
                {formError && (
                  <div className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-xl px-3 py-2.5">
                    <AlertCircle size={13} className="text-red-500 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-red-600">{formError}</p>
                  </div>
                )}
                <button type="submit" disabled={creating || usuarios.length === 0}
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 disabled:opacity-50 text-white font-semibold rounded-xl py-2.5 text-sm transition-all shadow-sm flex items-center justify-center gap-2">
                  {creating ? <><Loader2 size={14} className="animate-spin" /> Registrando...</> : <><Plus size={14} /> Registrar nodo</>}
                </button>
              </form>
            </div>
          </div>
        )}

        <div className={isAdmin || isSoporte ? "lg:col-span-3" : "lg:col-span-5"}>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-800">Nodos registrados</h2>
              <span className="text-xs text-slate-400 bg-slate-100 rounded-full px-2.5 py-1 font-medium">{nodos.length} dispositivos</span>
            </div>
            {loading ? (
              <div className="flex items-center justify-center py-16 gap-2"><Loader2 size={20} className="text-cyan-500 animate-spin" /><span className="text-sm text-slate-400">Cargando nodos...</span></div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-16 gap-2"><AlertCircle size={20} className="text-red-400" /><p className="text-sm text-red-500">{error}</p></div>
            ) : nodos.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-2 text-slate-400"><Cpu size={28} className="opacity-30" /><p className="text-sm">No hay nodos registrados</p></div>
            ) : (
              <div className="divide-y divide-slate-50">
                {nodos.map((nodo) => (
                  <div key={nodo.idNodo} className="px-5 py-4 hover:bg-slate-50 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className={`mt-0.5 w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${nodo.estadoConexion ? "bg-emerald-50 border border-emerald-200" : "bg-slate-100 border border-slate-200"}`}>
                          {nodo.estadoConexion ? <Wifi size={15} className="text-emerald-600" /> : <WifiOff size={15} className="text-slate-400" />}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-semibold text-slate-800 font-mono">{nodo.macAddress}</span>
                            {nodo.estadoConexion ? (
                              <span className="inline-flex items-center gap-1 text-xs font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-full px-2 py-0.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Conectado</span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-xs font-semibold bg-slate-100 text-slate-500 border border-slate-200 rounded-full px-2 py-0.5"><span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span> Desconectado</span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 mt-1"><MapPin size={11} className="text-slate-400 flex-shrink-0" /><span className="text-xs text-slate-600">{nodo.ubicacion}</span></div>
                          <div className="flex items-center gap-1 mt-0.5"><Clock size={11} className="text-slate-400 flex-shrink-0" /><span className="text-xs text-slate-400">Última lectura: {formatFecha(nodo.ultimaLectura)}</span></div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 bg-slate-100 rounded-lg px-2.5 py-1.5 flex-shrink-0"><Activity size={11} className="text-slate-400" /><span className="text-xs font-mono font-medium text-slate-500">#{nodo.idNodo}</span></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {registrado && <NodoRegistradoModal nodo={registrado.nodo} clienteNombre={registrado.clienteNombre} onClose={() => setRegistrado(null)} />}
    </div>
  );
}
