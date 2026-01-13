// app/select-role/page.tsx
import { redirect } from "next/navigation";
import { RoleSwitcherBox } from "@/components/role/RoleSwitcherBox";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";
import { ROLE_HOME_MAP, RoleCode } from "@/app/config/roleHome";

const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

export default async function Page() {
  const token = (await cookies()).get("access_token")?.value;
  if (!token) redirect("/signin");

  // 2️⃣ JWT verify
  let payload: any;
  try {
    const result = await jwtVerify(token, secret);
    payload = result.payload;
  } catch {
    redirect("/signin");
  }

  // 3️⃣ Roles шалгах
  const roles: RoleCode[] = Array.isArray(payload.roles) ? (payload.roles as RoleCode[]) : [];

  // ❌ Role байхгүй бол
  if (roles.length === 0) {
    redirect("/signin");
  }

  // ✅ 1 role → тухайн role-ийн home
  if (roles.length === 1) {
    const role = roles[0];
    const home = ROLE_HOME_MAP[role] ?? "/";
    redirect(home);
  }

  // ✅ 2+ role → role сонгох page
  return <RoleSwitcherBox roles={roles} />;
}
