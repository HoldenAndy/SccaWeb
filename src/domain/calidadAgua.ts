/**
 * calidadAgua.ts — Dominio de calidad del agua
 *
 * Única fuente de verdad para los umbrales de los parámetros del sensor.
 * Antes estos valores estaban hardcodeados en DashboardPage, HistorialPage
 * y AnalysisContext por separado. Si el cliente cambia un umbral, se toca
 * solo este archivo y el cambio se propaga a toda la aplicación.
 *
 * Estructura de cada parámetro:
 *   normal  → rango óptimo de operación
 *   warning → zona de precaución (fuera de óptimo pero no crítico)
 *   max     → límite superior para graficar / barra de progreso
 */

export type NivelCalidad = "normal" | "warning" | "critical";

export interface RangoParametro {
  /** Mínimo del rango óptimo */
  normalMin: number;
  /** Máximo del rango óptimo */
  normalMax: number;
  /** Mínimo de la zona de precaución (solo para parámetros con límite inferior) */
  warnMin?: number;
  /** Máximo de la zona de precaución */
  warnMax: number;
  /** Límite máximo para graficar / calcular % en barra de progreso */
  displayMax: number;
}

export const PARAMETROS_CALIDAD = {
  ph: {
    normalMin: 6.5,
    normalMax: 8.5,
    warnMin:   6.0,
    warnMax:   9.0,
    displayMax: 14,
  },
  temperatura: {
    normalMin: 15,
    normalMax: 30,
    warnMin:   12,
    warnMax:   33,
    displayMax: 50,
  },
  turbidez: {
    normalMin: 0,
    normalMax: 4,
    warnMax:   6,
    displayMax: 10,
  },
  tds: {
    normalMin: 0,
    normalMax: 500,
    warnMax:   600,
    displayMax: 1000,
  },
} as const satisfies Record<string, RangoParametro>;

export type ParametroKey = keyof typeof PARAMETROS_CALIDAD;

/**
 * Evalúa el nivel de calidad de un valor individual.
 * Retorna "normal", "warning" o "critical".
 */
export function evaluarParametro(key: ParametroKey, valor: number): NivelCalidad {
  const p = PARAMETROS_CALIDAD[key];
  const enNormal = valor >= p.normalMin && valor <= p.normalMax;
  if (enNormal) return "normal";

  const enWarning =
    valor >= (p.warnMin ?? p.normalMin) && valor <= p.warnMax;
  return enWarning ? "warning" : "critical";
}

/**
 * Evalúa el nivel de calidad global de una lectura completa.
 * El nivel más grave de cualquier parámetro determina el resultado.
 */
export function evaluarLectura(l: {
  ph: number;
  temperatura: number;
  turbidez: number;
  tds: number;
}): NivelCalidad {
  const niveles: NivelCalidad[] = [
    evaluarParametro("ph",          l.ph),
    evaluarParametro("temperatura", l.temperatura),
    evaluarParametro("turbidez",    l.turbidez),
    evaluarParametro("tds",         l.tds),
  ];
  if (niveles.includes("critical")) return "critical";
  if (niveles.includes("warning"))  return "warning";
  return "normal";
}

/**
 * Calcula el porcentaje de avance dentro del rango de visualización.
 * Útil para las barras de progreso de las sensor cards.
 */
export function calcularPorcentaje(key: ParametroKey, valor: number): number {
  const { normalMin, displayMax } = PARAMETROS_CALIDAD[key];
  return Math.min(100, Math.max(0, ((valor - normalMin) / (displayMax - normalMin)) * 100));
}

/**
 * Detecta si algún parámetro está fuera de rango y devuelve la primera alerta.
 * Mismo orden de prioridad que antes: turbidez primero, luego pH.
 * Usado en AnalysisContext para enriquecer los análisis IA.
 */
export function detectarAlerta(turb: number, ph: number): {
  param: string;
  valor: string;
  limite: string;
} | null {
  if (evaluarParametro("turbidez", turb) !== "normal") {
    return {
      param:  "Turbidez",
      valor:  `${turb} NTU`,
      limite: `${PARAMETROS_CALIDAD.turbidez.normalMax} NTU`,
    };
  }
  if (evaluarParametro("ph", ph) !== "normal") {
    return {
      param:  "pH",
      valor:  `${ph}`,
      limite: `${PARAMETROS_CALIDAD.ph.normalMin} – ${PARAMETROS_CALIDAD.ph.normalMax}`,
    };
  }
  return null;
}
