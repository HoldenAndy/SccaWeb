export const API = {
  TIMEOUT_MS: 15_000,
} as const;

export const DASHBOARD = {
  CHART_WINDOW_MS: 2 * 60 * 60 * 1000,
  POLLING_MS: 30_000,
} as const;

export const PAGINATION = {
  TABLE_PAGE_SIZE: 8,
  ANALYSIS_PAGE_SIZE: 50,
  LECTURAS_MAX: 500,
} as const;

export const DATE_RANGE = {
  HISTORY_YEARS: 1,
} as const;
