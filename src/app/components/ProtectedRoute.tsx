import { Navigate } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import type { RolUsuario } from "../../api/auth";

interface Props {
  children: React.ReactNode;
  roles?: RolUsuario[];
}

export function ProtectedRoute({ children, roles }: Props) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles && user && !roles.includes(user.rol)) return <Navigate to="/" replace />;

  return <>{children}</>;
}
