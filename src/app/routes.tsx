import { createBrowserRouter, Navigate } from "react-router";
import { Layout } from "./components/Layout";
import { DashboardPage } from "./pages/DashboardPage";
import { HistorialPage } from "./pages/HistorialPage";
import { AnalisisIAPage } from "./pages/AnalisisIAPage";
import { LoginPage } from "./pages/LoginPage";
import { UsuariosPage } from "./pages/UsuariosPage";
import { LogsPage } from "./pages/LogsPage";
import { NodosPage } from "./pages/NodosPage";
import { ProtectedRoute } from "./components/ProtectedRoute";

export const router = createBrowserRouter([
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