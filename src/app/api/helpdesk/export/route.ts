import ExcelJS from "exceljs";
import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { withAuth } from "@/lib/withAuth";
import { requirePermission } from "@/lib/requirePermission";
import { JwtPayload } from "@/lib/jwtPayload";

const SORTABLE_COLUMNS = new Set(["task_id", "task_date", "task_code"]);

export const GET = withAuth(async function GET(req: NextRequest, user: JwtPayload) {
  //requirePermission(user.permissions, ["user.read"]);

  const sp = new URL(req.url).searchParams;
  const search = sp.get("search") || "";

  const sortByRaw = sp.get("sortBy") || "AUD_ID";
  const sortBy = SORTABLE_COLUMNS.has(sortByRaw) ? sortByRaw : "aud_id";
  const sortOrder = (sp.get("sortOrder") || "asc").toLowerCase() === "desc" ? "DESC" : "ASC";

  let whereClause = "WHERE TASK_STATUS_ID IS NOT NULL";
  if (user.user_level_id > 2) {
    whereClause += ` AND TASK_ORG_ID = ${user.org_id} `;
  }

  const params: any[] = [];

  if (search) {
    params.push(`%${search}%`);
    if (user.user_level_id > 2) {
      whereClause += ` AND (task_code ILIKE $${params.length} OR task_title ILIKE $${params.length} OR task_date ILIKE $${params.length} OR aud_code ILIKE $${params.length}
        or aud_name ILIKE $${params.length})`;
    } else {
      whereClause += ` AND (task_code ILIKE $${params.length} OR task_title ILIKE $${params.length} OR task_date ILIKE $${params.length} OR aud_code ILIKE $${params.length}
        or aud_name ILIKE $${params.length} OR org_register_no ILIKE $${params.length} OR org_legal_name ILIKE $${params.length})`;
    }
  }

  const dataSql = `
      select 
        task_id,
        task_org_id,
        rao.org_register_no,
        rao.org_legal_name,
        task_code,
        to_char(task_date,'YYYY.MM.DD HH24:MI') task_date,
        task_status_id,
        ts.status_label task_status_label,
        task_priority_id,
        tp.priority_name task_priority_name,
        task_title,
        task_content,
        task_audit_id,
        ao.org_register_no aud_org_regno,
        ao.org_legal_name aud_org_name,
        ad.aud_year,
        ad.aud_code,
        ad.aud_name,
        task_form_id,
        af.form_stage task_form_stage,
        af.form_name task_form_name
        from reg_task t
        join reg_aud_org rao on t.task_org_id = rao.org_id
        join ref_task_status ts on t.task_status_id = ts.status_id
        join ref_task_priority tp on t.task_priority_id = priority_id
        left join audit_data ad on t.task_audit_id = ad.aud_id
        left join reg_aud_org ao on ad.aud_org_id = ao.org_id
        left join ref_audit_form af on t.task_form_id = af.form_id
      ${whereClause}
      ORDER BY ${sortBy} ${sortOrder}
    `;

  const client = await db.connect();
  try {
    const res = await client.query(dataSql, params);

    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet("Тусламжийн хүсэлтийн жагсаалт");

    if (user.user_level_id > 2) {
      ws.columns = [
        { header: "№", key: "no", width: 5 },
        { key: "task_code", header: "Тусламжийн код", width: 18 },
        { key: "task_date", header: "Огноо", width: 18 },
        { key: "task_status_label", header: "Төлөв", width: 15 },
        { key: "task_priority_name", header: "Түвшин", width: 15 },
        { key: "task_title", header: "Агуулга", width: 25 },
        { key: "aud_name", header: "Аудитын нэр", width: 18 },
      ];
    } else {
      ws.columns = [
        { header: "№", key: "no", width: 5 },
        { key: "org_register_no", header: "Байгууллагын регистр", width: 18 },
        { key: "org_legal_name", header: "Байгууллагын нэр", width: 18 },
        { key: "task_code", header: "Тусламжийн код", width: 18 },
        { key: "task_date", header: "Огноо", width: 18 },
        { key: "task_status_label", header: "Төлөв", width: 15 },
        { key: "task_priority_name", header: "Түвшин", width: 15 },
        { key: "task_title", header: "Агуулга", width: 25 },
        { key: "aud_name", header: "Аудитын нэр", width: 18 },
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

    const filename = `tasks_${new Date().toISOString().slice(0, 10)}.xlsx`;

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
