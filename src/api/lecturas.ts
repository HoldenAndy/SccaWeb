import { apiFetch } from "./apiClient";

export interface LecturaDTO {
  idLectura: number;
  idNodo: number;
  ph: number;
  temperatura: number;
  turbidez: number;
  tds: number;
  fechaHora: string | number[];
}

export interface PageResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  isLast: boolean;
}


export function parseFechaBackend(fecha: string | number[]): Date {
  if (Array.isArray(fecha)) {
    const [y, mo, d, h = 0, mi = 0, s = 0] = fecha;
    return new Date(y, mo - 1, d, h, mi, s);
  }
  return new Date(fecha);
}

export function toLocalISOString(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
  );
}

export function getUltimaLectura(idNodo: number): Promise<LecturaDTO> {
  return apiFetch<LecturaDTO>(`/api/v1/lecturas/nodo/${idNodo}/ultima`);
}

export function getHistorialPaginado(
  idNodo: number,
  inicio: string,
  fin: string,
  page = 0,
  size = 8,
  sortBy = "fechaHora",
  sortDir = "desc"
): Promise<PageResponse<LecturaDTO>> {
  const params = new URLSearchParams({ inicio, fin, page: String(page), size: String(size), sortBy, sortDir });
  return apiFetch<PageResponse<LecturaDTO>>(`/api/v1/lecturas/nodo/${idNodo}/paginado?${params}`);
}

export function getDatosGraficos(idNodo: number, inicio: string, fin: string): Promise<LecturaDTO[]> {
  const params = new URLSearchParams({ inicio, fin });
  return apiFetch<LecturaDTO[]>(`/api/v1/lecturas/nodo/${idNodo}/graficos?${params}`);
}

