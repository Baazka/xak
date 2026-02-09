import { NextResponse } from "next/server";
import crypto from "crypto";
import db from "@/lib/db";

const hashOtp = (otp: string) => crypto.createHash("sha256").update(otp).digest("hex");

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const email = String(body?.email ?? "")
    .trim()
    .toLowerCase();
  const otp = String(body?.otp ?? "").trim();

  if (!email || !otp) {
    return NextResponse.json({ message: "Invalid input" }, { status: 400 });
  }

  const { rows } = await db.query(
    `SELECT u.id AS user_id, o.id AS otp_id
     FROM reg_users u
     JOIN reg_user_otps o ON o.user_id = u.id
     WHERE u.email = $1
       AND o.otp_hash = $2
       AND o.used_at IS NULL
       AND o.expires_at > now()
     ORDER BY o.created_at DESC
     LIMIT 1`,
    [email, hashOtp(otp)]
  );

  if (!rows[0]) {
    return NextResponse.json({ message: "OTP буруу эсвэл хугацаа дууссан" }, { status: 400 });
  }

  const { user_id, otp_id } = rows[0];

  await db.query("BEGIN");
  try {
    await db.query(
      `UPDATE reg_users
     SET status = 1
     WHERE id = $1 AND status = 0`,
      [user_id]
    );

    await db.query(
      `UPDATE reg_user_otps
     SET used_at = now()
     WHERE id = $1 AND used_at IS NULL`,
      [otp_id]
    );

    await db.query("COMMIT");
  } catch (e) {
    await db.query("ROLLBACK");
    throw e;
  }

  return NextResponse.json({ ok: true });
}
