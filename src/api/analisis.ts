import { apiFetch } from "./apiClient";
import type { PageResponse } from "./lecturas";

export interface AnalisisDTO {
  idAnalisis: number;
  idLectura: number;
  resultadoTexto: string;
  promptUtilizado: string;
  tiempoResMs: number;
  fechaHora: string | number[]; 
}

export function generarAnalisis(idLectura: number): Promise<AnalisisDTO> {
  return apiFetch<AnalisisDTO>(`/api/v1/analisis/generar/${idLectura}`, { method: "POST" });
}

export function getAnalisisPorNodoPaginado(
  idNodo: number,
  inicio: string,
  fin: string,
  page = 0,
  size = 50
): Promise<PageResponse<AnalisisDTO>> {
  const params = new URLSearchParams({ inicio, fin, page: String(page), size: String(size) });
  return apiFetch<PageResponse<AnalisisDTO>>(`/api/v1/analisis/nodo/${idNodo}/paginado?${params}`);
}

export function getAnalisisPorLectura(idLectura: number): Promise<AnalisisDTO> {
  return apiFetch<AnalisisDTO>(`/api/v1/analisis/lectura/${idLectura}`);
}

export function getHistorialAnalisis(): Promise<AnalisisDTO[]> {
  return apiFetch<AnalisisDTO[]>(`/api/v1/analisis/historial`);
}
