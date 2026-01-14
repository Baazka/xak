//src/app/api/users/route.ts
import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db"; // make sure this exports a connected pg client
import { withAuth } from "@/lib/withAuth";
import { requirePermission } from "@/lib/requirePermission";

const SORTABLE_COLUMNS = new Set(["id", "username", "email"]); // Add valid sortable columns here

export const GET = withAuth(async function GET(req: NextRequest, user) {
  try {
    requirePermission(user.permissions, ["xakorg.read"]);

    const sp = new URL(req.url).searchParams;

    const page = Math.max(parseInt(sp.get("page") || "1"), 1);
    const limit = Math.max(parseInt(sp.get("limit") || "10"), 1);
    const search = sp.get("search") || "";
    const sortBy = SORTABLE_COLUMNS.has(sp.get("sortBy") || "") ? sp.get("sortBy")! : "id";
    const sortOrder = (sp.get("sortOrder") || "asc").toLowerCase() === "desc" ? "DESC" : "ASC";
    const offset = (page - 1) * limit;

    //let whereClause = "WHERE status is null";
    const params: any[] = [];

    // if (search) {
    //   params.push(`%${search}%`);
    //   whereClause += ` AND (name ILIKE $${params.length} OR email ILIKE $${params.length} )`;
    // }

    const dataSql = `
    SELECT id, name, reg_no, email, phone, address
    FROM reg_xakorg
     WHERE status IS NULL
    ORDER BY ${sortBy} ${sortOrder}
    LIMIT $${params.length + 1} OFFSET $${params.length + 2}
  `;
    params.push(limit, offset);

    const countSql = `SELECT COUNT(*)::int AS total FROM reg_xakorg WHERE status IS NULL`;

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
  requirePermission(user.permissions, ["xakorg.create"]);

  const { name, reg_no } = await req.json();

  const result = await db.query(
    "INSERT INTO reg_xakorg (name, reg_no) VALUES ($1, $2) RETURNING *",
    [name, reg_no]
  );

  return NextResponse.json(result.rows[0], { status: 201 });
});