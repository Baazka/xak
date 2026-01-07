export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import db from "@/lib/db";
const bcrypt = require("bcryptjs");
const ACCESS_TOKEN_TTL = 60 * 15; // 15 минут

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const refresh = cookieStore.get("refresh_token")?.value;
  console.log("REFRESH HIT");
  if (!refresh) {
    return NextResponse.json({ error: "No refresh token" }, { status: 401 });
  }

  const { rows } = await db.query("SELECT * FROM reg_user_sessions WHERE expires_at > now()");

  let session: any = null;
  for (const r of rows) {
    if (bcrypt.compareSync(refresh, r.refresh_token_hash)) {
      session = r;
      break;
    }
  }

  if (!session) {
    return NextResponse.json({ error: "Invalid refresh token" }, { status: 401 });
  }

  const { rows: users } = await db.query("SELECT id, email FROM reg_users WHERE id=$1", [
    session.user_id,
  ]);
  const user = users[0];

  const newAccessToken = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET!, {
    expiresIn: ACCESS_TOKEN_TTL,
  });
  console.log(newAccessToken, "newAccessToken");

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
