// src/app/config/roleHome.ts
export type RoleCode = "GOD" | "ADMIN" | "HELPDESK" | "SUPERUSER" | "USER";

export const ROLE_HOME_MAP: Record<RoleCode, string> = {
  ADMIN: "/dashboardAdmin",
  HELPDESK: "/dashboardHelpdesk",
  SUPERUSER: "/dashboardXakAdmin",
  USER: "/dashboardUser",
  GOD: "/analytics",
};
export function getHomeByRole(role?: RoleCode) {
  if (!role) return null;
  return ROLE_HOME_MAP[role] ?? null;
}

export const ROUTE_ROLE_MAP: Record<string, RoleCode[]> = Object.entries(ROLE_HOME_MAP).reduce(
  (acc, [role, route]) => {
    if (!acc[route]) acc[route] = [];
    acc[route].push(role as RoleCode);
    return acc;
  },
  {} as Record<string, RoleCode[]>
);
