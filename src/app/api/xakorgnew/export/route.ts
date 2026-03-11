import ExcelJS from "exceljs";
import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { withAuth } from "@/lib/withAuth";
import { requirePermission } from "@/lib/requirePermission";
import { buildWhereClause, safeParseFilters } from "../_where";

const SORTABLE_COLUMNS = new Set([
  "org_id",
  "org_register_no",
  "org_legal_name",
  "org_phone",
  "org_email",
]);

export const GET = withAuth(async function GET(req: NextRequest, user) {
  //requirePermission(user.permissions, ["user.read"]);

  const sp = new URL(req.url).searchParams;

  const search = sp.get("search") || "";
  const filters = safeParseFilters(sp.get("filters"));

  const sortByRaw = sp.get("sortBy") || "org_id";
  const sortBy = SORTABLE_COLUMNS.has(sortByRaw) ? sortByRaw : "org_id";
  const sortOrder = (sp.get("sortOrder") || "asc").toLowerCase() === "desc" ? "DESC" : "ASC";

  const { whereClause, params } = buildWhereClause(search, filters);

  const sql = `
    SELECT org_id, org_register_no, org_legal_name, org_phone, org_email, org_address, org_head_name, org_head_phone, org_head_email, to_char(created_date, 'YYYY.MM.DD') as created_date
    FROM reg_aud_org
    ${whereClause}
    ORDER BY ${sortBy} ${sortOrder}
  `;

  const client = await db.connect();
  try {
    const res = await client.query(sql, params);

    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet("ХАК жагсаалт");

    ws.columns = [
      { header: "№", key: "no", width: 8 },
      { header: "ID", key: "org_id", width: 10 },
      { header: "Регистрын дугаар", key: "org_register_no", width: 22 },
      { header: "ХАК нэр", key: "org_legal_name", width: 30 },
      { header: "ХАК утас", key: "org_phone", width: 15 },
      { header: "ХАК мэйл", key: "org_email", width: 15 },
      { header: "ХАК хаяг", key: "org_address", width: 35 },
      { header: "Удирдлага нэр", key: "org_head_name", width: 30 },
      { header: "Удирдлага утас", key: "org_head_phone", width: 15 },
      { header: "Удирдлага мэйл", key: "org_head_email", width: 15 },
      { header: "Бүртгэгдсэн", key: "created_date", width: 18 },
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

    const filename = `xaklist_${new Date().toISOString().slice(0, 10)}.xlsx`;

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
