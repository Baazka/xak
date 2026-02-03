"use client";

import { RoleCode } from "@/app/config/roleHome";
import { useRoleSwitch } from "./useRoleSwitch";

const ROLE_LABELS: Record<RoleCode, string> = {
  SUPERADMIN: "Супер админ",
  ADMIN: "Админ",
  XAKADMIN: "ХАК Админ",
  XAKUSER: "ХАК хэрэглэгч",
  USER: "Хэрэглэгч",
};

export function RoleSwitcherBox({ roles }: { roles: RoleCode[] }) {
  const { switchRole } = useRoleSwitch();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-gray-800 shadow-xl p-8">
        <h1 className="text-2xl font-semibold mb-6 text-center">Роль сонгоно уу</h1>

        <div className="space-y-3">
          {roles.map((role) => (
            <button
              key={role}
              onClick={() => switchRole(role)}
              className="
                w-full rounded-xl border px-4 py-3 text-left
                hover:bg-blue-50 hover:border-blue-500
                dark:hover:bg-gray-700
                transition
              "
            >
              {ROLE_LABELS[role] ?? role}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
