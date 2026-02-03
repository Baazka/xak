// app/select-role/page.tsx
import { redirect } from "next/navigation";
import { RoleSwitcherBox } from "@/components/role/RoleSwitcherBox";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";
import { ROLE_HOME_MAP } from "@/app/config/roleHome";
import type { RoleCode } from "@/app/config/roleHome";
import { getJwtSecret } from "@/lib/jwt";

export default async function Page() {
  const token = (await cookies()).get("access_token")?.value;
  if (!token) redirect("/signin");

  let payload: any;
  try {
    const result = await jwtVerify(token, getJwtSecret());
    payload = result.payload;
  } catch {
    redirect("/signin");
  }

  const roles: RoleCode[] = Array.isArray(payload.roles) ? (payload.roles as RoleCode[]) : [];

  if (roles.length === 0) redirect("/signin");

  if (roles.length === 1) {
    const role = roles[0];
    redirect(ROLE_HOME_MAP[role] ?? "/");
  }

  return <RoleSwitcherBox roles={roles} />;
}
