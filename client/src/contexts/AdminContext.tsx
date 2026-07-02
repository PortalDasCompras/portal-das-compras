import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from "react";

interface AdminContextType {
  isAdmin: boolean;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AdminContext = createContext<AdminContextType | null>(null);

const ADMIN_USERNAME = "claysson";
const ADMIN_PASSWORD = "1508";

export function AdminProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // Verificar se já está logado ao montar
  useEffect(() => {
    const adminToken = localStorage.getItem("admin_token");
    if (adminToken) {
      setIsAdmin(true);
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      const token = Math.random().toString(36).substring(2, 15);
      localStorage.setItem("admin_token", token);
      setIsAdmin(true);
    } else {
      throw new Error("Credenciais inválidas");
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("admin_token");
    setIsAdmin(false);
  }, []);

  return (
    <AdminContext.Provider value={{ isAdmin, loading, login, logout }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used within AdminProvider");
  return ctx;
}
