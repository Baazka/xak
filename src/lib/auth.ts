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
      id: Number(payload.sub),
      email: payload.email,
      username: payload.username,
      avatar: payload.avatar,
      firstname: payload.firstname,
      lastname: payload.lastname,
      phone: payload.phone,

      activeRole: payload.activeRole,
      roles: payload.roles,
      permissions: payload.permissions,
    };
  } catch {
    return null;
  }
}
