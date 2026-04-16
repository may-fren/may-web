import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { loginApi, logoutApi, isSessionLimitError, type SessionLimitError } from '../services/authService';
import { getAccessToken } from '../services/api';

interface User {
  username: string;
  roles: string[];
  permissions: string[];
}

export interface SessionLimitInfo {
  activeSessions: SessionLimitError['activeSessions'];
  username: string;
  password: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string, forceLogin?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (...permissions: string[]) => boolean;
  sessionLimitInfo: SessionLimitInfo | null;
  clearSessionLimit: () => void;
  forceLogin: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>(null!);

function parseJwt(token: string): { sub: string; roles: string[]; permissions: string[]; exp: number } {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  return JSON.parse(atob(base64));
}

function getUserFromToken(): User | null {
  const token = getAccessToken();
  if (!token) return null;
  try {
    const payload = parseJwt(token);
    if (payload.exp * 1000 < Date.now()) return null;
    return {
      username: payload.sub,
      roles: payload.roles ?? [],
      permissions: payload.permissions ?? [],
    };
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(getUserFromToken);
  const [sessionLimitInfo, setSessionLimitInfo] = useState<SessionLimitInfo | null>(null);

  const login = async (username: string, password: string, forceLogin?: boolean) => {
    try {
      const data = await loginApi({ username, password, forceLogin });
      const payload = parseJwt(data.accessToken);
      setUser({
        username: payload.sub,
        roles: payload.roles ?? [],
        permissions: payload.permissions ?? [],
      });
      setSessionLimitInfo(null);
    } catch (error) {
      if (isSessionLimitError(error)) {
        setSessionLimitInfo({
          activeSessions: error.response.data.activeSessions,
          username,
          password,
        });
        return;
      }
      throw error;
    }
  };

  const forceLogin = async () => {
    if (!sessionLimitInfo) return;
    await login(sessionLimitInfo.username, sessionLimitInfo.password, true);
  };

  const clearSessionLimit = () => setSessionLimitInfo(null);

  const logout = async () => {
    await logoutApi();
    setUser(null);
  };

  const hasPermission = useCallback(
    (permission: string) => user?.permissions.includes(permission) ?? false,
    [user],
  );

  const hasAnyPermission = useCallback(
    (...permissions: string[]) => permissions.some((p) => user?.permissions.includes(p)),
    [user],
  );

  return (
    <AuthContext.Provider value={{ user, login, logout, hasPermission, hasAnyPermission, sessionLimitInfo, clearSessionLimit, forceLogin }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
