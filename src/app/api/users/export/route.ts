import ExcelJS from "exceljs";
import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { withAuth } from "@/lib/withAuth";
import { requirePermission } from "@/lib/requirePermission";
import { buildWhereClause, safeParseFilters } from "../_where";

const SORTABLE_COLUMNS = new Set(["id", "name", "reg_no", "email"]);

export const GET = withAuth(async function GET(req: NextRequest, user) {
  requirePermission(user.permissions, ["user.read"]);

  const sp = new URL(req.url).searchParams;

  const search = sp.get("search") || "";
  const filters = safeParseFilters(sp.get("filters"));

  const sortByRaw = sp.get("sortBy") || "id";
  const sortBy = SORTABLE_COLUMNS.has(sortByRaw) ? sortByRaw : "id";
  const sortOrder = (sp.get("sortOrder") || "asc").toLowerCase() === "desc" ? "DESC" : "ASC";

  const { whereClause, params } = buildWhereClause(search, filters);

  const sql = `
    SELECT id, username, email
    FROM reg_users
    ${whereClause}
    ORDER BY ${sortBy} ${sortOrder}
  `;

  const client = await db.connect();
  try {
    const res = await client.query(sql, params);

    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet("Users");

    ws.columns = [
      { header: "№", key: "no", width: 8 },
      // { header: "ID", key: "id", width: 10 },
      { header: "Нэр", key: "username", width: 30 },
      { header: "И-мэйл", key: "email", width: 25 },
    ];
    ws.getRow(1).font = { bold: true };

    res.rows.forEach((r, i) => {
      ws.addRow({ no: i + 1, ...r });
    });

    ws.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: 1, column: ws.columns.length },
    };

    const buffer = await wb.xlsx.writeBuffer();

    const filename = `users_${new Date().toISOString().slice(0, 10)}.xlsx`;

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } finally {
    client.release();
  }
});
