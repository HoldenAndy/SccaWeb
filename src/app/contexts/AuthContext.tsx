import {
  createContext, useContext, useState, useCallback,
  useEffect, type ReactNode,
} from "react";
import {
  login as apiLogin,
  cambiarPassword as apiCambiarPassword,
  type AuthResponse,
  type RolUsuario,
} from "../../api/auth";

export interface SessionUser {
  nombre: string;
  rol: RolUsuario;
  debeCambiarPassword: boolean;
}

interface AuthContextType {
  user: SessionUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AuthResponse>;
  cambiarPassword: (newPassword: string) => Promise<void>;
  logout: () => void;
  /** Helpers de rol */
  isAdmin: boolean;
  isSoporte: boolean;
  isGestionador: boolean;
  isCliente: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = "scca_token";
const USER_KEY  = "scca_user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken]   = useState<string | null>(null);
  const [user, setUser]     = useState<SessionUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /** Restaurar sesión al montar */
  useEffect(() => {
    const savedToken = sessionStorage.getItem(TOKEN_KEY);
    const savedUser  = sessionStorage.getItem(USER_KEY);
    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch {
        sessionStorage.removeItem(TOKEN_KEY);
        sessionStorage.removeItem(USER_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<AuthResponse> => {
    const data = await apiLogin(email, password);
    const newUser: SessionUser = {
      nombre: data.nombre,
      rol: data.rol,
      debeCambiarPassword: data.debeCambiarPassword,
    };
    setToken(data.token);
    setUser(newUser);
    sessionStorage.setItem(TOKEN_KEY, data.token);
    sessionStorage.setItem(USER_KEY, JSON.stringify(newUser));
    return data;
  }, []);

  const cambiarPassword = useCallback(async (newPassword: string) => {
    if (!token) throw new Error("Sin sesión activa");
    await apiCambiarPassword(newPassword, token);
    // Actualizar flag localmente
    setUser((prev) => prev ? { ...prev, debeCambiarPassword: false } : prev);
    const saved = sessionStorage.getItem(USER_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      sessionStorage.setItem(USER_KEY, JSON.stringify({ ...parsed, debeCambiarPassword: false }));
    }
  }, [token]);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
  }, []);

  const isAuthenticated = !!token && !!user && !user.debeCambiarPassword;
  const isAdmin       = user?.rol === "ADMINISTRADOR";
  const isSoporte     = user?.rol === "SOPORTE";
  const isGestionador = user?.rol === "GESTIONADOR";
  const isCliente     = user?.rol === "CLIENTE";

  return (
    <AuthContext.Provider value={{
      user, token, isAuthenticated, isLoading,
      login, cambiarPassword, logout,
      isAdmin, isSoporte, isGestionador, isCliente,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
