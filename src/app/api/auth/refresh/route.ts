// src/app/api/auth/refresh/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import db from "@/lib/db";
const bcrypt = require("bcryptjs");

const ACCESS_TOKEN_TTL = 60 * 15;

export async function POST() {
  const cookieStore = await cookies();
  const refresh = cookieStore.get("refresh_token")?.value;

  if (!refresh) {
    return NextResponse.json({ error: "No refresh token" }, { status: 401 });
  }

  // 🔐 1. Refresh session шалгах
  const { rows: sessions } = await db.query(
    "SELECT * FROM reg_user_sessions WHERE expires_at > now()"
  );

  let session = null;
  for (const s of sessions) {
    if (bcrypt.compareSync(refresh, s.refresh_token_hash)) {
      session = s;
      break;
    }
  }

  if (!session) {
    return NextResponse.json({ error: "Invalid refresh token" }, { status: 401 });
  }

  // 👤 2. User
  const { rows: users } = await db.query("SELECT id, email FROM reg_users WHERE id=$1", [
    session.user_id,
  ]);
  const user = users[0];

  // 🎭 3. Roles
  const { rows: roles } = await db.query(
    `
    SELECT r.id, r.code
    FROM reg_user_roles ur
    JOIN ref_user_roles r ON r.id = ur.role_id
    WHERE ur.user_id = $1
    `,
    [user.id]
  );

  if (!roles.length) {
    return NextResponse.json({ error: "No roles" }, { status: 403 });
  }

  const activeRoleCode = session.active_role;

  // roles 
  const activeRole = roles.find((r) => r.code === activeRoleCode);

  if (!activeRole) {
    return NextResponse.json({ error: "Active role not found" }, { status: 403 });
  }
  // 🔑 4. Permissions (ACTIVE ROLE)
  const { rows: perms } = await db.query(
    `
    SELECT DISTINCT p.code
    FROM reg_user_role_permissions rp
    JOIN ref_user_permissions p ON p.id = rp.permission_id
    WHERE rp.role_id = $1
    `,
    [activeRole.id]
  );

  const permissions = perms.map((p) => p.code);

  // 🪙 5. NEW ACCESS TOKEN (LOGIN-ТАЙ ИЖИЛ)
  const newAccessToken = jwt.sign(
    {
      sub: user.id,
      email: user.email,
      activeRole: activeRole.code,
      roles: roles.map((r) => r.code),
      permissions,
    },
    process.env.JWT_SECRET!,
    { expiresIn: ACCESS_TOKEN_TTL }
  );

  const res = NextResponse.json({ success: true });

  res.cookies.set("access_token", newAccessToken, {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: ACCESS_TOKEN_TTL,
  });

  return res;
}
