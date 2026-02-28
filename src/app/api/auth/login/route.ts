// src/app/api/auth/login/route.ts
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import db from "@/lib/db";
import crypto from "crypto";
import { buildJwtPayload } from "@/lib/buildJwtPayload";
import { getJwtSecretString } from "@/lib/jwt";

const bcrypt = require("bcryptjs");
const ACCESS_TOKEN_TTL = 60 * 60;

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const email = String(body?.email ?? "")
    .trim()
    .toLowerCase();
  const password = body?.password;
  const remember = Boolean(body?.remember);

  if (typeof email !== "string" || typeof password !== "string") {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  // const { rows } = await db.query(
  //   `SELECT id, email, username, avatar, firstname, lastname, phone, password, status FROM reg_users WHERE email = $1 or phone = $1`,
  //   [email]
  // );

  const { rows } = await db.query(
    `SELECT user_id, user_org_id, user_level_id, user_code, user_regdate, user_email, user_phone, user_register_no, user_lastname, user_firstname, user_password, user_otp, user_status_id, pending_token_hash, pending_token_expire, 
    reset_token_hash, reset_token_expire, created_by, created_date FROM reg_users_new WHERE (user_email = $1 or user_phone = $1) and user_status_id in (0,1)`,
    [email]
  );
  const user = rows[0];

  if (!user) return NextResponse.json({ error: "Хэрэглэгч олдсонгүй." }, { status: 401 });

  //pending
  if (user.user_status_id === 0) {
    return NextResponse.json(
      { error: "OTP баталгаажуулаагүй байна.", code: "OTP_REQUIRED" },
      { status: 403 }
    );
  }

  // if (user.status === 2) {
  //   return NextResponse.json({ error: "Хэрэглэгч идэвхгүй байна." }, { status: 403 });
  // }

  if (!user.user_password) {
    return NextResponse.json({ error: "Нууц үг тохируулаагүй байна." }, { status: 403 });
  }
  if (user.user_status_id === 0) {
    const isPendingMatch = await bcrypt.compare(
      String(password).trim(),
      String(user.pending_token_hash).trim()
    );
    if (!isPendingMatch)
      return NextResponse.json({ error: "Нууц үг буруу байна." }, { status: 401 });
  }
  if (user.user_status_id === 1) {
    const isMatch = await bcrypt.compare(
      String(password).trim(),
      String(user.user_password).trim()
    );
    if (!isMatch) return NextResponse.json({ error: "Нууц үг буруу байна." }, { status: 401 });
  }
  //role avah
  const { rows: roles } = await db.query(
    `
    select r.role_id. r.role_code, r.role_label
    from reg_user_roles_new ur
    join ref_user_role r on ur.role_id = r.role_id
    where ur.user_id = $1;
    `,
    [user.user_id]
  );

  if (roles.length === 0) return NextResponse.json({ error: "Role олдсонгүй" }, { status: 403 });

  const activeRole = roles[0];

  //  зөвхөн ACTIVE ROLE permission
  const { rows: perms } = await db.query(
    `
    select pr.permission_code
    from ref_user_role r
    join ref_role_permission p on r.role_id = p.role_id
    join ref_permissions pr on p.permission_id = pr.permission_id
    where r.role_id = $1;
    `,
    [activeRole.role_id]
  );
  const permissions = perms.map((p: any) => p.permission_code);

  const payload = buildJwtPayload({
    user: {
      id: user.user_id,
      email: user.user_email,
      username: user.user_firstname,
      avatar: user?.avatar,
    },
    activeRole: activeRole.role_code,
    roles: roles.map((r: any) => r.role_code),
    permissions,
  });

  const accessToken = jwt.sign(payload, getJwtSecretString(), {
    expiresIn: ACCESS_TOKEN_TTL,
  });

  const selector = crypto.randomBytes(16).toString("hex");
  const verifier = crypto.randomBytes(32).toString("hex");

  const refreshToken = `${selector}.${verifier}`;
  const refreshHash = bcrypt.hashSync(verifier, 10);

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + (remember ? 30 : 7));

  await db.query(
    `INSERT INTO reg_user_sessions (user_id, refresh_selector, refresh_token_hash, expires_at, active_role)
   VALUES ($1, $2, $3, $4, $5)`,
    [user.user_id, selector, refreshHash, expiresAt, activeRole.role_code]
  );

  const res = NextResponse.json({
    success: true,
    user: {
      sub: user.user_id,
      email: user.user_email,
      activeRole: activeRole.role_code,
      roles: roles.map((r: any) => r.role_code),
      permissions,
    },
  });

  res.cookies.set("access_token", accessToken, {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: ACCESS_TOKEN_TTL,
  });

  res.cookies.set("refresh_token", refreshToken, {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: remember ? 60 * 60 * 24 * 30 : 60 * 60 * 24 * 7,
  });

  return res;
}
