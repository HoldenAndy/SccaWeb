export type ErrorCode = "NO_NODES" | "NO_CONNECTION" | "SERVER_ERROR";

export interface AppError {
  code: ErrorCode;
  message: string;
}

export function parseError(err: unknown): AppError {
  if (err instanceof Error) {
    const msg = err.message;
    if (msg.includes("No se encontraron nodos")) return { code: "NO_NODES", message: msg };
    if (msg.includes("conectar") || msg.includes("conexión") || msg.includes("NetworkError") || msg.includes("Failed")) {
      return { code: "NO_CONNECTION", message: msg };
    }
    return { code: "SERVER_ERROR", message: msg };
  }
  return { code: "SERVER_ERROR", message: String(err) };
}
