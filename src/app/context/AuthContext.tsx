"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

import { jwtDecode } from "jwt-decode";



interface TokenPayload {
  sub: string;
  roles: string;
  exp: number;
}



interface AuthContextType {
  token: string | null;
  user: {username: string; role: string } | null;
  login: (token: string) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<{ username: string; role: string } | null>(null);
  const [loading, setLoading] = useState(true); // Inicia en estado de carga


  const decodeToken = (token: string) => {
    try {
      const decoded: TokenPayload = jwtDecode<TokenPayload>(token);
      return {
        username: decoded.sub,
        role: decoded.roles,
      };
    } catch (error) {
      console.error("Error al decodificar el token:", error);
      return null;
    }
  };


  
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedToken = localStorage.getItem("token");
      if (storedToken) {
        const userData = decodeToken(storedToken);
        setToken(storedToken);
        setUser(userData);
      }
    }
    setLoading(false); 
  }, []);

    // Función para iniciar sesión
    const login = (token: string) => {
      if (token && typeof token === "string") {
        const userData = decodeToken(token);
        if (userData) {
          localStorage.setItem("token", token);
          setToken(token);
          setUser(userData);
        }
      }
    };


  const logout = () => {
    localStorage.removeItem("token"); 
    setToken(null); 
    setUser(null)
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para usar el contexto de autenticación
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe ser usado dentro de AuthProvider");
  }
  return context;
};
