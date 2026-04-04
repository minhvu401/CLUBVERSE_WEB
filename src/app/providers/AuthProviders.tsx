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

import { getProfile } from "@/app/services/api/auth";
import { checkPaid } from "@/app/services/api/payments";

/* ================== TYPES ================== */

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
  isPremium?: boolean;

  [key: string]: unknown;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  loading: boolean;

  login: (token: string, user: User) => void;
  logout: () => void;

  updateUser: (
    patch: Partial<User> | ((prev: User | null) => User | null)
  ) => void;
};

/* ================== CONSTANT KEYS ================== */

const TOKEN_KEY = "accessToken";
const USER_KEY = "user";

/* ================== CONTEXT ================== */

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/* ================== PROVIDER ================== */

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  /* ---------- INIT FROM LOCALSTORAGE ---------- */
  useEffect(() => {
    if (typeof window === "undefined") return;

    const storedToken = localStorage.getItem(TOKEN_KEY);
    const storedUser = localStorage.getItem(USER_KEY);

    let parsedUser: User | null = null;
    if (storedUser) {
      try {
        parsedUser = JSON.parse(storedUser);
      } catch {
        localStorage.removeItem(USER_KEY);
      }
    }

    queueMicrotask(() => {
      setToken(storedToken);
      setUser(parsedUser);
      setLoading(false);
    });
  }, []);

  /* ---------- LOGIN ---------- */
  const login = useCallback(async (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);

    if (typeof window !== "undefined") {
      localStorage.setItem(TOKEN_KEY, newToken);
      localStorage.setItem(USER_KEY, JSON.stringify(newUser));
    }

    // Fetch premium status
    try {
      const paidStatus = await checkPaid(newToken);
      updateUser({ isPremium: paidStatus.hasPaid });
    } catch {
      // Ignore errors
    }
  }, []);

  /* ---------- LOGOUT (🔥 FIXED) ---------- */
  const logout = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }

    setToken(null);
    setUser(null);
  }, []);

  /* ---------- UPDATE USER ---------- */
  const updateUser = useCallback<AuthContextType["updateUser"]>((patch) => {
    setUser((prev) => {
      const next =
        typeof patch === "function"
          ? patch(prev)
          : { ...(prev ?? ({} as User)), ...patch };

      if (typeof window !== "undefined") {
        if (next) localStorage.setItem(USER_KEY, JSON.stringify(next));
        else localStorage.removeItem(USER_KEY);
      }

      return next;
    });
  }, []);

  /* ---------- FETCH FULL PROFILE WHEN TOKEN EXISTS ---------- */
  useEffect(() => {
    if (!token) return;

    let cancelled = false;

    (async () => {
      try {
        const profile = await getProfile(token);
        if (cancelled) return;

        const paidStatus = await checkPaid(token);
        if (cancelled) return;

        updateUser({
          _id: profile._id,
          email: profile.email,
          fullName: profile.fullName,
          role: profile.role,
          avatarUrl: profile.avatarUrl,
          phoneNumber: profile.phoneNumber,
          school: profile.school,
          major: profile.major,
          year: profile.year,
          isPremium: paidStatus.hasPaid,
        });
      } catch {
        // optional: handle 401 -> logout()
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token, updateUser]);

  /* ---------- MEMO ---------- */
  const value = useMemo(
    () => ({ user, token, loading, login, logout, updateUser }),
    [user, token, loading, login, logout, updateUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/* ================== HOOK ================== */

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
