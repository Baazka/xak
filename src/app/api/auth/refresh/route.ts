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

  const [selector, verifier] = refresh.split(".");
  if (!selector || !verifier) {
    return NextResponse.json({ error: "Invalid refresh token" }, { status: 401 });
  }

  // ✅ 1 мөр л татна
  const { rows: sessions } = await db.query(
    `
    SELECT *
    FROM reg_user_sessions
    WHERE refresh_selector = $1
      AND expires_at > now()
    LIMIT 1
    `,
    [selector]
  );

  const session = sessions[0];
  if (!session) {
    return NextResponse.json({ error: "Invalid refresh token" }, { status: 401 });
  }

  // bcrypt compare
  const ok = bcrypt.compareSync(verifier, session.refresh_token_hash);
  if (!ok) {
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

  const permissions = perms.map((p: any) => p.code);

  const payload = buildJwtPayload({
    user: {
      org_id: user.org_id,
      org_register_no: user.org_register_no,
      org_legal_name: user.org_legal_name,
      org_phone: user.org_phone,
      org_email: user.org_email,
      org_address: user.org_address,
      org_head_name: user.org_head_name,
      org_head_phone: user.org_head_phone,
      org_head_email: user.org_head_email,
      id: user.id,
      email: user.email,
      username: user.username,
    },
    activeRole: activeRole.code,
    roles: roles.map((r: any) => r.code),
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
    secure: false, //process.env.NODE_ENV === "production",
    maxAge: ACCESS_TOKEN_TTL,
  });

  return res;
}
