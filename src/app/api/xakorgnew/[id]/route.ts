import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { withAuth } from "@/lib/withAuth";
import { requirePermission } from "@/lib/requirePermission";
import { JwtPayload } from "@/lib/jwtPayload";
import { sendOtpEmail } from "@/lib/mailer";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const genOtp6 = () => String(Math.floor(100000 + Math.random() * 900000));
const hashOtp = (otp: string) => crypto.createHash("sha256").update(otp).digest("hex");

/* GET → edit */
export const GET = withAuth<{ id: string }>(async (req: NextRequest, user: JwtPayload, context) => {
  //requirePermission(user.permissions, ["xakorg.read"]);

  const { id } = await context.params;

  const result = await db.query(
    `
      SELECT ORG_ID, ORG_REGISTER_NO, ORG_LEGAL_NAME, ORG_PHONE, ORG_EMAIL, ORG_ADDRESS, ORG_HEAD_NAME, ORG_HEAD_PHONE, ORG_HEAD_EMAIL, ORG_STATUS, CREATED_BY, TO_CHAR(CREATED_DATE,'YYYY.MM.DD') AS CREATED_DATE
      FROM REG_AUD_ORG
      WHERE ORG_ID = $1
      `,
    [id]
  );

  if (result.rows.length === 0) {
    return NextResponse.json({ error: "Бичлэг олдсонгүй" }, { status: 404 });
  }

  return NextResponse.json(result.rows[0]);
});

/* PUT → update */
export const PUT = withAuth<{ id: string }>(async (req: NextRequest, user: JwtPayload, context) => {
  //requirePermission(user.permissions, ["xakorg.update"]);

  const { id } = await context.params;
  const {
    org_register_no,
    org_legal_name,
    org_phone,
    org_email,
    org_address,
    org_head_name,
    org_head_phone,
    org_head_email,
    method,
  } = await req.json();

  const userId = user.id;
  const client = await db.connect();

  try {
    await client.query("BEGIN");
    if (method === "CONFIRM") {
      // ---------- confirm action: only update status to ACTIVE ----------
      await client.query(
        `
      UPDATE REG_AUD_ORG
      set ORG_STATUS = 'ACTIVE',
          ORG_REGISTER_NO = $1,
          ORG_LEGAL_NAME = $2,
          ORG_PHONE = $3,
          ORG_EMAIL = $4,
          ORG_ADDRESS = $5,
          ORG_HEAD_NAME = $6,
          ORG_HEAD_PHONE = $7,
          ORG_HEAD_EMAIL = $8,
          UPDATED_BY = $9,
          UPDATED_DATE = CURRENT_TIMESTAMP
      WHERE org_id = $10
      RETURNING org_id
      `,
        [
          org_register_no,
          org_legal_name,
          org_phone,
          org_email,
          org_address,
          org_head_name,
          org_head_phone,
          org_head_email,
          userId,
          id,
        ]
      );

      const userXakAdmin = await client.query(
        `SELECT COUNT(USER_ID)::int AS total
          FROM REG_USERS_NEW
          WHERE USER_STATUS_ID = 1 AND USER_LEVEL_ID = 3 AND USER_ORG_ID = $1`,
        [id]
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
           VALUES ($1, 3, current_timestamp, $2, $3, $4, $5, $6, current_timestamp + ($7 || ' minutes')::interval, 'pending', 0, $8, current_timestamp)
           RETURNING user_id`,
        [
          id,
          String(org_email ? org_email : org_head_email)
            .trim()
            .toLowerCase(),
          String(org_phone ? org_phone : org_head_phone)
            .trim()
            .toLowerCase(),
          String(org_head_name).trim(),
          otp,
          hashpw,
          String(expiresMinutes),
          userId,
        ]
      );
      const userNew = userResNew.rows[0];

      // // reg_user_roles_new insert
      await client.query(
        `INSERT INTO reg_user_roles_new (user_id, role_id, is_active, created_by, created_date)
            VALUES ($1, 3, 1, $2, current_timestamp)`,
        [userNew.user_id, userId]
      );
      /////////////////////////////////////////////////////
      await client.query(
        `INSERT INTO reg_user_roles (user_id, role_id)
        VALUES ($1, 2)`,
        [userNew.user_id]
      );

      // old OTP invalidate
      await client.query(
        `UPDATE reg_user_otps
        SET used_at = now()
        WHERE user_id = $1 AND used_at IS NULL AND purpose = 'invite'`,
        [userNew.user_id]
      );

      //  OTP insert

      await client.query(
        `INSERT INTO reg_user_otps (user_id, otp_hash, purpose, expires_at)
       VALUES ($1, $2, 'invite', now() + ($3 || ' minutes')::interval)`,
        [userNew.user_id, otpHash, String(expiresMinutes)]
      );

      await client.query("COMMIT");

      //  Mail send
      await sendOtpEmail(org_email, otp, expiresMinutes);
    } else {
      await client.query(
        `
      UPDATE REG_AUD_ORG
      SET ORG_REGISTER_NO = $1,
          ORG_LEGAL_NAME = $2,
          ORG_PHONE = $3,
          ORG_EMAIL = $4,
          ORG_ADDRESS = $5,
          ORG_HEAD_NAME = $6,
          ORG_HEAD_PHONE = $7,
          ORG_HEAD_EMAIL = $8,
          UPDATED_BY = $9,
          UPDATED_DATE = CURRENT_TIMESTAMP
      WHERE org_id = $10
      RETURNING org_id
      `,
        [
          org_register_no,
          org_legal_name,
          org_phone,
          org_email,
          org_address,
          org_head_name,
          org_head_phone,
          org_head_email,
          userId,
          id,
        ]
      );
    }
    return NextResponse.json({ success: true });
  } catch (err: any) {
    await client.query("ROLLBACK");
    return NextResponse.json({ message: err?.message || "Invite failed" }, { status: 500 });
  } finally {
    client.release();
  }
});

/* DELETE → soft delete */
export const DELETE = withAuth<{ id: string }>(
  async (req: NextRequest, user: JwtPayload, context) => {
    //requirePermission(user.permissions, ["xakorg.delete"]);

    const { id } = await context.params;

    const result = await db.query(
      `
      UPDATE REG_AUD_ORG
      SET ORG_STATUS = 'INACTIVE',
      updated_by = 999,
      updated_date = current_timestamp
      WHERE org_id = $1 AND ORG_STATUS = 'ACTIVE'
      RETURNING org_id
      `,
      [id]
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ error: "Байгууллага олдсонгүй" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  }
);
