import { Droplets, Thermometer, Eye, Zap } from "lucide-react";
import { PARAMETROS_CALIDAD } from "../domain/calidadAgua";

/* Direction A — "Press". Solid ink colors, neutral pastel backgrounds (used by sensor cards). */

export const chartConfigs = [
  { key: "ph"          as const, label: "pH",           unit: "",    icon: Droplets,    color: "#1d3a6f", fill: "#eef1f7", refLine: 7.0,                                       refLabel: "Neutro",     min: PARAMETROS_CALIDAD.ph.normalMin,          max: PARAMETROS_CALIDAD.ph.normalMax          },
  { key: "temperatura" as const, label: "Temperatura",  unit: "°C",  icon: Thermometer, color: "#c25e1a", fill: "#faefe5", refLine: undefined as number | undefined,           refLabel: undefined,    min: PARAMETROS_CALIDAD.temperatura.normalMin, max: 35                                       },
  { key: "turbidez"    as const, label: "Turbidez",     unit: "NTU", icon: Eye,         color: "#5a2b7a", fill: "#f1ebf5", refLine: PARAMETROS_CALIDAD.turbidez.normalMax,      refLabel: "Límite máx.", min: PARAMETROS_CALIDAD.turbidez.normalMin,    max: 5                                        },
  { key: "tds"         as const, label: "TDS",          unit: "ppm", icon: Zap,         color: "#1f5a3c", fill: "#eaf2ed", refLine: PARAMETROS_CALIDAD.tds.normalMax,           refLabel: "Límite",     min: PARAMETROS_CALIDAD.tds.normalMin,         max: 600                                      },
];

/* sensorMeta drives SensorCard. Press direction uses subtle paper-tone backgrounds. */
export const sensorMeta = [
  { key: "ph"          as const, label: "pH",          unit: "",    icon: Droplets,    color: "text-[var(--scca-ph)]",   bg: "bg-[var(--scca-accent-soft)]", border: "border-[var(--scca-hair)]", bar: "bg-[var(--scca-ph)]",   rangeMin: PARAMETROS_CALIDAD.ph.normalMin,          rangeMax: PARAMETROS_CALIDAD.ph.normalMax          },
  { key: "temperatura" as const, label: "Temperatura", unit: "°C",  icon: Thermometer, color: "text-[var(--scca-temp)]", bg: "bg-[#faefe5]",                 border: "border-[var(--scca-hair)]", bar: "bg-[var(--scca-temp)]", rangeMin: PARAMETROS_CALIDAD.temperatura.normalMin, rangeMax: PARAMETROS_CALIDAD.temperatura.normalMax },
  { key: "turbidez"    as const, label: "Turbidez",    unit: "NTU", icon: Eye,         color: "text-[var(--scca-turb)]", bg: "bg-[#f1ebf5]",                 border: "border-[var(--scca-hair)]", bar: "bg-[var(--scca-turb)]", rangeMin: PARAMETROS_CALIDAD.turbidez.normalMin,    rangeMax: PARAMETROS_CALIDAD.turbidez.normalMax    },
  { key: "tds"         as const, label: "TDS",         unit: "ppm", icon: Zap,         color: "text-[var(--scca-tds)]",  bg: "bg-[#eaf2ed]",                 border: "border-[var(--scca-hair)]", bar: "bg-[var(--scca-tds)]",  rangeMin: PARAMETROS_CALIDAD.tds.normalMin,         rangeMax: PARAMETROS_CALIDAD.tds.normalMax         },
];

export const analysisSensorMeta = [
  { key: "ph"   as const, label: "pH",          unit: "",    icon: Droplets,    color: "text-[var(--scca-ph)]",   bg: "bg-[var(--scca-accent-soft)]", border: "border-[var(--scca-hair)]" },
  { key: "temp" as const, label: "Temperatura", unit: "°C",  icon: Thermometer, color: "text-[var(--scca-temp)]", bg: "bg-[#faefe5]",                 border: "border-[var(--scca-hair)]" },
  { key: "turb" as const, label: "Turbidez",    unit: "NTU", icon: Eye,         color: "text-[var(--scca-turb)]", bg: "bg-[#f1ebf5]",                 border: "border-[var(--scca-hair)]" },
  { key: "tds"  as const, label: "TDS",         unit: "ppm", icon: Zap,         color: "text-[var(--scca-tds)]",  bg: "bg-[#eaf2ed]",                 border: "border-[var(--scca-hair)]" },
];
