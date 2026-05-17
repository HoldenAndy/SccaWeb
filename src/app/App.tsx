import { RouterProvider } from "react-router";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { AnalysisProvider } from "./contexts/AnalysisContext";
import { router } from "./router";
import { Loader2 } from "lucide-react";

function InnerApp() {
  const { token, isLoading } = useAuth();

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

export default function App() {
  return (
    <AuthProvider>
      <InnerApp />
    </AuthProvider>
  );
}
