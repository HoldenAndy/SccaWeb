import { type AnalisisDTO } from "../api/analisis";
import { type LecturaDTO, parseFechaBackend } from "../api/lecturas";
import { detectarAlerta } from "../domain/calidadAgua";

export interface AnalisisEnriquecido {
  id: number;
  idLectura: number;
  fecha: string;
  fechaISO: string;
  resumen: string;
  estado: "Normal" | "Aviso";
  ph: number;
  temp: number;
  turb: number;
  tds: number;
  tiempo: string;
  texto: string;
  recomendacion: string;
  alerta: { param: string; valor: string; limite: string } | null;
}

function formatFecha(fecha: string | number[]): string {
  const d = parseFechaBackend(fecha);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function getFechaISO(fecha: string | number[]): string {
  return parseFechaBackend(fecha).toISOString().split("T")[0];
}

function msToTiempo(ms: number): string {
  return ms < 1000 ? `${ms}ms` : `${Math.round(ms / 1000)}s`;
}

export function enriquecerAnalisis(a: AnalisisDTO, lecturaMap: Map<number, LecturaDTO>): AnalisisEnriquecido {
  const lec = lecturaMap.get(a.idLectura);
  const ph = lec?.ph ?? 0;
  const temp = lec?.temperatura ?? 0;
  const turb = lec?.turbidez ?? 0;
  const tds = lec?.tds ?? 0;

  const alerta = detectarAlerta(turb, ph);
  const primeraLinea = a.resultadoTexto.split("\n").find((l) => l.trim()) ?? "";
  const resumen = primeraLinea.length > 120 ? primeraLinea.slice(0, 120) + "…" : primeraLinea;

  const lineas = a.resultadoTexto.split("\n").map((l) => l.trim()).filter(Boolean);
  const recIdx = lineas.findLastIndex((l) => /^(Se recomienda|Recomendaci)/i.test(l));
  const recomendacion = recIdx !== -1 ? lineas[recIdx] : "Continuar con el monitoreo regular.";

  return {
    id: a.idAnalisis,
    idLectura: a.idLectura,
    fecha: formatFecha(a.fechaHora),
    fechaISO: getFechaISO(a.fechaHora),
    resumen,
    estado: alerta ? "Aviso" : "Normal",
    ph, temp, turb, tds,
    tiempo: msToTiempo(a.tiempoResMs),
    texto: a.resultadoTexto,
    recomendacion,
    alerta,
  };
}
