// app/api/auth/switch-role/route.ts
import { NextResponse } from "next/server";
import { cookies, headers } from "next/headers";
import { jwtVerify } from "jose";
import db from "@/lib/db";

const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

export async function POST(req: Request) {
  const { roleCode } = await req.json();

  const token = (await cookies()).get("access_token")?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { payload } = await jwtVerify(token, secret);

  const userId = payload.sub as string;
  const fromRole = payload.activeRole as string;

  // 1️⃣ User-д байгаа role эсэх
  const { rows } = await db.query(
    `
  SELECT 1
  FROM reg_user_roles ur
  JOIN ref_user_roles r ON r.id = ur.role_id
  WHERE ur.user_id = $1 AND r.code = $2
  `,
    [userId, roleCode]
  );

  if (rows.length === 0) {
    return NextResponse.json({ error: "Role зөвшөөрөгдөөгүй" }, { status: 403 });
  }

  if (fromRole === roleCode) {
    return NextResponse.json({ success: true });
  }

  // 2️⃣ IP + UA
  const headerList = await headers();
  const ip = headerList.get("x-forwarded-for")?.split(",")[0] ?? headerList.get("x-real-ip");

  const userAgent = headerList.get("user-agent");

  // 3️⃣ ROLE LOG
  await db.query(
    `
    INSERT INTO reg_user_role_logs
      (user_id, from_role, to_role, ip_address, user_agent)
    VALUES ($1, $2, $3, $4, $5)
    `,
    [userId, fromRole, roleCode, ip, userAgent]
  );

  await db.query(
    `UPDATE reg_user_sessions
   SET active_role = $1
   WHERE user_id = $2 AND expires_at > now()`,
    [roleCode, userId]
  );

  return NextResponse.json({ success: true });
}
