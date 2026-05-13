import { RouterProvider } from "react-router";
import { router } from "./routes";
import { AnalysisProvider } from "./contexts/AnalysisContext";
import { AuthProvider } from "./contexts/AuthContext";

export default function App() {
  return (
    <AuthProvider>
      <AnalysisProvider>
        <RouterProvider router={router} />
      </AnalysisProvider>
    </AuthProvider>
  );
}
