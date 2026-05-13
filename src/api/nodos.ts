import { apiFetch } from "./apiClient";

export interface NodoDTO {
  idNodo: number;
  macAddress: string;
  ubicacion: string;
  estadoConexion: boolean;
  ultimaLectura: string | null;
}

export interface NodoRequest {
  macAddress: string;
  ubicacion: string;
  idUsuario: number;
}

export function getNodos(): Promise<NodoDTO[]> {
  return apiFetch<NodoDTO[]>("/api/v1/nodos");
}

export function getMisNodos(): Promise<NodoDTO[]> {
  return apiFetch<NodoDTO[]>("/api/v1/nodos/mis-nodos");
}

export function registrarNodo(req: NodoRequest): Promise<NodoDTO> {
  return apiFetch<NodoDTO>("/api/v1/nodos", {
    method: "POST",
    body: JSON.stringify(req),
  });
}
