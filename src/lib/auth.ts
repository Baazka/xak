import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { JwtPayload } from "@/lib/jwtPayload";
import { AuthUser } from "@/types/auth";

const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

export async function getCurrentUser(): Promise<AuthUser | null> {
  const token = (await cookies()).get("access_token")?.value;
  if (!token) return null;

  const { payload } = await jwtVerify<JwtPayload>(token, secret);

  return {
    id: Number(payload.sub),
    email: payload.email,
    username: payload.username,
    avatar: payload.avatar,

    activeRole: payload.activeRole,
    roles: payload.roles,
    permissions: payload.permissions,
  };
}
