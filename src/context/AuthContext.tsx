// src/context/AuthContext.tsx
"use client";

import { createContext, useContext, useState } from "react";
import { JwtPayload } from "@/lib/jwtPayload";

interface AuthContextValue {
  user: JwtPayload | null;
  setUser: (u: JwtPayload | null) => void;
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
  initialUser: JwtPayload | null;
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<JwtPayload | null>(initialUser);

  return <AuthContext.Provider value={{ user, setUser }}>{children}</AuthContext.Provider>;
}
