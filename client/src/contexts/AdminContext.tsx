import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from "react";
import { trpc } from "@/lib/trpc";

interface AdminContextType {
  isAdmin: boolean;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AdminContext = createContext<AdminContextType | null>(null);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkQuery = trpc.adminAuth.check.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (checkQuery.data !== undefined) {
      setIsAdmin(checkQuery.data.authenticated);
      setLoading(false);
    }
  }, [checkQuery.data]);

  const loginMutation = trpc.adminAuth.login.useMutation();
  const logoutMutation = trpc.adminAuth.logout.useMutation();

  const login = useCallback(async (username: string, password: string) => {
    await loginMutation.mutateAsync({ username, password });
    setIsAdmin(true);
  }, [loginMutation]);

  const logout = useCallback(async () => {
    await logoutMutation.mutateAsync();
    setIsAdmin(false);
  }, [logoutMutation]);

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
