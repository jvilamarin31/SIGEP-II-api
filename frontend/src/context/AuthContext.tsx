import React, { createContext, useCallback, useContext, useState } from "react";
import type { AuthUser, LoginResponse } from "../types";
import { RolUsuario } from "../types";

interface JwtPayload {
  sub?: string;
  rol?: RolUsuario;
  numeroIdentificacion?: string;
  exp?: number;
}

interface AuthContextType {
  user: AuthUser | null;
  login: (loginResponse: LoginResponse) => void;
  logout: () => void;
  isAuthenticated: boolean;
  hasRole: (roles: RolUsuario[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = "sigep_user";

const decodeJwtPayload = (token: string): JwtPayload | null => {
  try {
    const payload = token.split(".")[1];

    if (!payload) return null;

    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const paddedBase64 = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    const jsonPayload = decodeURIComponent(
      atob(paddedBase64)
        .split("")
        .map((char) => `%${`00${char.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join("")
    );

    return JSON.parse(jsonPayload) as JwtPayload;
  } catch {
    return null;
  }
};

const isTokenExpired = (token: string): boolean => {
  const payload = decodeJwtPayload(token);

  if (!payload?.exp) return true;

  return payload.exp * 1000 <= Date.now();
};

const buildAuthUser = (loginResponse: LoginResponse): AuthUser => {
  const payload = decodeJwtPayload(loginResponse.token);

  return {
    ...loginResponse,
    id: payload?.sub,
    rol: payload?.rol ?? RolUsuario.ServidorPublico,
    tokenExp: payload?.exp,
  };
};

const getStoredUser = (): AuthUser | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const parsed = JSON.parse(stored) as AuthUser;

    if (!parsed.token || isTokenExpired(parsed.token)) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }

    return buildAuthUser(parsed);
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(getStoredUser);

  const login = useCallback((loginResponse: LoginResponse) => {
    const userData = buildAuthUser(loginResponse);
    setUser(userData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const hasRole = useCallback((roles: RolUsuario[]) => {
    if (!user?.rol) return false;
    return roles.includes(user.rol);
  }, [user?.rol]);

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
