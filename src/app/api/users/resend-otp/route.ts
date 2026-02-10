// src/app/api/users/resend-otp/route.ts
import { NextResponse } from "next/server";
import crypto from "crypto";
import db from "@/lib/db";

function sha256Hex(input: string) {
  return crypto.createHash("sha256").update(input).digest("hex");
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const email = String(body?.email ?? "")
    .trim()
    .toLowerCase();

  if (!email || !email.includes("@")) {
    return NextResponse.json({ message: "Имэйл буруу" }, { status: 400 });
  }

  const client = await db.connect();
  try {
    await client.query("BEGIN");

    // 1) user lock
    const { rows: urows } = await client.query(
      `SELECT id, email, status
       FROM reg_users
       WHERE email = $1
       FOR UPDATE`,
      [email]
    );

    const user = urows[0];
    if (!user) {
      await client.query("ROLLBACK");
      return NextResponse.json({ error: "Хэрэглэгч олдсонгүй" }, { status: 404 });
    }

    if (user.status === 2) {
      await client.query("ROLLBACK");
      return NextResponse.json({ error: "Хэрэглэгч inactive байна" }, { status: 403 });
    }

    // 2) хамгийн сүүлийн ашиглаагүй invite OTP-г авах
    const { rows: orows } = await client.query(
      `SELECT id, otp_hash, expires_at
       FROM reg_user_otps
       WHERE user_id = $1
         AND purpose = 'invite'
         AND used_at IS NULL
       ORDER BY created_at DESC
       LIMIT 1`,
      [user.id]
    );

    const otpRow = orows[0];
    if (!otpRow) {
      await client.query("ROLLBACK");
      return NextResponse.json({ error: "OTP олдсонгүй. Дахин илгээнэ үү." }, { status: 401 });
    }

    // 3) expires шалгах (DB дээр)
    const { rows: exRows } = await client.query(`SELECT ($1::timestamptz > NOW()) AS ok`, [
      otpRow.expires_at,
    ]);
    if (!exRows[0]?.ok) {
      await client.query("ROLLBACK");
      return NextResponse.json({ error: "OTP хугацаа дууссан" }, { status: 401 });
    }

    // 5) зөв OTP => mark used
    await client.query(
      `UPDATE reg_user_otps
       SET used_at = NOW()
       WHERE id = $1`,
      [otpRow.id]
    );

    // 6) set-password хийх token үүсгэнэ
    const pwToken = crypto.randomBytes(32).toString("hex");
    const pwTokenHash = sha256Hex(pwToken);

    await client.query(
      `UPDATE reg_users
       SET status = 1,
           pw_setup_token_hash = $1,
           pw_setup_expires_at = NOW() + INTERVAL '10 minutes'
       WHERE id = $2`,
      [pwTokenHash, user.id]
    );

    await client.query("COMMIT");

    return NextResponse.json({
      ok: true,
      code: "OTP_VERIFIED",
      next: `/set-password?token=${pwToken}&email=${encodeURIComponent(email)}`,
    });
  } catch (e: any) {
    await client.query("ROLLBACK");
    return NextResponse.json({ error: e?.message || "Verify failed" }, { status: 500 });
  } finally {
    client.release();
  }
}
