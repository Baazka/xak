//src/app/api/users/route.ts
import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { withAuth } from "@/lib/withAuth";
import { requirePermission } from "@/lib/requirePermission";
import { JwtPayload } from "@/lib/jwtPayload";
import bcrypt from "bcryptjs";
import { buildWhereClause, safeParseFilters } from "./_where";

const SORTABLE_COLUMNS = new Set(["id", "username", "email"]);

export const GET = withAuth(async (req: NextRequest, user: JwtPayload) => {
  requirePermission(user.permissions, ["user.read"]);

  const sp = new URL(req.url).searchParams;

  const page = Math.max(parseInt(sp.get("page") || "1"), 1);
  const limit = Math.max(parseInt(sp.get("limit") || "10"), 1);
  const search = sp.get("search") || "";
  const filters = safeParseFilters(sp.get("filters"));

  const sortByRaw = sp.get("sortBy") || "id";
  const sortBy = SORTABLE_COLUMNS.has(sortByRaw) ? sortByRaw : "id";
  const sortOrder = (sp.get("sortOrder") || "asc").toLowerCase() === "desc" ? "DESC" : "ASC";

  const offset = (page - 1) * limit;

  let whereClause = "WHERE status != 2";
  const params: any[] = [];

  if (search) {
    params.push(`%${search}%`);
    whereClause += ` AND (username ILIKE $${params.length} OR email ILIKE $${params.length} )`;
  }

  const dataSql = `
    SELECT id, username, email
    FROM reg_users
    ${whereClause}
    ORDER BY ${sortBy} ${sortOrder}
    LIMIT $${params.length + 1}
    OFFSET $${params.length + 2}
  `;

  const countSql = `
    SELECT COUNT(*)::int AS total
    FROM reg_users
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
  requirePermission(user.permissions, ["user.create"]);

  const body = await req.json();
  const username = String(body?.username ?? "").trim();
  const email = String(body?.email ?? "")
    .trim()
    .toLowerCase();
  const password = String(body?.password ?? "");

  if (!username || !email || !password) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const client = await db.connect();

  try {
    await client.query("BEGIN");

    const exists = await client.query(
      `SELECT 1 FROM reg_users WHERE email = $1 AND status IS DISTINCT FROM 2`,
      [email]
    );
    if (exists.rowCount) {
      await client.query("ROLLBACK");
      return NextResponse.json({ error: "Email already exists" }, { status: 409 });
    }

    const hashpw = bcrypt.hashSync(password, bcrypt.genSaltSync(10));

    const userRes = await client.query(
      `
      INSERT INTO reg_users (username, email, password)
      VALUES ($1, $2, $3)
      RETURNING id, username, email
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
