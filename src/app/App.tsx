import { RouterProvider } from "react-router";
import { Toaster } from "sonner";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { AnalysisProvider } from "./contexts/AnalysisContext";
import { UIPrefsProvider, useUIPrefs } from "./contexts/UIPrefsContext";
import { NotificationsProvider } from "./contexts/NotificationsContext";
import { router } from "./router";
import { Loader2 } from "lucide-react";

function InnerApp() {
  const { token, isLoading } = useAuth();
  const { resolvedTheme } = useUIPrefs();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--scca-bg)]">
        <Loader2 size={24} strokeWidth={1.5} className="text-[var(--scca-muted)] animate-spin" />
      </div>
    );
  }

  return (
    <AnalysisProvider token={token}>
      <NotificationsProvider>
        <RouterProvider router={router} />
        <Toaster
          position="bottom-right"
          theme={resolvedTheme}
          toastOptions={{
            style: {
              background: "var(--scca-panel)",
              border: "1px solid var(--scca-hair)",
              color: "var(--scca-ink)",
              borderRadius: "4px",
              fontFamily: "Geist, system-ui, sans-serif",
              fontSize: "13px",
            },
          }}
        />
      </NotificationsProvider>
    </AnalysisProvider>
  );
}

export default function App() {
  return (
    <UIPrefsProvider>
      <AuthProvider>
        <InnerApp />
      </AuthProvider>
    </UIPrefsProvider>
  );
}
