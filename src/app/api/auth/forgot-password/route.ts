export const runtime = "nodejs";

import crypto from "crypto";
import { NextResponse } from "next/server";
import db from "@/lib/db";
import { sendResetEmail } from "@/lib/mailer";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);

    if (!body?.email) {
      return NextResponse.json({ ok: true });
    }

    const { email } = body;

    const user = await db.query("SELECT id FROM reg_users WHERE email=$1", [email]);

    if (!user.rows || user.rows.length === 0) {
      return NextResponse.json({ ok: true });
    }

    const token = crypto.randomUUID();
    const hash = crypto.createHash("sha256").update(token).digest("hex");

    await db.query(
      `
    UPDATE reg_users
    SET reset_token_hash=$1,
        reset_token_exp=NOW() + INTERVAL '15 minutes'
    WHERE email=$2
    `,
      [hash, email]
    );

    await sendResetEmail(email, `${process.env.APP_URL}/reset-password?token=${token}`);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("FORGOT PASSWORD ERROR:", err instanceof Error ? err.message : err);

    return NextResponse.json({ ok: true }); // security + runtime safety
  }
}
