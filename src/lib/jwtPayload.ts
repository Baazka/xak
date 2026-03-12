// src/lib/jwtPayload.ts
import { RoleCode } from "@/app/config/roleHome";

export interface JwtPayload {
  org_id: number;
  org_register_no: string;
  org_legal_name: string;
  org_phone: string;
  org_email: string;
  org_address: string;
  org_head_name: string;
  org_head_phone: string;
  org_head_email?: string;
  id: number;
  email: string;
  username: string;
  user_level_id: number;
  user_level_name: string;
  user_phone?: string;
  user_register_no?: string;
  role_label: string;
  role_code: string;
  role_text: string;
  activeRole: RoleCode;
  roles: RoleCode[];
  permissions: string[];

  iat?: number;
  exp?: number;
}
