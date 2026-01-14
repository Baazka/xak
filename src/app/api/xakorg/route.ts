//src/app/api/xakorg/route.ts
import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db"; // make sure this exports a connected pg client
import { withAuth } from "@/lib/withAuth";
import { requirePermission } from "@/lib/requirePermission";

const SORTABLE_COLUMNS = new Set(["id", "name", "reg_no", "email"]);

export const GET = withAuth(async function GET(req: NextRequest, user) {
  try {
    requirePermission(user.permissions, ["xakorg.read"]);

    const sp = new URL(req.url).searchParams;

    const page = Math.max(parseInt(sp.get("page") || "1"), 1);
    const limit = Math.max(parseInt(sp.get("limit") || "10"), 1);
    const search = sp.get("search") || "";

    const sortBy = SORTABLE_COLUMNS.has(sp.get("sortBy") || "") ? sp.get("sortBy") : "id";

    const sortOrder = (sp.get("sortOrder") || "asc").toLowerCase() === "desc" ? "DESC" : "ASC";

    const offset = (page - 1) * limit;

    let whereClause = "WHERE status IS NULL";
    const params: any[] = [];

    if (search) {
      params.push(`%${search}%`);
      whereClause += `
        AND (
          name ILIKE $${params.length}
          OR reg_no ILIKE $${params.length}
          OR email ILIKE $${params.length}
        )
      `;
    }

    const dataParams = [...params, limit, offset];

    const dataSql = `
      SELECT id, name, reg_no, email, phone, address
      FROM reg_xakorg
      ${whereClause}
      ORDER BY ${sortBy} ${sortOrder}
      LIMIT $${dataParams.length - 1}
      OFFSET $${dataParams.length}
    `;

    const countSql = `
      SELECT COUNT(*)::int AS total
      FROM reg_xakorg
      ${whereClause}
    `;

    const client = await db.connect();
    try {
      const [dataRes, countRes] = await Promise.all([
        client.query(dataSql, dataParams),
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
  } catch (err) {
    console.error("DB Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
});
export const POST = withAuth(async function POST(req: NextRequest, user) {
  requirePermission(user.permissions, ["xakorg.create"]);

  const body = await req.json();
  const { name, reg_no, email, phone, address } = body;

  // ---------- validation ----------
  if (!name || !reg_no) {
    return NextResponse.json({ message: "Нэр болон регистр заавал" }, { status: 400 });
  }

  // ---------- uniqueness check ----------
  const exists = await db.query("SELECT 1 FROM reg_xakorg WHERE reg_no = $1 AND status IS NULL", [
    reg_no,
  ]);

  if (exists.rows.length > 0) {
    return NextResponse.json(
      { message: "Ийм регистртэй байгууллага аль хэдийн бүртгэлтэй" },
      { status: 409 }
    );
  }

  // ---------- insert ----------
  const result = await db.query(
    `
      INSERT INTO reg_xakorg
        (name, reg_no, email, phone, address)
      VALUES
        ($1, $2, $3, $4, $5)
      RETURNING *
      `,
    [name, reg_no, email, phone, address]
  );

  return NextResponse.json(result.rows[0], { status: 201 });
});
