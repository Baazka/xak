// src/lib/auth.ts
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import type { JwtPayload } from "@/lib/jwtPayload";
import type { AuthUser } from "@/types/auth";
import { getJwtSecret } from "@/lib/jwt";

export async function getCurrentUser(): Promise<AuthUser | null> {
  const token = (await cookies()).get("access_token")?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify<JwtPayload>(token, getJwtSecret());

    return {
      org_id: payload.org_id,
      org_register_no: payload.org_register_no,
      org_legal_name: payload.org_legal_name,
      org_phone: payload.org_phone,
      org_email: payload.org_email,
      org_address: payload.org_address,
      org_head_name: payload.org_head_name,
      org_head_phone: payload.org_head_phone,
      org_head_email: payload.org_head_email,

      id: Number(payload.id),
      user_level_id: payload.user_level_id,
      user_level_name: payload.user_level_name,
      email: payload.email,
      username: payload.username,
      user_phone: String(payload.user_phone),
      user_register_no: payload.user_register_no,
      role_label: payload.role_label,
      role_code: payload.role_code,
      role_text: payload.role_text,

      activeRole: payload.activeRole,
      roles: payload.roles,
      permissions: payload.permissions,
    };
  } catch {
    return null;
  }
}
