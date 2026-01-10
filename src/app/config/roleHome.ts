// src/app/config/roleHome.ts
export type RoleCode = "ADMIN" | "XAKADMIN" | "USER";

export const ROLE_HOME_MAP: Record<RoleCode, string> = {
  ADMIN: "/user",
  XAKADMIN: "/ecommerce",
  USER: "/",
};
