// src/lib/jwtPayload.ts
import { RoleCode } from "@/app/config/roleHome";

export interface JwtPayload {
  sub: string; // user.id
  email: string;
  username?: string;
  avatar?: string;
  firstname?: string;
  lastname?: string;
  phone?: string;

  activeRole: RoleCode;
  roles: RoleCode[];
  permissions: string[];

  iat?: number;
  exp?: number;
}
