// src/app/config/roleHome.ts
export type RoleCode = "GOD" | "ADMIN" | "HELPDESK" | "SUPERUSER" | "USER";

export const ROLE_HOME_MAP: Record<RoleCode, string> = {
  ADMIN: "/dashboard1",
  HELPDESK: "/dashboard2",
  SUPERUSER: "/dashboard3",
  USER: "/dashboard4",
  GOD: "/",
};
