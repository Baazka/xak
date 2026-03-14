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
    `SELECT 
      ao.org_id,
      ao.org_register_no,
      ao.org_legal_name,
      ao.org_phone,
      ao.org_email,
      ao.org_address,
      ao.org_head_name,
      ao.org_head_phone,
      ao.org_head_email,
      ru.user_id, 
      user_org_id, 
      user_level_id, 
	    ul.level_name,
      user_code, 
      user_regdate, 
      user_email, 
      user_phone, 
      user_register_no, 
      user_lastname, 
      user_firstname, 
      user_password, 
      user_otp, 
      user_status_id, 
      pending_token_hash, 
      pending_token_expire, 
        reset_token_hash, 
      reset_token_expire, 
      ru.created_by, 
      ru.created_date,
      rur.role_label,
      rur.role_code,
      rur.role_text,
      ur.role_id
    FROM reg_users_new ru
    JOIN reg_aud_org ao on ru.user_org_id = ao.org_id 
    JOIN ref_user_level ul on ru.user_level_id = ul.level_id
    JOIN reg_user_roles_new ur on ru.user_id = ur.user_id and ur.is_active = 1
    JOIN ref_user_role rur on ur.role_id = rur.role_id 
    WHERE user_id=$1`,
    [session.user_id]
  );
  const user = users[0];

  const { rows: roles } = await db.query(
    `
    SELECT r.id, r.code
    FROM reg_user_roles_new ur
    JOIN ref_user_role r ON r.id = ur.role_id
    WHERE ur.user_id = $1
    `,
    [user.id]
  );

  const activeRoleCode = session.active_role;
  const activeRole = users.find((r) => r.level_name === activeRoleCode);

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
    [activeRole.role_id]
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
      id: user.user_id,
      user_level_id: user.user_level_id,
      user_level_name: user.user_level_name,
      email: user.user_email,
      username: user.user_firstname,
      user_phone: user.user_phone,
      user_register_no: user.user_register_no,
      role_label: user.role_label,
      role_code: user.role_code,
      role_text: user.role_text,
    },
    activeRole: user.level_name,
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
