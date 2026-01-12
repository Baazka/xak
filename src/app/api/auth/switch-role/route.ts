// app/api/auth/switch-role/route.ts
import { NextResponse } from "next/server";
import { cookies, headers } from "next/headers";
import { jwtVerify, SignJWT } from "jose";
import db from "@/lib/db";

const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

export async function POST(req: Request) {
  const { roleCode } = await req.json();

  // 1️⃣ Cookie-оос token авах
  const token = (await cookies()).get("access_token")?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2️⃣ JWT verify
  const { payload } = await jwtVerify(token, secret);

  // 3️⃣ User-д байгаа role эсэхийг шалгах
  if (!payload.roles || !payload.roles.includes(roleCode)) {
    return NextResponse.json({ error: "Role зөвшөөрөгдөөгүй" }, { status: 403 });
  }

  const fromRole = payload.activeRole;
  const toRole = roleCode;

  // 4️⃣ Хэрвээ адилхан бол log хийхгүй
  if (fromRole === toRole) {
    return NextResponse.json({ success: true });
  }

  // 5️⃣ IP + User-Agent авах
  const headerList = await headers();
  const ip =
    headerList.get("x-forwarded-for")?.split(",")[0] ?? headerList.get("x-real-ip") ?? null;

  const userAgent = headerList.get("user-agent");

  // 6️⃣ ROLE LOG INSERT ⭐
  await db.query(
    `
    INSERT INTO reg_user_role_logs
      (user_id, from_role, to_role, ip_address, user_agent)
    VALUES ($1, $2, $3, $4, $5)
    `,
    [payload.id, fromRole, toRole, ip, userAgent]
  );

  // 7️⃣ Шинэ JWT (activeRole солигдсон)
  const newToken = await new SignJWT({
    ...payload,
    activeRole: toRole,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("15m")
    .sign(secret);

  // 8️⃣ Cookie шинэчлэх
  const res = NextResponse.json({ success: true });

  res.cookies.set("access_token", newToken, {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  return res;
}
