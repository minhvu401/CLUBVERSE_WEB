"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
  useMemo,
} from "react";

export type User = {
  id?: string;
  _id?: string;
  fullName: string;
  email: string;

  role?: string;
  avatarUrl?: string;
  phoneNumber?: string;
  school?: string;
  major?: string;
  year?: number;

  [key: string]: any;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  loading: boolean;

  login: (token: string, user: User) => void;
  logout: () => void;

  updateUser: (patch: Partial<User> | ((prev: User | null) => User | null)) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const storedToken = localStorage.getItem("accessToken");
    const storedUser = localStorage.getItem("user");

    if (storedToken) setToken(storedToken);

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem("user");
      }
    }

    setLoading(false);
  }, []);

  const login = useCallback((newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);

    if (typeof window !== "undefined") {
      localStorage.setItem("accessToken", newToken);
      localStorage.setItem("user", JSON.stringify(newUser));
    }
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);

    if (typeof window !== "undefined") {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
    }
  }, []);

  // ✅ QUAN TRỌNG: useCallback để updateUser không đổi reference mỗi render
  const updateUser = useCallback<AuthContextType["updateUser"]>((patch) => {
    setUser((prev) => {
      const next = typeof patch === "function" ? patch(prev) : { ...(prev ?? ({} as User)), ...patch };

      if (typeof window !== "undefined") {
        if (next) localStorage.setItem("user", JSON.stringify(next));
        else localStorage.removeItem("user");
      }

      return next;
    });
  }, []);

  // ✅ QUAN TRỌNG: memo value để hạn chế rerender không cần thiết
  const value = useMemo(
    () => ({ user, token, loading, login, logout, updateUser }),
    [user, token, loading, login, logout, updateUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
