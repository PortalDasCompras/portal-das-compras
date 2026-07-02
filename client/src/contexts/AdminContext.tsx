import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from "react";

interface AdminContextType {
  isAdmin: boolean;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isLocked: boolean;
  lockTimeRemaining: number;
  failedAttempts: number;
}

const AdminContext = createContext<AdminContextType | null>(null);

const ADMIN_USERNAME = "claysson";
const ADMIN_PASSWORD = "1508";
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutos em ms
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutos de bloqueio

export function AdminProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isLocked, setIsLocked] = useState(false);
  const [lockTimeRemaining, setLockTimeRemaining] = useState(0);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [sessionTimeout, setSessionTimeout] = useState<NodeJS.Timeout | null>(null);

  // Verificar se já está logado ao montar
  useEffect(() => {
    const adminToken = localStorage.getItem("admin_token");
    const tokenTimestamp = localStorage.getItem("admin_token_timestamp");
    const lockoutTime = localStorage.getItem("admin_lockout_time");
    const attempts = parseInt(localStorage.getItem("admin_failed_attempts") || "0");

    // Verificar se está bloqueado
    if (lockoutTime) {
      const now = Date.now();
      const lockoutEnd = parseInt(lockoutTime);
      if (now < lockoutEnd) {
        setIsLocked(true);
        setLockTimeRemaining(Math.ceil((lockoutEnd - now) / 1000));
        setLoading(false);
        return;
      } else {
        localStorage.removeItem("admin_lockout_time");
        localStorage.removeItem("admin_failed_attempts");
      }
    }

    // Verificar se a sessão expirou
    if (adminToken && tokenTimestamp) {
      const now = Date.now();
      const tokenTime = parseInt(tokenTimestamp);
      if (now - tokenTime > SESSION_TIMEOUT) {
        localStorage.removeItem("admin_token");
        localStorage.removeItem("admin_token_timestamp");
        setIsAdmin(false);
      } else {
        setIsAdmin(true);
        // Resetar o timer de sessão
        resetSessionTimeout();
      }
    }

    setFailedAttempts(attempts);
    setLoading(false);
  }, []);

  // Timer para o bloqueio
  useEffect(() => {
    if (!isLocked || lockTimeRemaining <= 0) return;

    const timer = setTimeout(() => {
      setLockTimeRemaining(lockTimeRemaining - 1);
      if (lockTimeRemaining - 1 <= 0) {
        setIsLocked(false);
        localStorage.removeItem("admin_lockout_time");
        localStorage.removeItem("admin_failed_attempts");
        setFailedAttempts(0);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [isLocked, lockTimeRemaining]);

  const resetSessionTimeout = useCallback(() => {
    if (sessionTimeout) clearTimeout(sessionTimeout);

    const newTimeout = setTimeout(() => {
      localStorage.removeItem("admin_token");
      localStorage.removeItem("admin_token_timestamp");
      setIsAdmin(false);
    }, SESSION_TIMEOUT);

    setSessionTimeout(newTimeout);
  }, [sessionTimeout]);

  const login = useCallback(
    async (username: string, password: string) => {
      // Verificar se está bloqueado
      const lockoutTime = localStorage.getItem("admin_lockout_time");
      if (lockoutTime) {
        const now = Date.now();
        const lockoutEnd = parseInt(lockoutTime);
        if (now < lockoutEnd) {
          const remainingSeconds = Math.ceil((lockoutEnd - now) / 1000);
          throw new Error(`Acesso bloqueado. Tente novamente em ${remainingSeconds}s`);
        } else {
          localStorage.removeItem("admin_lockout_time");
          localStorage.removeItem("admin_failed_attempts");
          setFailedAttempts(0);
          setIsLocked(false);
        }
      }

      if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        const token = Math.random().toString(36).substring(2, 15);
        const timestamp = Date.now().toString();
        localStorage.setItem("admin_token", token);
        localStorage.setItem("admin_token_timestamp", timestamp);
        localStorage.removeItem("admin_failed_attempts");
        setFailedAttempts(0);
        setIsAdmin(true);
        resetSessionTimeout();
      } else {
        // Incrementar tentativas falhadas
        const newAttempts = failedAttempts + 1;
        localStorage.setItem("admin_failed_attempts", newAttempts.toString());
        setFailedAttempts(newAttempts);

        if (newAttempts >= MAX_FAILED_ATTEMPTS) {
          // Bloquear acesso
          const lockoutEnd = (Date.now() + LOCKOUT_DURATION).toString();
          localStorage.setItem("admin_lockout_time", lockoutEnd);
          setIsLocked(true);
          setLockTimeRemaining(Math.ceil(LOCKOUT_DURATION / 1000));
          throw new Error("Muitas tentativas falhadas. Acesso bloqueado por 15 minutos.");
        }

        throw new Error("Acesso negado");
      }
    },
    [failedAttempts, resetSessionTimeout]
  );

  const logout = useCallback(() => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_token_timestamp");
    localStorage.removeItem("admin_failed_attempts");
    setIsAdmin(false);
    setFailedAttempts(0);
    if (sessionTimeout) clearTimeout(sessionTimeout);
  }, [sessionTimeout]);

  return (
    <AdminContext.Provider
      value={{ isAdmin, loading, login, logout, isLocked, lockTimeRemaining, failedAttempts }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used within AdminProvider");
  return ctx;
}
