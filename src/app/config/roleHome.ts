// src/app/config/roleHome.ts
export type RoleCode = "ADMIN" | "XAKADMIN" | "USER" | "SUPERADMIN" | "XAKUSER";

export const ROLE_HOME_MAP: Record<RoleCode, string> = {
  SUPERADMIN: "/dashboard1",
  ADMIN: "/dashboard2",
  XAKADMIN: "/dashboard3",
  XAKUSER: "/dashboard4",
  USER: "/",
};
