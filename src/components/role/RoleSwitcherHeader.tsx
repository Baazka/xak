"use client";

import { RoleCode } from "@/app/config/roleHome";
import { useRoleSwitch } from "./useRoleSwitch";

const ROLE_LABELS: Record<RoleCode, string> = {
  ADMIN: "Админ",
  XAKADMIN: "ХАК Админ",
  USER: "Хэрэглэгч",
};

export function RoleSwitcherHeader({
  roles,
  activeRole,
}: {
  roles: RoleCode[];
  activeRole: RoleCode;
}) {
  const { switchRole } = useRoleSwitch();

  if (roles.length <= 1) return null;

  return (
    <select
      value={activeRole}
      onChange={(e) => switchRole(e.target.value as RoleCode)}
      className="
        h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm
        dark:border-gray-700 dark:bg-gray-900
      "
    >
      {roles.map((r) => (
        <option key={r} value={r}>
          {ROLE_LABELS[r]}
        </option>
      ))}
    </select>
  );
}
