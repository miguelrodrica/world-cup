import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type { User } from "./types";
import * as api from "./api";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  refresh: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const a = api.getAuth();
    if (a) {
      setUser(a.user);
      setToken(a.token);
    }
    setLoading(false);
  }, []);

  const refresh = useCallback(() => {
    const a = api.getAuth();
    setUser(a?.user ?? null);
    setToken(a?.token ?? null);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.login(email, password);
    setUser(res.user);
    setToken(res.token);
  }, []);

  const register = useCallback(
    async (username: string, email: string, password: string) => {
      const res = await api.register(username, email, password);
      setUser(res.user);
      setToken(res.token);
    },
    [],
  );

  const logout = useCallback(() => {
    api.logout();
    setUser(null);
    setToken(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
