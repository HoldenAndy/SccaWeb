import { createBrowserRouter, Navigate, RouterProvider } from "react-router";
import { Layout } from "./components/Layout";
import { DashboardPage } from "./pages/DashboardPage";
import { HistorialPage } from "./pages/HistorialPage";
import { AnalisisIAPage } from "./pages/AnalisisIAPage";
import { LoginPage } from "./pages/LoginPage";
import { UsuariosPage } from "./pages/UsuariosPage";
import { LogsPage } from "./pages/LogsPage";
import { NodosPage } from "./pages/NodosPage";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { AnalysisProvider } from "./contexts/AnalysisContext";
import { Loader2 } from "lucide-react";

// ─── Router (sin cambios respecto al routes.tsx original) ──────────────────

const router = createBrowserRouter([
  {
    path: "/login",
    Component: LoginPage,
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, Component: DashboardPage },
      { path: "historial", Component: HistorialPage },
      { path: "analisis-ia", Component: AnalisisIAPage },
      {
        path: "usuarios",
        element: (
          <ProtectedRoute roles={["ADMINISTRADOR"]}>
            <UsuariosPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "logs",
        element: (
          <ProtectedRoute roles={["ADMINISTRADOR", "SOPORTE"]}>
            <LogsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "nodos",
        element: (
          <ProtectedRoute roles={["ADMINISTRADOR", "SOPORTE", "GESTIONADOR"]}>
            <NodosPage />
          </ProtectedRoute>
        ),
      },
    ],
  },
  { path: "*", element: <Navigate to="/" replace /> },
]);

// ─── InnerApp: orquestador entre Auth y el resto de providers ─────────────
//
// Responsabilidad única: esperar a que AuthProvider hidrate sessionStorage
// y luego pasar el token a AnalysisProvider.
//
// De esta forma AnalysisProvider nunca dispara fetches sin token,
// eliminando la race condition que causaba "No se encontraron nodos"
// en el primer login.

function InnerApp() {
  const { token, isLoading } = useAuth();

  // AuthProvider aún está leyendo sessionStorage → no montar nada todavía.
  // ProtectedRoute tiene su propio spinner, pero este bloqueo previene
  // que AnalysisProvider monte y llame al backend sin token.
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f0f6ff]">
        <Loader2 size={28} className="text-cyan-500 animate-spin" />
      </div>
    );
  }

  return (
    <AnalysisProvider token={token}>
      <RouterProvider router={router} />
    </AnalysisProvider>
  );
}

// ─── Root ──────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <AuthProvider>
      <InnerApp />
    </AuthProvider>
  );
}
