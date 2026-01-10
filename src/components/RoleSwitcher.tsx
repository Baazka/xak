"use client";

import { useRouter } from "next/navigation";
import { ROLE_HOME_MAP, RoleCode } from "../app/config/roleHome";

interface RoleSwitcherProps {
  roles: RoleCode[];
  activeRole: RoleCode;
}

export function RoleSwitcher({ roles, activeRole }: RoleSwitcherProps) {
  const router = useRouter();

  const ROLE_LABELS: Record<RoleCode, string> = {
    ADMIN: "Админ",
    XAKADMIN: "ХАК Админ",
    USER: "Хэрэглэгч",
  };

  const switchRole = async (roleCode: RoleCode) => {
    await fetch("/api/auth/switch-role", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roleCode }),
    });

    const target = ROLE_HOME_MAP[roleCode] ?? "/";
    router.replace(target);
  };

  return (
    <select value={activeRole} onChange={(e) => switchRole(e.target.value as RoleCode)}>
      {roles.map((code) => (
        <option key={code} value={code}>
          {ROLE_LABELS[code]}
        </option>
      ))}
    </select>
  );
}
