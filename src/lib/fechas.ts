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

export function isoToday(): string {
  return new Date().toISOString().split("T")[0];
}

export function isoNDaysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n + 1);
  return d.toISOString().split("T")[0];
}
