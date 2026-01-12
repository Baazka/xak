"use client";

import { createContext, useContext, useState } from "react";
import { RoleCode } from "@/app/config/roleHome";

export interface AuthUser {
  id: string;
  email: string;
  roles: RoleCode[];
  activeRole: RoleCode;
  permissions: string[];
}

interface AuthContextValue {
  user: AuthUser | null;
  setUser: (u: AuthUser) => void;
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

  return <AuthContext.Provider value={{ user, setUser }}>{children}</AuthContext.Provider>;
}
