// src/context/AuthContext.jsx
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { authApi } from "../api/auth";
import { api } from "../api/client";

const TOKEN_KEY = "spotify_access_token";
const USER_KEY = "spotify_user_info";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(
    () => localStorage.getItem(TOKEN_KEY) || null,
  );
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState(true);

  const persistSession = useCallback((accessToken, newUser) => {
    if (accessToken) {
      localStorage.setItem(TOKEN_KEY, accessToken);
      setToken(accessToken);
    }
    if (newUser) {
      localStorage.setItem(USER_KEY, JSON.stringify(newUser));
      setUser(newUser);
    }
  }, []);

  const login = useCallback(
    async ({ email, password }) => {
      const res = await authApi.login({ email, password });
      const accessToken = res?.access_token || res?.tokens?.access_token;
      const userData = res?.user;
      persistSession(accessToken, userData);
      return userData;
    },
    [persistSession],
  );

  const register = useCallback(
    async (payload) => {
      const res = await authApi.register(payload);
      if (res?.access_token) {
        persistSession(res.access_token, res.user);
      } else {
        await login({ email: payload.email, password: payload.password });
      }
      return res.user;
    },
    [login, persistSession],
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // bỏ qua nếu backend chưa có logout
    }
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    let active = true;
    const initAuth = async () => {
      if (!localStorage.getItem(TOKEN_KEY)) {
        if (active) setIsLoading(false);
        return;
      }
      try {
        const data = await api.get("/api/users/me");
        const currentUser = data?.user ?? data;
        if (active) {
          setUser(currentUser);
          localStorage.setItem(USER_KEY, JSON.stringify(currentUser));
        }
      } catch {
        if (active) {
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(USER_KEY);
          setToken(null);
          setUser(null);
        }
      } finally {
        if (active) setIsLoading(false);
      }
    };
    initAuth();
    return () => {
      active = false;
    };
  }, []);

  const value = {
    user,
    token,
    isLoading,
    isAuthenticated: !!user && !!token,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth phải được dùng bên trong AuthProvider");
  return ctx;
}
