//src/app/api/users/route.ts
import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db"; // make sure this exports a connected pg client
import { withAuth } from "@/lib/withAuth";
import { requirePermission } from "@/lib/requirePermission";
import bcrypt from "bcryptjs";

const SORTABLE_COLUMNS = new Set(["id", "username", "email"]); // Add valid sortable columns here

export const GET = withAuth(async function GET(req: NextRequest, user) {
  try {
    requirePermission(user.permissions, ["user.read"]);

    const sp = new URL(req.url).searchParams;

    const page = Math.max(parseInt(sp.get("page") || "1"), 1);
    const limit = Math.max(parseInt(sp.get("limit") || "10"), 1);
    const search = sp.get("search") || "";
    const sortBy = SORTABLE_COLUMNS.has(sp.get("sortBy") || "") ? sp.get("sortBy")! : "id";
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
    LIMIT $${params.length + 1} OFFSET $${params.length + 2}
  `;
    params.push(limit, offset);

    const countSql = `SELECT COUNT(*)::int AS total FROM reg_users ${whereClause}`;

    const client = await db.connect();
    try {
      const [dataRes, countRes] = await Promise.all([
        client.query(dataSql, params),
        client.query(countSql, params.slice(0, params.length - 2)),
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
  } catch (err) {
    console.error("DB Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
});
export const POST = withAuth(async function POST(req: NextRequest, user) {
  try {
    const body = await req.json();
    const action = body.action || "create";

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

    const result_role = await db.query(
      "INSERT INTO REG_USER_ROLES(user_id, role_id) VALUES ($1, $2) RETURNING *",
      [seq_res, 3]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (err) {
    console.error("DB Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
async function updateUser({ id, name, email }: { id: number; name: string; email: string }) {
  try {
    const result = await db.query(
      "UPDATE reg_users SET username = $1, email = $2 WHERE id = $3 RETURNING *",
      [name, email, id]
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (err) {
    console.error("DB Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
async function removeUser(id: number) {
  try {
    const result = await db.query("UPDATE reg_users SET status = 2 WHERE id = $1 RETURNING *", [
      id,
    ]);

    if (result.rowCount === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("DB Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
