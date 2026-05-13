import { Navigate } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import type { RolUsuario } from "../../api/auth";
import { Loader2 } from "lucide-react";

interface Props {
  children: React.ReactNode;
  /** Si se indica, el usuario debe tener uno de estos roles */
  roles?: RolUsuario[];
}

export function ProtectedRoute({ children, roles }: Props) {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f0f6ff]">
        <Loader2 size={28} className="text-cyan-500 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (roles && user && !roles.includes(user.rol)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
