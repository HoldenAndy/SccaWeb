export type NivelCalidad = "normal" | "warning" | "critical";

export interface RangoParametro {
  normalMin: number;
  normalMax: number;
  warnMin?: number;
  warnMax: number;
  displayMax: number;
}

export const PARAMETROS_CALIDAD = {
  ph: { normalMin: 6.5, normalMax: 8.5, warnMin: 6.0, warnMax: 9.0, displayMax: 14 },
  temperatura: { normalMin: 15, normalMax: 30, warnMin: 12, warnMax: 33, displayMax: 50 },
  turbidez: { normalMin: 0, normalMax: 4, warnMax: 6, displayMax: 10 },
  tds: { normalMin: 0, normalMax: 500, warnMax: 600, displayMax: 1000 },
} as const satisfies Record<string, RangoParametro>;

export type ParametroKey = keyof typeof PARAMETROS_CALIDAD;

export function evaluarParametro(key: ParametroKey, valor: number): NivelCalidad {
  const p = PARAMETROS_CALIDAD[key];
  if (valor >= p.normalMin && valor <= p.normalMax) return "normal";
  const enWarning = valor >= (p.warnMin ?? p.normalMin) && valor <= p.warnMax;
  return enWarning ? "warning" : "critical";
}

export function evaluarLectura(l: { ph: number; temperatura: number; turbidez: number; tds: number }): NivelCalidad {
  const niveles: NivelCalidad[] = [
    evaluarParametro("ph", l.ph),
    evaluarParametro("temperatura", l.temperatura),
    evaluarParametro("turbidez", l.turbidez),
    evaluarParametro("tds", l.tds),
  ];
  if (niveles.includes("critical")) return "critical";
  if (niveles.includes("warning")) return "warning";
  return "normal";
}

export function calcularPorcentaje(key: ParametroKey, valor: number): number {
  const { normalMin, displayMax } = PARAMETROS_CALIDAD[key];
  return Math.min(100, Math.max(0, ((valor - normalMin) / (displayMax - normalMin)) * 100));
}

export function detectarAlerta(turb: number, ph: number): { param: string; valor: string; limite: string } | null {
  if (evaluarParametro("turbidez", turb) !== "normal") {
    return { param: "Turbidez", valor: `${turb} NTU`, limite: `${PARAMETROS_CALIDAD.turbidez.normalMax} NTU` };
  }
  if (evaluarParametro("ph", ph) !== "normal") {
    return { param: "pH", valor: `${ph}`, limite: `${PARAMETROS_CALIDAD.ph.normalMin} – ${PARAMETROS_CALIDAD.ph.normalMax}` };
  }
  return null;
}
