import { parseFechaBackend as _parse, toLocalISOString } from "../api/lecturas";

export { toLocalISOString, _parse as parseFechaBackend };

const pad = (n: number) => String(n).padStart(2, "0");

export function formatHora(fecha: string | number[]): string {
  const d = _parse(fecha);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function formatFechaTabla(fecha: string | number[]): string {
  const d = _parse(fecha);
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function formatFechaConSegundos(fecha: string | number[]): string {
  const d = _parse(fecha);
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

// Local-date variants. The original isoToday() / isoNDaysAgo() used
// toISOString() which is UTC — en CDMX (UTC-6) eso devuelve el día siguiente
// después de las 6 PM. Aquí construimos la cadena YYYY-MM-DD desde la fecha
// local del usuario para que el filtro siempre arranque en el día visible.
export function isoToday(): string {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function isoNDaysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n + 1);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
