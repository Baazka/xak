// src/app/api/auth/login/route.ts
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import db from "@/lib/db";
import crypto from "crypto";
import { buildJwtPayload } from "@/lib/buildJwtPayload";
import { getJwtSecretString } from "@/lib/jwt";

const bcrypt = require("bcryptjs");
const ACCESS_TOKEN_TTL = 60 * 15;

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

  const { rows } = await db.query(
    `SELECT id, email, username, avatar, firstname, lastname, phone, password, status FROM reg_users WHERE email = $1`,
    [email]
  );
  const user = rows[0];

  if (!user) return NextResponse.json({ error: "Хэрэглэгч олдсонгүй." }, { status: 401 });

  if (user.status === 0) {
    return NextResponse.json(
      { error: "OTP баталгаажуулаагүй байна.", code: "OTP_REQUIRED" },
      { status: 403 }
    );
  }

  if (user.status === 2) {
    return NextResponse.json({ error: "Хэрэглэгч идэвхгүй байна." }, { status: 403 });
  }

  if (!user.password) {
    return NextResponse.json({ error: "Нууц үг тохируулаагүй байна." }, { status: 403 });
  }

  const isMatch = await bcrypt.compare(String(password).trim(), String(user.password).trim());
  if (!isMatch) return NextResponse.json({ error: "Нууц үг буруу байна." }, { status: 401 });

  const { rows: roles } = await db.query(
    `
    SELECT r.id, r.code, r.name
    FROM reg_user_roles ur
    JOIN ref_user_roles r ON r.id = ur.role_id
    WHERE ur.user_id = $1
    `,
    [user.id]
  );

  if (roles.length === 0) return NextResponse.json({ error: "Role олдсонгүй" }, { status: 403 });

  const activeRole = roles[0];

  //  зөвхөн ACTIVE ROLE permission
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
      id: user.id,
      email: user.email,
      username: user.username,
      avatar: user.avatar,
    },
    activeRole: activeRole.code,
    roles: roles.map((r: any) => r.code),
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
    [user.id, selector, refreshHash, expiresAt, activeRole.code]
  );

  const res = NextResponse.json({
    success: true,
    user: {
      sub: user.id,
      email: user.email,
      activeRole: activeRole.code,
      roles: roles.map((r: any) => r.code),
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
