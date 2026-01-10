"use client";

import { useRouter } from "next/navigation";
import { ROLE_HOME_MAP, RoleCode } from "../app/config/roleHome";
import { useAuth } from "@/context/AuthContext";

interface RoleSwitcherProps {
  roles: RoleCode[];
  activeRole: RoleCode;
}

const ROLE_LABELS: Record<RoleCode, string> = {
  ADMIN: "Админ",
  XAKADMIN: "ХАК Админ",
  USER: "Хэрэглэгч",
};

export function RoleSwitcher({ roles, activeRole }: RoleSwitcherProps) {
  const router = useRouter();
  const { setUser } = useAuth();

  const switchRole = async (roleCode: RoleCode) => {
    await fetch("/api/auth/switch-role", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roleCode }),
    });

    setUser((prev) => (prev ? { ...prev, activeRole: roleCode } : prev));
    router.replace(ROLE_HOME_MAP[roleCode] ?? "/");
  };

  if (!roles?.length || roles.length === 1) return null;

  return (
    <select
      value={activeRole}
      onChange={(e) => switchRole(e.target.value as RoleCode)}
      className="
        h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm
        text-gray-700 shadow-sm
        focus:outline-none focus:ring-2 focus:ring-blue-500/40
        dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200
      "
    >
      {roles.map((code) => (
        <option key={code} value={code}>
          {ROLE_LABELS[code]}
        </option>
      ))}
    </select>
  );
}
