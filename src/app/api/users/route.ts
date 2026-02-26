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

    switch (action) {
      case "create":
        requirePermission(user.permissions, ["user.create"]);
        return await createUser(body.data);

      case "update":
        requirePermission(user.permissions, ["user.update"]);
        return await updateUser(body.data);

      case "remove":
        requirePermission(user.permissions, ["user.delete"]);
        return await removeUser(body.data);

      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (err) {
    console.error("POST Error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
});
async function createUser({
  username,
  email,
  password,
}: {
  username: string;
  email: string;
  password: string;
}) {
  try {
    const seq_id = await db.query("select nextval('reg_users_id_seq'::regclass)");
    const seq_res = seq_id.rows[0].nextval;
    const salt = bcrypt.genSaltSync(10);
    const hashpw = bcrypt.hashSync(password, salt);
    const result = await db.query(
      "INSERT INTO reg_users (id, username, email, password) VALUES ($1, $2, $3, $4) RETURNING *",
      [seq_res, username, email, hashpw]
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
