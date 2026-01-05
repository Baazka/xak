export const runtime = "nodejs";

import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import db from "@/lib/db";

const bcrypt = require("bcryptjs");

export async function POST(req: Request) {
  const { email, password, remember } = await req.json();
  const expiresIn = remember ? "30d" : "1d";
  // 1. User шалгах
  const { rows } = await db.query(`SELECT id, email, password FROM reg_users WHERE email = $1`, [
    email,
  ]);
  const user = rows[0];

  if (!user) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  // 2. Password шалгах
  const isMatch = await bcrypt.compareSync(String(password).trim(), String(user.password).trim());
  if (!isMatch) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  // 3. JWT үүсгэх
  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
    },
    process.env.JWT_SECRET!,
    { expiresIn }
  );

  // 4. Cookie set
  const res = NextResponse.json({ success: true });
  res.cookies.set("token", token, {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: remember ? 60 * 60 * 24 * 30 : undefined,
  });

  return res;
}
