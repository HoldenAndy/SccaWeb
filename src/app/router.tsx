import { Suspense } from "react";
import { createBrowserRouter, Navigate } from "react-router";
import { lazy } from "react";
import { Layout } from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Loader2 } from "lucide-react";

const LoadingFallback = (
  <div className="min-h-screen flex items-center justify-center bg-[#f0f6ff]">
    <Loader2 size={28} className="text-cyan-500 animate-spin" />
  </div>
);

const LoginPage = lazy(() => import("./pages/LoginPage").then((m) => ({ default: m.LoginPage })));
const DashboardPage = lazy(() => import("./pages/DashboardPage").then((m) => ({ default: m.DashboardPage })));
const HistorialPage = lazy(() => import("./pages/HistorialPage").then((m) => ({ default: m.HistorialPage })));
const AnalisisIAPage = lazy(() => import("./pages/AnalisisIAPage").then((m) => ({ default: m.AnalisisIAPage })));
const UsuariosPage = lazy(() => import("./pages/UsuariosPage").then((m) => ({ default: m.UsuariosPage })));
const LogsPage = lazy(() => import("./pages/LogsPage").then((m) => ({ default: m.LogsPage })));
const NodosPage = lazy(() => import("./pages/NodosPage").then((m) => ({ default: m.NodosPage })));

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
      { index: true, element: <Suspense fallback={LoadingFallback}><DashboardPage /></Suspense> },
      { path: "historial", element: <Suspense fallback={LoadingFallback}><HistorialPage /></Suspense> },
      { path: "analisis-ia", element: <Suspense fallback={LoadingFallback}><AnalisisIAPage /></Suspense> },
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
