//src/app/api/users/route.ts
import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { withAuth } from "@/lib/withAuth";
import { requirePermission } from "@/lib/requirePermission";
import { JwtPayload } from "@/lib/jwtPayload";
import bcrypt from "bcryptjs";
import { buildWhereClause, safeParseFilters } from "./_where";

const SORTABLE_COLUMNS = new Set(["user_id", "user_firstname", "user_email"]);

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
    whereClause += ` AND (user_firstname ILIKE $${params.length} OR user_email ILIKE $${params.length} )`;
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
    FROM reg_users_new
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
  const username = String(body?.user_firstname ?? "").trim();
  const email = String(body?.user_email ?? "")
    .trim()
    .toLowerCase();
  const password = String(body?.user_password ?? "");

  console.log("body  ", body);

  if (!username || !email || !password) {
    if (!username) {
      console.log("username ", username);
    }
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const client = await db.connect();

  try {
    await client.query("BEGIN");

    const exists = await client.query(
      `SELECT 1 FROM reg_users_new WHERE user_email = $1 AND user_status_id IS DISTINCT FROM 2`,
      [email]
    );
    if (exists.rowCount) {
      await client.query("ROLLBACK");
      return NextResponse.json({ error: "Email already exists" }, { status: 409 });
    }

    const hashpw = bcrypt.hashSync(password, bcrypt.genSaltSync(10));

    const userRes = await client.query(
      `
      INSERT INTO reg_users_new (user_firstname, user_email, user_password)
      VALUES ($1, $2, $3)
      RETURNING user_id, user_firstname, user_email
      `,
      [username, email, hashpw]
    );

    const userId = userRes.rows[0].id;

    await client.query(`INSERT INTO reg_user_roles (user_id, role_id) VALUES ($1, $2)`, [
      userId,
      3,
    ]);

    await client.query("COMMIT");
    return NextResponse.json(userRes.rows[0], { status: 201 });
  } catch (err: any) {
    await client.query("ROLLBACK").catch(() => {});
    if (err?.code === "23505") {
      return NextResponse.json({ error: "Email already exists" }, { status: 409 });
    }
    console.error("Create user error:", err);

    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  } finally {
    client.release();
  }
});
