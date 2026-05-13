import { apiFetch } from "./apiClient";

export interface ImagenDTO {
  idImagen: number;
  idLectura: number;
  rutaArchivo: string;
  pesoKb: number;
  fechaHora: string | number[];
}

export function getImagenPorLectura(idLectura: number): Promise<ImagenDTO> {
  return apiFetch<ImagenDTO>(`/api/v1/imagenes/lectura/${idLectura}`);
}
