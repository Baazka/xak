import ExcelJS from "exceljs";
import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { withAuth } from "@/lib/withAuth";
import { requirePermission } from "@/lib/requirePermission";
import { buildWhereClause, safeParseFilters } from "../_where";

const SORTABLE_COLUMNS = new Set(["user_id", "user_firstname", "user_email"]);

export const GET = withAuth(async function GET(req: NextRequest, user) {
  //requirePermission(user.permissions, ["user.read"]);

  const sp = new URL(req.url).searchParams;

  const page = Math.max(parseInt(sp.get("page") || "1"), 1);
  const limit = Math.max(parseInt(sp.get("limit") || "10"), 1);
  const search = sp.get("search") || "";
  const filters = safeParseFilters(sp.get("filters"));

  const sortByRaw = sp.get("sortBy") || "user_id";
  const sortBy = SORTABLE_COLUMNS.has(sortByRaw) ? sortByRaw : "user_id";
  const sortOrder = (sp.get("sortOrder") || "asc").toLowerCase() === "desc" ? "DESC" : "ASC";

  const offset = (page - 1) * limit;

  let whereClause = "WHERE user_status_id != 2";
  if (user.user_level_id > 2) {
    whereClause += ` AND USER_ORG_ID = ${user.org_id} `;
  }
  const params: any[] = [];

  if (search) {
    params.push(`%${search}%`);
    if (user.user_level_id > 2) {
      whereClause += ` AND (user_firstname ILIKE $${params.length} OR user_email ILIKE $${params.length} OR user_phone ILIKE $${params.length} OR user_register_no ILIKE $${params.length})`;
    } else {
      whereClause += ` AND (user_firstname ILIKE $${params.length} OR user_email ILIKE $${params.length} OR user_phone ILIKE $${params.length} OR user_register_no ILIKE $${params.length}
                      OR org_register_no ILIKE $${params.length} OR org_legal_name ILIKE $${params.length} OR org_email ILIKE $${params.length} OR org_phone ILIKE $${params.length})`;
    }
  }

  const dataSql = `
    SELECT 
      ru.user_id, 
      ru.user_register_no, 
      ru.user_firstname, 
      ru.user_email, 
      ru.user_phone, 
      to_char(ru.user_regdate, 'YYYY.MM.DD') as user_regdate, 
      ru.user_status_id,
      rur.role_id,
      rur.role_label,
      rur.role_code,
      rur.role_text,
      ao.org_id,
      ao.org_register_no,
      ao.org_legal_name,
      ao.org_phone,
      ao.org_email
    FROM reg_users_new ru
    JOIN reg_aud_org ao on ru.user_org_id = ao.org_id
    JOIN reg_user_roles_new ur on ru.user_id = ur.user_id and ur.is_active = 1
    JOIN ref_user_role rur on ur.role_id = rur.role_id 
    ${whereClause}
    ORDER BY ${sortBy} ${sortOrder}
  `;

  const client = await db.connect();
  try {
    const res = await client.query(dataSql, params);

    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet("Хэрэглэгчийн жагсаалт");

    ws.columns = [
      { header: "№", key: "no", width: 5 },
      { key: "org_register_no", header: "Байгууллагын регистр", width: 15 },
      { key: "org_legal_name", header: "Байгууллагын нэр", width: 25 },
      { key: "org_phone", header: "Байгууллагын утас", width: 15 },
      { key: "org_email", header: "Байгууллагын мэйл", width: 25 },
      { key: "role_text", header: "Эрхийн түвшин", width: 18 },
      { key: "user_register_no", header: "Регистр", width: 18 },
      { key: "user_firstname", header: "Нэр", width: 25 },
      { key: "user_phone", header: "Утас", width: 15 },
      { key: "user_email", header: "И-мэйл", width: 25 },
      { key: "user_regdate", header: "Бүргэсэн огноо", width: 18 },
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

    const filename = `usersAdmin_${new Date().toISOString().slice(0, 10)}.xlsx`;

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
