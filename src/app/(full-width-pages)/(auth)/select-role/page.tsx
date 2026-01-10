// app/select-role/page.tsx
import { redirect } from "next/navigation";
import { RoleSwitcher } from "@/components/RoleSwitcher";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";

const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

export default async function Page() {
  const token = (await cookies()).get("access_token")?.value;
  if (!token) redirect("/signin");

  const { payload } = await jwtVerify(token, secret);

  if (!Array.isArray(payload.roles) || payload.roles.length <= 1) {
    redirect("/ecommerce");
  }

  return <RoleSwitcher roles={payload.roles} activeRole={payload.activeRole} />;
}
