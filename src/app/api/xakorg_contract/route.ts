//src/app/api/xakorg/route.ts
import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { withAuth } from "@/lib/withAuth";
import { requirePermission } from "@/lib/requirePermission";
import { buildWhereClause, safeParseFilters } from "./_where";

const SORTABLE_COLUMNS = new Set(["contract_name", "contract_begin_date", "contract_end_date"]);

export const GET = withAuth(async function GET(req: NextRequest, user) {
  try {
    const sp = new URL(req.url).searchParams;

    const page = Math.max(parseInt(sp.get("page") || "1"), 1);
    const limit = Math.max(parseInt(sp.get("limit") || "10"), 1);
    const search = sp.get("search") || "";
    const filters = safeParseFilters(sp.get("filters"));

    // whereClause + params бэлэн болсон (search/filter бүгд эндээс гарна)
    const { whereClause, params } = buildWhereClause(search, filters);

    const sortByRaw = sp.get("sortBy") || "id";
    const sortBy = SORTABLE_COLUMNS.has(sortByRaw) ? sortByRaw : "id";
    const sortOrder = (sp.get("sortOrder") || "asc").toLowerCase() === "desc" ? "DESC" : "ASC";

    const offset = (page - 1) * limit;

    // where params бүрэн болсны дараа
    const dataParams = [...params, limit, offset];

    const dataSql = `
      SELECT contract_id, contract_name, contract_begin_date, contract_end_date, contract_file_id, c.status, c.xakorg_id, o.name as xakorg_name
      FROM reg_xakorg_contract c
	    JOIN reg_xakorg o ON c.xakorg_id = o.id
      ${whereClause}
      ORDER BY ${sortBy} ${sortOrder}
      LIMIT $${params.length + 1}
      OFFSET $${params.length + 2}
    `;

    const countSql = `
      SELECT COUNT(*)::int AS total
      FROM reg_xakorg_contract c
	    JOIN reg_xakorg o ON c.xakorg_id = o.id
      ${whereClause}
    `;
    console.log(dataSql, countSql);
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
  //requirePermission(user.permissions, ["xakorg.create"]);

  const body = await req.json();
  const { contract_name, contract_begin_date, contract_end_date, contract_file_id, status } = body;

  // ---------- validation ----------
  if (!contract_name || !contract_file_id) {
    return NextResponse.json({ message: "Гэрээний нэр, файл заавал" }, { status: 400 });
  }

  // ---------- insert ----------
  const result = await db.query(
    `
      INSERT INTO reg_xakorg_contract
        (contract_name, contract_begin_date, contract_end_date, contract_file_id, status, xakorg_id)
      VALUES
        ($1, $2, $3, $4, $5, $6)
      RETURNING *
      `,
    [contract_name, contract_begin_date, contract_end_date, contract_file_id, status, user.id]
  );

  return NextResponse.json(result.rows[0], { status: 201 });
});
