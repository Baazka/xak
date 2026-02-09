import { NextResponse } from "next/server";
import crypto from "crypto";
import db from "@/lib/db";
import { sendOtpEmail } from "@/lib/mailer";

const genOtp6 = () => String(Math.floor(100000 + Math.random() * 900000));
const hashOtp = (otp: string) => crypto.createHash("sha256").update(otp).digest("hex");

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const roleId = Number(body?.role_id ?? 2);
  const email = String(body?.email ?? "")
    .trim()
    .toLowerCase();
  const username = body?.username ? String(body.username).trim() : null;

  if (!Number.isFinite(roleId)) {
    return NextResponse.json({ message: "Role сонгоно уу" }, { status: 400 });
  }

  if (!email || !email.includes("@")) {
    return NextResponse.json({ message: "Имэйл буруу" }, { status: 400 });
  }

  const client = await db.connect();

  try {
    await client.query("BEGIN");

    // reg_users insert
    const userRes = await client.query(
      `INSERT INTO reg_users (email, username, status)
       VALUES ($1, $2, 0)
       ON CONFLICT (email) DO UPDATE
         SET username = COALESCE(EXCLUDED.username, reg_users.username)
       RETURNING id, email, status`,
      [email, username]
    );
    const user = userRes.rows[0];

    if (user.status === 2) {
      await client.query("ROLLBACK");
      return NextResponse.json({ message: "Хэрэглэгч inactive байна" }, { status: 400 });
    }

    // reg_user_roles – 1:1 (code-level)
    await client.query(`DELETE FROM reg_user_roles WHERE user_id = $1`, [user.id]);

    await client.query(
      `INSERT INTO reg_user_roles (user_id, role_id)
        VALUES ($1, $2)`,
      [user.id, roleId]
    );

    // old OTP invalidate
    await client.query(
      `UPDATE reg_user_otps
        SET used_at = now()
        WHERE user_id = $1 AND used_at IS NULL AND purpose = 'invite'`,
      [user.id]
    );

    //  OTP insert
    const otp = genOtp6();
    const otpHash = hashOtp(otp);
    const expiresMinutes = 10;

    await client.query(
      `INSERT INTO reg_user_otps (user_id, otp_hash, purpose, expires_at)
       VALUES ($1, $2, 'invite', now() + ($3 || ' minutes')::interval)`,
      [user.id, otpHash, String(expiresMinutes)]
    );

    await client.query("COMMIT");

    // 4) Mail send
    await sendOtpEmail(user.email, otp, expiresMinutes);

    return NextResponse.json({ ok: true, user_id: user.id });
  } catch (e: any) {
    await client.query("ROLLBACK");
    return NextResponse.json({ message: e?.message || "Invite failed" }, { status: 500 });
  } finally {
    client.release();
  }
}
