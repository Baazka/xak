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
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  // 2. Password шалгах
  const isMatch = await bcrypt.compare(String(password).trim(), String(user.password).trim());
  if (!isMatch) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  // 3. Access token
  const accessToken = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET!, {
    expiresIn: ACCESS_TOKEN_TTL,
  });

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

  const res = NextResponse.json({ success: true });

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
