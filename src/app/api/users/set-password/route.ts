// src/app/api/users/set-password/route.ts
import { NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import db from "@/lib/db";

const sha256Hex = (s: string) => crypto.createHash("sha256").update(s).digest("hex");

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);

  const email = String(body?.email ?? "")
    .trim()
    .toLowerCase();
  const token = String(body?.token ?? "").trim();
  const newPassword = String(body?.newPassword ?? "").trim();

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Имэйл буруу" }, { status: 400 });
  }
  if (!token || token.length < 16) {
    return NextResponse.json({ error: "Токен буруу" }, { status: 400 });
  }
  if (newPassword.length < 8) {
    return NextResponse.json({ error: "Нууц үг дор хаяж 8 тэмдэгт байна" }, { status: 400 });
  }

  const tokenHash = sha256Hex(token);
  const hash = await bcrypt.hash(newPassword, 10);

  const { rowCount } = await db.query(
    `
    UPDATE reg_users
    SET password = $1,
        pw_setup_token_hash = NULL,
        pw_setup_expires_at = NULL
    WHERE email = $2
      AND status = 1
      AND pw_setup_token_hash = $3
      AND pw_setup_expires_at IS NOT NULL
      AND pw_setup_expires_at > NOW()
    `,
    [hash, email, tokenHash]
  );

  if (rowCount === 0) {
    return NextResponse.json({ error: "Токен буруу эсвэл хугацаа дууссан" }, { status: 401 });
  }

  return NextResponse.json({ ok: true });
}
