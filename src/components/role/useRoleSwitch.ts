"use client";

import { useRouter } from "next/navigation";
import { ROLE_HOME_MAP, RoleCode } from "@/app/config/roleHome";
import { useAuth } from "@/context/AuthContext";

export function useRoleSwitch() {
  const router = useRouter();
  const { setUser } = useAuth();

  const switchRole = async (roleCode: RoleCode) => {
    const res = await fetch("/api/auth/switch-role", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roleCode }),
    });

    if (!res.ok) return;

    setUser((prev) => (prev ? { ...prev, activeRole: roleCode } : prev));

    router.replace(ROLE_HOME_MAP[roleCode] ?? "/");
  };

  return { switchRole };
}
