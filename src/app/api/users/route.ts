//src/app/api/users/route.ts
import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { withAuth } from "@/lib/withAuth";
import { requirePermission } from "@/lib/requirePermission";
import { JwtPayload } from "@/lib/jwtPayload";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { buildWhereClause, safeParseFilters } from "./_where";
import { sendOtpEmail } from "@/lib/mailer";

const SORTABLE_COLUMNS = new Set(["user_id", "user_firstname", "user_email"]);
const genOtp6 = () => String(Math.floor(100000 + Math.random() * 900000));
const hashOtp = (otp: string) => crypto.createHash("sha256").update(otp).digest("hex");

export const GET = withAuth(async (req: NextRequest, user: JwtPayload) => {
  //requirePermission(user.permissions, ["user.read"]);

  const sp = new URL(req.url).searchParams;

  const page = Math.max(parseInt(sp.get("page") || "1"), 1);
  const limit = Math.max(parseInt(sp.get("limit") || "10"), 1);
  const search = sp.get("search") || "";
  const filters = safeParseFilters(sp.get("filters"));

  const sortByRaw = sp.get("sortBy") || "user_id";
  const sortBy = SORTABLE_COLUMNS.has(sortByRaw) ? sortByRaw : "user_id";
  const sortOrder = (sp.get("sortOrder") || "asc").toLowerCase() === "desc" ? "DESC" : "ASC";

  const offset = (page - 1) * limit;

  let whereClause = "WHERE user_status_id != 2";
  if (user.user_level_id > 2) {
    whereClause += ` AND USER_ORG_ID = ${user.org_id} `;
  }
  const params: any[] = [];

  if (search) {
    params.push(`%${search}%`);
    if (user.user_level_id > 2) {
      whereClause += ` AND (user_firstname ILIKE $${params.length} OR user_email ILIKE $${params.length} OR user_phone ILIKE $${params.length} OR user_register_no ILIKE $${params.length})`;
    } else {
      whereClause += ` AND (user_firstname ILIKE $${params.length} OR user_email ILIKE $${params.length} OR user_phone ILIKE $${params.length} OR user_register_no ILIKE $${params.length}
                      OR org_register_no ILIKE $${params.length} OR org_legal_name ILIKE $${params.length} OR org_email ILIKE $${params.length} OR org_phone ILIKE $${params.length})`;
    }
  }

  const dataSql = `
    SELECT 
      ru.user_id, 
      ru.user_register_no, 
      ru.user_firstname, 
      ru.user_email, 
      ru.user_phone, 
      to_char(ru.user_regdate, 'YYYY.MM.DD') as user_regdate, 
      ru.user_status_id,
      rur.role_id,
      rur.role_label,
      rur.role_code,
      rur.role_text,
      ao.org_id,
      ao.org_register_no,
      ao.org_legal_name,
      ao.org_phone,
      ao.org_email
    FROM reg_users_new ru
    JOIN reg_aud_org ao on ru.user_org_id = ao.org_id
    JOIN reg_user_roles_new ur on ru.user_id = ur.user_id and ur.is_active = 1
    JOIN ref_user_role rur on ur.role_id = rur.role_id 
    ${whereClause}
    ORDER BY ${sortBy} ${sortOrder}
    LIMIT $${params.length + 1}
    OFFSET $${params.length + 2}
  `;

  const countSql = `
    SELECT COUNT(*)::int AS total
    FROM reg_users_new ru
    JOIN reg_aud_org ao on ru.user_org_id = ao.org_id
    JOIN reg_user_roles_new ur on ru.user_id = ur.user_id and ur.is_active = 1
    JOIN ref_user_role rur on ur.role_id = rur.role_id 
    ${whereClause}
  `;

  const client = await db.connect();
  try {
    const [dataRes, countRes] = await Promise.all([
      client.query(dataSql, [...params, limit, offset]),
      client.query(countSql, params),
    ]);

    return NextResponse.json({
      data: dataRes.rows,
      total: countRes.rows[0].total,
      page,
      limit,
    });
  } finally {
    client.release();
  }
});
export const POST = withAuth(async (req: NextRequest, user: JwtPayload) => {
  //requirePermission(user.permissions, ["user.create"]);

  const body = await req.json();
  const createdUser = user.id;
  const new_org_id = user.org_id;

  const username = String(body?.user_firstname ?? "").trim();
  const user_regno = String(body?.user_register_no ?? "").trim();
  const user_phone = String(body?.user_phone ?? "").trim();
  const user_email = String(body?.user_email ?? "")
    .trim()
    .toLowerCase();
  const user_RoleId = Number(body?.role_id ?? null);
  //const password = String(body?.user_password ?? "");

  if (!username || !user_email) {
    return NextResponse.json({ error: "Нэр имэйл буруу байна." }, { status: 400 });
  }

  const client = await db.connect();

  try {
    await client.query("BEGIN");

    if (user_RoleId === 3) {
      const userXakAdmin = await client.query(
        `SELECT COUNT(USER_ID)::int AS total
      FROM REG_USERS_NEW
      WHERE USER_STATUS_ID = 1 AND USER_LEVEL_ID = 3 AND USER_ORG_ID = $1`,
        [new_org_id]
      );

      const xakCount = userXakAdmin.rows[0].total;

      if (xakCount !== 0) {
        await client.query("ROLLBACK");
        return NextResponse.json({ message: "Идэвхтэй хэрэглэгч байна." }, { status: 400 });
      }
    }

    const exists = await client.query(
      `SELECT 1 FROM reg_users_new WHERE user_email = $1 AND user_status_id = 1`,
      [user_email]
    );
    if (exists.rowCount) {
      await client.query("ROLLBACK");
      return NextResponse.json({ error: "Email бүртгэлтэй байна" }, { status: 409 });
    }

    // //OTP gen
    const otp = genOtp6();
    const otpHash = hashOtp(otp);
    const expiresMinutes = 30;
    const hashpwd = bcrypt.hashSync(otp, bcrypt.genSaltSync(10));
    // // reg_users_new insert
    const userResNew = await client.query(
      `INSERT INTO reg_users_new (user_org_id, user_level_id, user_regdate, user_register_no, user_email, user_phone, user_firstname, user_otp, pending_token_hash, pending_token_expire, user_password, user_status_id, created_by, created_date)
           VALUES ($1, 4, current_timestamp, $2, $3, $4, $5, $6, $7, current_timestamp + ($8 || ' minutes')::interval, 'pending', 0, $9, current_timestamp)
           RETURNING user_id`,
      [
        new_org_id,
        String(user_regno).trim().toLowerCase(),
        String(user_email).trim().toLowerCase(),
        String(user_phone).trim().toLowerCase(),
        username,
        otp,
        hashpwd,
        String(expiresMinutes),
        createdUser,
      ]
    );
    const userNew = userResNew.rows[0];

    // // reg_user_roles_new insert
    await client.query(
      `INSERT INTO reg_user_roles_new (user_id, role_id, is_active, created_by, created_date)
            VALUES ($1, $2, 1, $3, current_timestamp)`,
      [userNew.user_id, user_RoleId, createdUser]
    );

    await client.query("COMMIT");

    // 4) Mail send
    await sendOtpEmail(user_email, otp, expiresMinutes);

    return NextResponse.json(userResNew.rows[0], { status: 201 });
  } catch (err: any) {
    await client.query("ROLLBACK").catch(() => {});
    console.error("Create user error:", err);

    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  } finally {
    client.release();
  }
});
