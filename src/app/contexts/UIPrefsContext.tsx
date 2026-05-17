import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";

type ThemeMode = "light" | "dark" | "system";
type Density = "comfortable" | "compact";

interface UIPrefs {
  theme: ThemeMode;
  density: Density;
  liveTail: boolean;
  setTheme: (t: ThemeMode) => void;
  setDensity: (d: Density) => void;
  setLiveTail: (v: boolean) => void;
  resolvedTheme: "light" | "dark";
}

const Ctx = createContext<UIPrefs | null>(null);

const KEY = "scca:ui-prefs:v1";

function readPrefs(): { theme: ThemeMode; density: Density; liveTail: boolean } {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { theme: "system", density: "comfortable", liveTail: false };
    const parsed = JSON.parse(raw);
    return {
      theme: parsed.theme ?? "system",
      density: parsed.density ?? "comfortable",
      liveTail: parsed.liveTail ?? false,
    };
  } catch {
    return { theme: "system", density: "comfortable", liveTail: false };
  }
}

function systemPrefersDark(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
}

export function UIPrefsProvider({ children }: { children: ReactNode }) {
  const initial = readPrefs();
  const [theme, setThemeState] = useState<ThemeMode>(initial.theme);
  const [density, setDensityState] = useState<Density>(initial.density);
  const [liveTail, setLiveTailState] = useState<boolean>(initial.liveTail);
  const [systemDark, setSystemDark] = useState<boolean>(systemPrefersDark());

  // Listen to OS theme changes when in "system" mode.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const resolvedTheme: "light" | "dark" =
    theme === "dark" ? "dark" : theme === "light" ? "light" : (systemDark ? "dark" : "light");

  // Apply to <html>
  useEffect(() => {
    const root = document.documentElement;
    if (resolvedTheme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
  }, [resolvedTheme]);

  useEffect(() => {
    const root = document.documentElement;
    if (density === "compact") root.classList.add("density-compact");
    else root.classList.remove("density-compact");
  }, [density]);

  // Persist
  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify({ theme, density, liveTail })); } catch { /* */ }
  }, [theme, density, liveTail]);

  const setTheme    = useCallback((t: ThemeMode) => setThemeState(t), []);
  const setDensity  = useCallback((d: Density)   => setDensityState(d), []);
  const setLiveTail = useCallback((v: boolean)   => setLiveTailState(v), []);

  return (
    <Ctx.Provider value={{ theme, density, liveTail, setTheme, setDensity, setLiveTail, resolvedTheme }}>
      {children}
    </Ctx.Provider>
  );
}

export function useUIPrefs(): UIPrefs {
  const v = useContext(Ctx);
  if (!v) throw new Error("useUIPrefs must be used within UIPrefsProvider");
  return v;
}
