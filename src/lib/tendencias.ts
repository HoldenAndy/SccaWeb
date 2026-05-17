export function calcularTendencia<T extends Record<string, unknown>>(data: T[], key: keyof T, threshold = 0.05): "up" | "down" | "stable" {
  if (data.length < 2) return "stable";
  const last = data[data.length - 1][key] as number;
  const prev = data[data.length - 2][key] as number;
  const diff = last - prev;
  if (Math.abs(diff) < threshold) return "stable";
  return diff > 0 ? "up" : "down";
}
