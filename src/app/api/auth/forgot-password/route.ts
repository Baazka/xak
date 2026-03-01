export const runtime = "nodejs";

import crypto from "crypto";
import { NextResponse } from "next/server";
import db from "@/lib/db";
import { sendOtpEmail, sendResetEmail } from "@/lib/mailer";
import bcrypt from "bcryptjs";

const genOtp6 = () => String(Math.floor(100000 + Math.random() * 900000));
const hashOtp = (otp: string) => crypto.createHash("sha256").update(otp).digest("hex");

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);

    if (!body?.email) {
      return NextResponse.json({ ok: true });
    }

    const email = String(body.email).trim().toLowerCase();

    const user = await db.query(
      "SELECT user_id, user_email FROM reg_users_new WHERE (user_email=$1 or user_phone = $1) and user_status_id in (0,1)",
      [email]
    );

    if (!user.rows || user.rows.length === 0) {
      return NextResponse.json({ ok: true });
    }

    // //OTP gen
    const otp = genOtp6();
    const otpHash = hashOtp(otp);
    const expiresMinutes = 15;
    const hashpw = bcrypt.hashSync(otp, bcrypt.genSaltSync(10));
    //
    // const token = crypto.randomUUID();
    // const hash = crypto.createHash("sha256").update(token).digest("hex");

    await db.query(
      `
    UPDATE reg_users_new
    SET reset_token_hash=$1,
        reset_token_expire=current_timestamp + ($2 || ' minutes')::interval,
        user_otp = $3
    WHERE user_id=$4
    `,
      [hashpw, String(expiresMinutes), otp, user.rows[0].user_id]
    );

    await sendOtpEmail(user.rows[0].user_email, otp, expiresMinutes);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("FORGOT PASSWORD ERROR:", err instanceof Error ? err.message : err);

    return NextResponse.json({ ok: true }); // security + runtime safety
  }
}
