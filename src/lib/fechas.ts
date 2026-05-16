/**
 * fechas.ts — Utilidades de formateo y manejo de fechas.
 *
 * Re-exporta parseFechaBackend y toLocalISOString de api/lecturas
 * para que las páginas no importen directamente de la capa de API
 * cuando solo necesitan formatear fechas.
 *
 * Centraliza formatters que antes estaban duplicados en DashboardPage,
 * HistorialPage, LogsPage y NodosPage con distintos nombres y firmas.
 */

import { parseFechaBackend as _parse, toLocalISOString } from "../api/lecturas";

export { toLocalISOString };

// Re-exportamos con el mismo nombre para que el resto del código
// no tenga que saber de dónde viene realmente.
export { _parse as parseFechaBackend };

const pad = (n: number) => String(n).padStart(2, "0");

/** "HH:MM" — usado en gráficos de tiempo real (Dashboard) */
export function formatHora(fecha: string | number[]): string {
  const d = _parse(fecha);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** "DD/MM/YYYY HH:MM" — usado en tablas e historial */
export function formatFechaTabla(fecha: string | number[]): string {
  const d = _parse(fecha);
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** "DD/MM/YYYY HH:MM:SS" — usado en logs del servidor */
export function formatFechaConSegundos(fecha: string | number[]): string {
  const d = _parse(fecha);
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

/** "YYYY-MM-DD" del día de hoy — para date pickers */
export function isoToday(): string {
  return new Date().toISOString().split("T")[0];
}

/** "YYYY-MM-DD" de hace N días (inclusive) */
export function isoNDaysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n + 1);
  return d.toISOString().split("T")[0];
}
