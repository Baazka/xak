import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import db from "@/lib/db";
import crypto from "crypto";

const bcrypt = require("bcryptjs");
const ACCESS_TOKEN_TTL = 60 * 15; // 15 минут

export async function POST(req: Request) {
  const { email, password, remember } = await req.json();
  // 1. User шалгах
  const { rows } = await db.query(`SELECT id, email, password FROM reg_users WHERE email = $1`, [
    email,
  ]);
  const user = rows[0];

  if (!user) {
    return NextResponse.json({ error: "Хэрэглэгч олдсонгүй." }, { status: 401 });
  }

  // 2. Password шалгах
  const isMatch = await bcrypt.compare(String(password).trim(), String(user.password).trim());
  if (!isMatch) {
    return NextResponse.json({ error: "Нууц үг буруу байна." }, { status: 401 });
  }

  const { rows: roles } = await db.query(
    `
  SELECT r.id, r.code, r.name
  FROM reg_user_roles ur
  JOIN ref_user_roles r ON r.id = ur.role_id
  WHERE ur.user_id = $1
  `,
    [user.id]
  );

  if (roles.length === 0) {
    return NextResponse.json({ error: "Role олдсонгүй" }, { status: 403 });
  }
  const activeRole = roles[0];

  const { rows: perms } = await db.query(
    `
    SELECT DISTINCT p.code
    FROM reg_user_roles ur
    JOIN reg_user_role_permissions rp ON rp.role_id = ur.role_id
    JOIN ref_user_permissions p ON p.id = rp.permission_id
    WHERE ur.user_id = $1
  `,
    [user.id]
  );

  const permissions = perms?.map((p) => p.code) ?? [];

  // 3. Access token
  const accessToken = jwt.sign(
    {
      id: user.id,
      email: user.email,
      activeRole: activeRole.code,
      roles: roles.map((r) => r.code),
      permissions,
    },
    process.env.JWT_SECRET!,
    {
      expiresIn: ACCESS_TOKEN_TTL,
    }
  );

  // 🔁 Refresh token (random string)
  const refreshToken = crypto.randomBytes(32).toString("hex");
  const refreshHash = bcrypt.hashSync(refreshToken, 10);

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + (remember ? 30 : 7));

  await db.query(
    `INSERT INTO reg_user_sessions (user_id, refresh_token_hash, expires_at)
     VALUES ($1, $2, $3)`,
    [user.id, refreshHash, expiresAt]
  );

  const res = NextResponse.json({ success: true, roles: roles.map((r) => r.code) });

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

  console.log(
    user.id,
    user.email,
    activeRole.code,
    roles.map((r) => r.code),
    permissions,
    "all data for login"
  );
  return res;
}
