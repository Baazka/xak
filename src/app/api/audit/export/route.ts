import ExcelJS from "exceljs";
import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { withAuth } from "@/lib/withAuth";
import { requirePermission } from "@/lib/requirePermission";
import { JwtPayload } from "@/lib/jwtPayload";

const SORTABLE_COLUMNS = new Set(["aud_id", "aud_name", "aud_code"]);

export const GET = withAuth(async function GET(req: NextRequest, user: JwtPayload) {
  //requirePermission(user.permissions, ["user.read"]);

  const sp = new URL(req.url).searchParams;
  const search = sp.get("search") || "";

  const sortByRaw = sp.get("sortBy") || "AUD_ID";
  const sortBy = SORTABLE_COLUMNS.has(sortByRaw) ? sortByRaw : "aud_id";
  const sortOrder = (sp.get("sortOrder") || "asc").toLowerCase() === "desc" ? "DESC" : "ASC";

  let whereClause = "WHERE AUD_STATUS_ID IS NOT NULL";
  if (user.user_level_id > 2) {
    whereClause += ` AND AUD_ORG_ID = ${user.org_id} `;
  }

  const params: any[] = [];

  if (search) {
    params.push(`%${search}%`);
    if (user.user_level_id > 2) {
      whereClause += ` AND (aud_code ILIKE $${params.length} OR COMP_REG_NO ILIKE $${params.length} OR COMP_LEGAL_NAME ILIKE $${params.length} OR AUD_NAME ILIKE $${params.length})`;
    } else {
      whereClause += ` AND (aud_code ILIKE $${params.length} OR COMP_REG_NO ILIKE $${params.length} OR COMP_LEGAL_NAME ILIKE $${params.length} OR AUD_NAME ILIKE $${params.length}
                      OR org_register_no ILIKE $${params.length} OR org_legal_name ILIKE $${params.length})`;
    }
  }

  const dataSql = `
      SELECT 
        AUD_ID,
        AUD_ORG_ID,
        AO.ORG_REGISTER_NO,
        AO.ORG_LEGAL_NAME,
        AUD_COMP_ID,
        RC.COMP_REG_NO,
        RC.COMP_LEGAL_NAME,
        AUD_CODE,
        AUD_TYPE_ID,
        RAT.TYPE_NAME AUD_TYPE_NAME,
        AUD_YEAR,
        AUD_NAME,
        TO_CHAR(AUD_BEGIN_DATE,'YYYY.MM.DD') AUD_BEGIN_DATE,
        TO_CHAR(AUD_END_DATE,'YYYY.MM.DD') AUD_END_DATE,
        AUD_STATUS_ID,
        RAS.STATUS_LABEL AUD_STATUS_LABEL
        FROM AUDIT_DATA AD
        JOIN REG_AUD_ORG AO ON AD.AUD_ORG_ID = AO.ORG_ID
        JOIN REG_COMPANY RC ON AD.AUD_COMP_ID = RC.COMP_ID
        JOIN REF_AUDIT_TYPE RAT ON AD.AUD_TYPE_ID = RAT.TYPE_ID
        JOIN REF_AUDIT_STATUS RAS ON AD.AUD_STATUS_ID = RAS.STATUS_ID
      ${whereClause}
      ORDER BY ${sortBy} ${sortOrder}
    `;

  const client = await db.connect();
  try {
    const res = await client.query(dataSql, params);

    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet("Аудитын жагсаалт");

    if (user.user_level_id > 2) {
      ws.columns = [
        { header: "№", key: "no", width: 5 },
        { key: "aud_year", header: "Аудитын жил", width: 18 },
        { key: "aud_type_name", header: "Аудитын төрөл", width: 18 },
        { key: "aud_code", header: "Аудитын код", width: 25 },
        { key: "aud_name", header: "Аудитын нэр", width: 15 },
        { key: "comp_reg_no", header: "Шалгагдагч регистр", width: 25 },
        { key: "comp_legal_name", header: "Шалгагдагч нэр", width: 18 },
        { key: "aud_begin+date", header: "Эхлэх огноо", width: 18 },
        { key: "aud_end_date", header: "Дуусах огноо", width: 18 },
        { key: "aud_status_label", header: "Төлөв", width: 18 },
      ];
    } else {
      ws.columns = [
        { header: "№", key: "no", width: 5 },
        { key: "org_register_no", header: "Байгууллагын регистр", width: 18 },
        { key: "org_legal_name", header: "Байгууллагын нэр", width: 18 },
        { key: "aud_year", header: "Аудитын жил", width: 18 },
        { key: "aud_type_name", header: "Аудитын төрөл", width: 18 },
        { key: "aud_code", header: "Аудитын код", width: 25 },
        { key: "aud_name", header: "Аудитын нэр", width: 15 },
        { key: "comp_reg_no", header: "Шалгагдагч регистр", width: 25 },
        { key: "comp_legal_name", header: "Шалгагдагч нэр", width: 18 },
        { key: "aud_begin+date", header: "Эхлэх огноо", width: 18 },
        { key: "aud_end_date", header: "Дуусах огноо", width: 18 },
        { key: "aud_status_label", header: "Төлөв", width: 18 },
      ];
    }

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
