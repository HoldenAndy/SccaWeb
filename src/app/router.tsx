import { Suspense } from "react";
import { createBrowserRouter, Navigate } from "react-router";
import { lazy } from "react";
import { Layout } from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Loader2 } from "lucide-react";

const LoadingFallback = (
  <div className="min-h-screen flex items-center justify-center bg-[var(--scca-bg)]">
    <Loader2 size={24} strokeWidth={1.5} className="text-[var(--scca-muted)] animate-spin" />
  </div>
);

const LoginPage        = lazy(() => import("./pages/LoginPage").then((m) => ({ default: m.LoginPage })));
const DashboardPage    = lazy(() => import("./pages/DashboardPage").then((m) => ({ default: m.DashboardPage })));
const HistorialPage    = lazy(() => import("./pages/HistorialPage").then((m) => ({ default: m.HistorialPage })));
const AnalisisIAPage   = lazy(() => import("./pages/AnalisisIAPage").then((m) => ({ default: m.AnalisisIAPage })));
const UsuariosPage     = lazy(() => import("./pages/UsuariosPage").then((m) => ({ default: m.UsuariosPage })));
const LogsPage         = lazy(() => import("./pages/LogsPage").then((m) => ({ default: m.LogsPage })));
const NodosPage        = lazy(() => import("./pages/NodosPage").then((m) => ({ default: m.NodosPage })));
const PreferenciasPage = lazy(() => import("./pages/PreferenciasPage").then((m) => ({ default: m.PreferenciasPage })));

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <Suspense fallback={LoadingFallback}><LoginPage /></Suspense>,
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      { index: true,         element: <Suspense fallback={LoadingFallback}><DashboardPage /></Suspense> },
      { path: "historial",   element: <Suspense fallback={LoadingFallback}><HistorialPage /></Suspense> },
      { path: "analisis-ia", element: <Suspense fallback={LoadingFallback}><AnalisisIAPage /></Suspense> },
      { path: "preferencias", element: <Suspense fallback={LoadingFallback}><PreferenciasPage /></Suspense> },
      {
        path: "usuarios",
        element: (
          <ProtectedRoute roles={["ADMINISTRADOR"]}>
            <Suspense fallback={LoadingFallback}><UsuariosPage /></Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: "logs",
        element: (
          <ProtectedRoute roles={["ADMINISTRADOR", "SOPORTE"]}>
            <Suspense fallback={LoadingFallback}><LogsPage /></Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: "nodos",
        element: (
          <ProtectedRoute roles={["ADMINISTRADOR", "SOPORTE", "GESTIONADOR"]}>
            <Suspense fallback={LoadingFallback}><NodosPage /></Suspense>
          </ProtectedRoute>
        ),
      },
    ],
  },
  { path: "*", element: <Navigate to="/" replace /> },
]);
