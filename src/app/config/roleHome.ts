// src/app/config/roleHome.ts
export type RoleCode = "GOD" | "ADMIN" | "HELPDESK" | "SUPERUSER" | "USER";

export const ROLE_HOME_MAP: Record<RoleCode, string> = {
  ADMIN: "/dashboardAdmin",
  HELPDESK: "/dashboardHelpdesk",
  SUPERUSER: "/dashboardXakAdmin",
  USER: "/dashboardUser",
  GOD: "/analytics",
};
