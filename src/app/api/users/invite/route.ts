// src/app/api/users/route.ts
import { NextResponse } from "next/server";
import crypto from "crypto";
import db from "@/lib/db";
import { sendOtpEmail } from "@/lib/mailer";
import bcrypt from "bcryptjs";

const genOtp6 = () => String(Math.floor(100000 + Math.random() * 900000));
const hashOtp = (otp: string) => crypto.createHash("sha256").update(otp).digest("hex");

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const roleId = Number(body?.role_id ?? 2);
  const email = String(body?.email ?? "")
    .trim()
    .toLowerCase();
  const username = body?.username ? String(body.username).trim() : null;
  const user_phone = body?.user_phone ? String(body.user_phone).trim() : null;
  const org_id = Number(body?.org_id);

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

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //check tuhain org-iin xak_admin user active bga eseh
    const userXakAdmin = await client.query(
      `SELECT COUNT(USER_ID)::int AS total
      FROM REG_USERS_NEW
      WHERE USER_STATUS_ID = 1 AND USER_LEVEL_ID = 3 AND USER_ORG_ID = $1`,
      [org_id]
    );

    const xakCount = userXakAdmin.rows[0].total;

    if (xakCount !== 0) {
      await client.query("ROLLBACK");
      return NextResponse.json({ message: "Идэвхтэй хэрэглэгч байна." }, { status: 400 });
    }

    // //OTP gen
    const otp = genOtp6();
    const otpHash = hashOtp(otp);
    const expiresMinutes = 30;
    const hashpw = bcrypt.hashSync(otp, bcrypt.genSaltSync(10));
    // // reg_users_new insert
    const userResNew = await client.query(
      `INSERT INTO reg_users_new (user_org_id, user_level_id, user_regdate, user_email, user_phone, user_firstname, user_otp, pending_token_hash, pending_token_expire, user_password, user_status_id, created_by, created_date)
       VALUES ($1, 3, current_timestamp, $2, $3, $4, $5, $6, current_timestamp + ($7 || ' minutes')::interval, 'pending', 0, 999, current_timestamp)
       RETURNING user_id`,
      [
        org_id,
        String(email).trim().toLowerCase(),
        String(user_phone).trim().toLowerCase(),
        username,
        otp,
        hashpw,
        String(expiresMinutes),
      ]
    );
    const userNew = userResNew.rows[0];

    // // reg_user_roles_new insert
    await client.query(
      `INSERT INTO reg_user_roles_new (user_id, role_id, is_active, created_by, created_date)
        VALUES ($1, 3, 1, 999, current_timestamp)`,
      [userNew.user_id]
    );

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

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
    // const otp = genOtp6();
    // const otpHash = hashOtp(otp);
    // const expiresMinutes = 10;

    await client.query(
      `INSERT INTO reg_user_otps (user_id, otp_hash, purpose, expires_at)
       VALUES ($1, $2, 'invite', now() + ($3 || ' minutes')::interval)`,
      [user.id, otpHash, String(expiresMinutes)]
    );

    ///////////////////////////////////////////////////////////////////////////////////////

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
