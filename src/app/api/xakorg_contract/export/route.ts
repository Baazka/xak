import ExcelJS from "exceljs";
import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { withAuth } from "@/lib/withAuth";
import { requirePermission } from "@/lib/requirePermission";
import { buildWhereClause, safeParseFilters } from "../_where";

const SORTABLE_COLUMNS = new Set(["contract_name"]);

export const GET = withAuth(async function GET(req: NextRequest, user) {
  const sp = new URL(req.url).searchParams;

  const search = sp.get("search") || "";
  const filters = safeParseFilters(sp.get("filters"));
  const org_id = user.org_id;

  const sortByRaw = sp.get("sortBy") || "contract_id";
  const sortBy = SORTABLE_COLUMNS.has(sortByRaw) ? sortByRaw : "contract_id";
  const sortOrder = (sp.get("sortOrder") || "asc").toLowerCase() === "desc" ? "DESC" : "ASC";

  const { whereClause, params } = buildWhereClause(
    search,
    filters,
    user.role_label === "ADMIN" ? null : org_id
  );

  const sql = `
    SELECT contract_id, contract_name, contract_begin_date, contract_end_date, contract_file_id, c.status, c.xakorg_id, o.name as xakorg_name
    FROM reg_xakorg_contract c
    JOIN reg_xakorg o ON c.xakorg_id = o.id
    ${whereClause}
    ORDER BY ${sortBy} ${sortOrder}
  `;

  const client = await db.connect();
  try {
    const res = await client.query(sql, params);

    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet("XakOrg");

    ws.columns = [
      { header: "№", key: "no", width: 8 },
      { header: "Байгууллагын нэр", key: "xakorg_name", width: 30 },
      { header: "Гэрээний нэр", key: "contract_name", width: 30 },
      { header: "Эхлэх огноо", key: "contract_begin_date", width: 18 },
      { header: "Дуусах огноо", key: "contract_end_date", width: 18 },

      { header: "Төлөв", key: "status", width: 15 },
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

    const filename = `xakorg_${new Date().toISOString().slice(0, 10)}.xlsx`;

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
