"use client";

import { RoleCode } from "@/app/config/roleHome";
import { useRoleSwitch } from "./useRoleSwitch";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";

type Props = {
  roles: RoleCode[];
  activeRole: RoleCode;
};

const ROLE_LABELS: Record<RoleCode, string> = {
  ADMIN: "Админ",
  HELPDESK: "Дэд админ",
  SUPERUSER: "ХАК Админ",
  USER: "ХАК хэрэглэгч",
  GOD: "Хэрэглэгч",
};

export default function RoleSwitcherHeader({ roles, activeRole }: Props) {
  const { user } = useAuth();
  const { switchRole } = useRoleSwitch();
  const [loading, setLoading] = useState(false);

  if (!user || user.roles.length <= 1) return null;

  const onChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextRole = e.target.value as RoleCode;
    if (nextRole === user.activeRole) return;

    setLoading(true);
    try {
      await switchRole(nextRole);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <pre className="text-xs">activeRole: {user?.activeRole}</pre>
      <select
        value={user.activeRole}
        onChange={onChange}
        disabled={loading}
        className="h-11 appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-11 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 text-gray-400 dark:text-gray-400 bg-gray-50 dark:bg-gray-800"
      >
        {user.roles.map((r) => (
          <option key={r} value={r} className="text-gray-700 dark:bg-gray-900 dark:text-gray-400">
            {ROLE_LABELS[r] ?? r}
          </option>
        ))}
      </select>
    </>
  );
}
