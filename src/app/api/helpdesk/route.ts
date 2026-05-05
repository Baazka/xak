import ExcelJS from "exceljs";
import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { withAuth } from "@/lib/withAuth";
import { requirePermission } from "@/lib/requirePermission";
import { JwtPayload } from "@/lib/jwtPayload";

const SORTABLE_COLUMNS = new Set(["task_id", "task_date", "task_code"]);

export const GET = withAuth(async (req: NextRequest, user: JwtPayload) => {
  //requirePermission(user.permissions, ["user.read"]);

  const sp = new URL(req.url).searchParams;
  const page = Math.max(parseInt(sp.get("page") || "1"), 1);
  const limit = Math.max(parseInt(sp.get("limit") || "10"), 1);
  const search = sp.get("search") || "";

  const sortByRaw = sp.get("sortBy") || "TASK_ID";
  const sortBy = SORTABLE_COLUMNS.has(sortByRaw) ? sortByRaw : "task_id";
  const sortOrder = (sp.get("sortOrder") || "asc").toLowerCase() === "desc" ? "DESC" : "DESC";

  const offset = (page - 1) * limit;

  let whereClause = "WHERE TASK_STATUS_ID IS NOT NULL";
  if (user.user_level_id > 2) {
    whereClause += ` AND TASK_ORG_ID = ${user.org_id} `;
  }

  const params: any[] = [];

  if (search) {
    params.push(`%${search}%`);
    if (user.user_level_id > 2) {
      whereClause += ` AND (task_code ILIKE $${params.length} OR task_title ILIKE $${params.length} OR to_char(task_date,'YYYY.MM.DD HH24:MI') ILIKE $${params.length} OR aud_code ILIKE $${params.length}
        or aud_name ILIKE $${params.length})`;
    } else {
      whereClause += ` AND (task_code ILIKE $${params.length} OR task_title ILIKE $${params.length} OR to_char(task_date,'YYYY.MM.DD HH24:MI') ILIKE $${params.length} OR aud_code ILIKE $${params.length}
        or aud_name ILIKE $${params.length} OR rao.org_register_no ILIKE $${params.length} OR rao.org_legal_name ILIKE $${params.length})`;
    }
  }

  const dataSql = `
      select 
        task_id,
        task_org_id,
        rao.org_register_no,
        rao.org_legal_name,
        task_code,
        to_char(task_date,'YYYY.MM.DD HH24:MI')::text as task_date,
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
      LIMIT $${params.length + 1}
      OFFSET $${params.length + 2}
    `;
  const countSql = `
      SELECT COUNT(*)::int AS total
      from reg_task t
        join reg_aud_org rao on t.task_org_id = rao.org_id
        join ref_task_status ts on t.task_status_id = ts.status_id
        join ref_task_priority tp on t.task_priority_id = priority_id
        left join audit_data ad on t.task_audit_id = ad.aud_id
        left join reg_aud_org ao on ad.aud_org_id = ao.org_id
        left join ref_audit_form af on t.task_form_id = af.form_id
      ${whereClause}
    `;

  const client = await db.connect();

  try {
    const [dataRes, countRes] = await Promise.all([
      client.query(dataSql, [...params, limit, offset]),
      client.query(countSql, params),
    ]);

    return NextResponse.json({
      data: dataRes.rows,
      total: countRes.rows[0].total,
      page,
      limit,
    });
  } catch (err) {
    console.error("DB Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  } finally {
    client.release();
  }
});

export const POST = withAuth(async (req: NextRequest, user: JwtPayload) => {
  //requirePermission(user.permissions, ["user.create"]);

  const body = await req.json();

  const createdUser = body.createdBy || user.id;
  const orgId = body.user_org_id || user.org_id;
  const taskTitle = String(body?.task_title ?? "").trim();
  const taskContent = String(body?.task_content ?? "").trim();
  const taskPriorityId = Number(body?.task_priority_id ?? null);
  const auditId = Number(body?.aud_id ?? null);
  const formId = Number(body?.form_id ?? null);

  if (!taskTitle || !taskContent) {
    return NextResponse.json({ error: "Хүсэлтийн мэдээлэл бүрэн оруулна уу" }, { status: 400 });
  }

  const client = await db.connect();

  try {
    await client.query("BEGIN");

    const taskCodeRes = await client.query(`SELECT nextval('task_code_seq') AS seq`);
    const taskCodeSeq = taskCodeRes.rows[0].seq;
    const taskCode = `#T${String(taskCodeSeq).padStart(6, "0")}`;

    console.log("dqwdq ", auditId, formId);

    // reg_task insert
    const taskRes = await client.query(
      `INSERT INTO reg_task (task_org_id, task_code, task_date, task_status_id, task_priority_id, task_title, task_content, task_audit_id, task_form_id, task_created_by)
           VALUES ($1, $2, current_timestamp, 1, $3, $4, $5, $6, $7, $8)
           RETURNING task_id`,
      [orgId, taskCode, taskPriorityId, taskTitle, taskContent, auditId, formId, createdUser]
    );
    const taskNewId = taskRes.rows[0].task_id;

    // log_task_status insert
    await client.query(
      `INSERT INTO log_task_status (task_id, task_status_id, action_by, action_date)
            VALUES ($1, 1, $2, current_timestamp)`,
      [taskNewId, createdUser]
    );

    await client.query("COMMIT");
    return NextResponse.json({ task_id: taskNewId, task_code: taskCode }, { status: 201 });
  } catch (err: any) {
    await client.query("ROLLBACK").catch(() => {});
    console.error("Create task error:", err);

    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  } finally {
    client.release();
  }
});
