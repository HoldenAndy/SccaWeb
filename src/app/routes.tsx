import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { DashboardPage } from "./pages/DashboardPage";
import { HistorialPage } from "./pages/HistorialPage";
import { AnalisisIAPage } from "./pages/AnalisisIAPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: DashboardPage },
      { path: "historial", Component: HistorialPage },
      { path: "analisis-ia", Component: AnalisisIAPage },
    ],
  },
]);