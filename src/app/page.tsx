// src/app/page.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { jwtVerify } from "jose";
import Link from "next/link";

import { getJwtSecret } from "@/lib/jwt";
import type { JwtPayload } from "@/lib/jwtPayload";
import { getHomeByRole, RoleCode } from "@/app/config/roleHome";

export default async function LandingPage() {
  const token = (await cookies()).get("access_token")?.value;

  let home: string | null = null;

  if (token) {
    try {
      const { payload } = await jwtVerify<JwtPayload>(token, getJwtSecret());

      const activeRole = (payload as any)?.activeRole as RoleCode | undefined;
      home = getHomeByRole(activeRole);
    } catch {
      home = null;
    }
  }

  if (home) {
    redirect(home);
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="mb-4 text-4xl font-bold">Тавтай морил</h1>
      <p className="mb-8 text-center">Манай вэбсайт руу тавтай морил!</p>

      <div className="flex gap-4">
        <Link href="/signin" className="rounded bg-black px-6 py-3 text-white">
          Нэвтрэх
        </Link>
      </div>
    </main>
  );
}
