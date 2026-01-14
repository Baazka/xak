// src/context/AuthContext.tsx
"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { AuthUser } from "@/types/auth";
import { fetchWithAuth } from "@/lib/fetchWithAuth";

interface AuthContextValue {
  user: AuthUser | null;
  setUser: (u: AuthUser | null) => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
};

export function AuthProvider({
  initialUser,
  children,
}: {
  initialUser: AuthUser | null;
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<AuthUser | null>(initialUser);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (initialUser) {
      setLoading(false);
      return;
    }

    const hydrate = async () => {
      try {
        const res = await fetchWithAuth("/api/auth/me");
        if (res.ok) {
          setUser(await res.json());
        }
      } finally {
        setLoading(false);
      }
    };

    hydrate();
  }, [initialUser]);

  return <AuthContext.Provider value={{ user, setUser, loading }}>{children}</AuthContext.Provider>;
}
