import { apiFetch } from "./apiClient";

export interface LogDTO {
  idLog: number;
  nivel: string;
  modulo: string;
  mensaje: string;
  fechaHora: string | number[];
}

export function getLogs(): Promise<LogDTO[]> {
  return apiFetch<LogDTO[]>("/api/v1/logs");
}
