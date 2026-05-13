import { apiFetch } from "./apiClient";

export interface NodoDTO {
  idNodo: number;
  macAddress: string;
  ubicacion: string;
  estadoConexion: boolean;
  ultimaLectura: string | null;
}

export function getNodos(): Promise<NodoDTO[]> {
  return apiFetch<NodoDTO[]>("/api/v1/nodos");
}
