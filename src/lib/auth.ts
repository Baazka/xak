import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { RoleCode } from "@/app/config/roleHome";

export interface AuthUser {
  id: string;
  email: string;
  roles: RoleCode[];
  activeRole: RoleCode;
}

const JWT_SECRET = process.env.JWT_SECRET!;

export async function getCurrentUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;

  if (!token) return null;

  try {
    const payload = jwt.verify(token, JWT_SECRET) as any;

    return {
      id: payload.sub,
      email: payload.email,
      roles: payload.roles as RoleCode[],
      activeRole: payload.activeRole as RoleCode,
    };
  } catch {
    return null;
  }
}
