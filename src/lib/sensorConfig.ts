import { Droplets, Thermometer, Eye, Zap } from "lucide-react";
import { PARAMETROS_CALIDAD } from "../domain/calidadAgua";

export const chartConfigs = [
  { key: "ph" as const, label: "pH", unit: "", icon: Droplets, color: "#06b6d4", fill: "#e0f9ff", refLine: 7.0, refLabel: "Neutro", min: PARAMETROS_CALIDAD.ph.normalMin, max: PARAMETROS_CALIDAD.ph.normalMax },
  { key: "temperatura" as const, label: "Temperatura", unit: "°C", icon: Thermometer, color: "#f97316", fill: "#fff7ed", refLine: undefined as number | undefined, refLabel: undefined, min: PARAMETROS_CALIDAD.temperatura.normalMin, max: 35 },
  { key: "turbidez" as const, label: "Turbidez", unit: "NTU", icon: Eye, color: "#a855f7", fill: "#faf5ff", refLine: PARAMETROS_CALIDAD.turbidez.normalMax, refLabel: "Límite máx.", min: PARAMETROS_CALIDAD.turbidez.normalMin, max: 5 },
  { key: "tds" as const, label: "TDS", unit: "ppm", icon: Zap, color: "#10b981", fill: "#ecfdf5", refLine: PARAMETROS_CALIDAD.tds.normalMax, refLabel: "Límite", min: PARAMETROS_CALIDAD.tds.normalMin, max: 600 },
];

export const sensorMeta = [
  { key: "ph" as const, label: "pH", unit: "", icon: Droplets, color: "text-cyan-600", bg: "bg-cyan-50", border: "border-cyan-100", bar: "bg-cyan-500", rangeMin: PARAMETROS_CALIDAD.ph.normalMin, rangeMax: PARAMETROS_CALIDAD.ph.normalMax },
  { key: "temperatura" as const, label: "Temperatura", unit: "°C", icon: Thermometer, color: "text-orange-500", bg: "bg-orange-50", border: "border-orange-100", bar: "bg-orange-500", rangeMin: PARAMETROS_CALIDAD.temperatura.normalMin, rangeMax: PARAMETROS_CALIDAD.temperatura.normalMax },
  { key: "turbidez" as const, label: "Turbidez", unit: "NTU", icon: Eye, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100", bar: "bg-amber-500", rangeMin: PARAMETROS_CALIDAD.turbidez.normalMin, rangeMax: PARAMETROS_CALIDAD.turbidez.normalMax },
  { key: "tds" as const, label: "TDS", unit: "ppm", icon: Zap, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100", bar: "bg-emerald-500", rangeMin: PARAMETROS_CALIDAD.tds.normalMin, rangeMax: PARAMETROS_CALIDAD.tds.normalMax },
];

export const analysisSensorMeta = [
  { key: "ph" as const, label: "pH", unit: "", icon: Droplets, color: "text-cyan-600", bg: "bg-cyan-50", border: "border-cyan-100" },
  { key: "temp" as const, label: "Temperatura", unit: "°C", icon: Thermometer, color: "text-orange-500", bg: "bg-orange-50", border: "border-orange-100" },
  { key: "turb" as const, label: "Turbidez", unit: "NTU", icon: Eye, color: "text-purple-500", bg: "bg-purple-50", border: "border-purple-100" },
  { key: "tds" as const, label: "TDS", unit: "ppm", icon: Zap, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
];
