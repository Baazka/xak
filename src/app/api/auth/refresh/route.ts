// src/app/api/auth/refresh/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import db from "@/lib/db";
import { buildJwtPayload } from "@/lib/buildJwtPayload";
import { getJwtSecretString } from "@/lib/jwt";
const bcrypt = require("bcryptjs");

const ACCESS_TOKEN_TTL = 60 * 15;

export async function POST() {
  const cookieStore = await cookies();
  const refresh = cookieStore.get("refresh_token")?.value;

  if (!refresh) {
    return NextResponse.json({ error: "No refresh token" }, { status: 401 });
  }

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

  const { rows: users } = await db.query(
    "SELECT id, email, username, avatar FROM reg_users WHERE id=$1",
    [session.user_id]
  );
  const user = users[0];

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
  const activeRole = roles.find((r) => r.code === activeRoleCode);

  if (!activeRole) {
    return NextResponse.json({ error: "Active role not found" }, { status: 403 });
  }

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

  const payload = buildJwtPayload({
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      avatar: user.avatar,
    },
    activeRole: activeRole.code,
    roles: roles.map((r) => r.code),
    permissions,
  });

  const newAccessToken = jwt.sign(payload, getJwtSecretString(), {
    expiresIn: ACCESS_TOKEN_TTL,
  });

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
