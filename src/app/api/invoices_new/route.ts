import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { withAuth } from "@/lib/withAuth";
import { requirePermission } from "@/lib/requirePermission";
import { JwtPayload } from "@/lib/jwtPayload";
import { CookingPot } from "lucide-react";

const SORTABLE_COLUMNS = new Set([
  "inv_no",
  "org_register_no",
  "org_legal_name",
  "inv_date",
  "inv_aud_count",
  "inv_amount",
]);

export const GET = withAuth(async (req: NextRequest, user: JwtPayload) => {
  //requirePermission(user.permissions, ["user.read"]);

  const sp = new URL(req.url).searchParams;
  const page = Math.max(parseInt(sp.get("page") || "1"), 1);
  const limit = Math.max(parseInt(sp.get("limit") || "10"), 1);
  const search = sp.get("search") || "";

  const sortByRaw = sp.get("sortBy") || "created_date";
  const sortBy = SORTABLE_COLUMNS.has(sortByRaw) ? sortByRaw : "created_date";
  const sortOrder = (sp.get("sortOrder") || "desc").toLowerCase() === "desc" ? "DESC" : "ASC";

  const offset = (page - 1) * limit;

  let whereClause = "WHERE inv_status_id in (1,2)";
  if (user.user_level_id > 2) {
    whereClause += ` AND INV_ORG_ID = ${user.org_id} `;
  }

  const params: any[] = [];

  if (search) {
    params.push(`%${search}%`);
    if (user.user_level_id > 2) {
      whereClause += ` AND (inv_no ILIKE $${params.length} OR to_char(inv_date,'YYYY.MM.DD HH24:MI') ILIKE $${params.length} OR inv_amount::text ILIKE $${params.length} `;
    } else {
      whereClause += ` AND (inv_no ILIKE $${params.length} OR to_char(inv_date,'YYYY.MM.DD HH24:MI') ILIKE $${params.length} OR inv_amount::text ILIKE $${params.length} OR org_register_no ILIKE $${params.length} OR org_legal_name ILIKE $${params.length}) `;
    }
  }

  const dataSql = `
    select 
        inv_id,
        inv_no,
        inv_org_id,
        ao.org_register_no,
        ao.org_legal_name,
        inv_type_id,
        it.type_name inv_type_name,
        to_char(inv_date,'YYYY.MM.DD') inv_date,
        inv_aud_count,
        inv_amount::int inv_amount,
        inv_status_id,
        ins.status_name inv_status_name,
        i.created_date,
        inva.inva_assign,
        inva.inva_total
    from reg_invoices i
    join reg_aud_org ao on i.inv_org_id = ao.org_id
    join ref_invoice_type it on i.inv_type_id = it.type_id
    join ref_invoice_status ins on i.inv_status_id = ins.status_id
    left join (select inva_inv_id, sum(case when inva_aud_id is null then 0 else 1 end) inva_assign, count(inva_id) inva_total from reg_invoice_audit ia group by inva_inv_id) inva
    on i.inv_id = inva.inva_inv_id
    ${whereClause}
    ORDER BY ${sortBy} ${sortOrder}
    LIMIT $${params.length + 1}
    OFFSET $${params.length + 2}
    `;
  const totalSql = `
    SELECT COUNT(*)::int AS total
    from reg_invoices i
    join reg_aud_org ao on i.inv_org_id = ao.org_id
    join ref_invoice_type it on i.inv_type_id = it.type_id
    join ref_invoice_status ins on i.inv_status_id = ins.status_id
    join (select inva_inv_id, sum(case when inva_aud_id is null then 0 else 1 end) inva_assign, count(inva_id) inva_total from reg_invoice_audit ia group by inva_inv_id) inva
    on i.inv_id = inva.inva_inv_id
    ${whereClause}
    `;

  const client = await db.connect();

  try {
    const [dataRes, totalRes] = await Promise.all([
      client.query(dataSql, [...params, limit, offset]),
      client.query(totalSql, params),
    ]);

    return NextResponse.json({
      data: dataRes.rows,
      total: totalRes.rows[0].total,
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

  const inv_type = body.inv_type_id;
  const orgId = body.org_id;
  const invAud = body.inv_aud_count;
  const invAmt = body.inv_aud_amount;
  const userId = user.id;

  if (!invAmt || invAmt < 0 || invAmt > 5000000) {
    return NextResponse.json({ error: "Цэнэглэх дүн буруу байна." }, { status: 422 });
  }

  const client = await db.connect();

  try {
    await client.query("BEGIN");

    const invCodeRes = await client.query(`SELECT nextval('invoice_code_seq') AS seq`);
    const invCodeSeq = invCodeRes.rows[0].seq;
    const invCode = `INV${String(invCodeSeq).padStart(6, "0")}`;

    const invRes = await client.query(
      `INSERT INTO reg_invoices (inv_no, inv_org_id, inv_type_id, inv_date, inv_aud_count, inv_amount, inv_status_id, created_by, created_date)
           VALUES ($1, $2, $3, current_timestamp, $4, $5, 1, $6, current_timestamp)
           RETURNING inv_id`,
      [invCode, orgId, inv_type, invAud, invAmt, userId]
    );
    const invNewId = invRes.rows[0].inv_id;

    // log_task_status insert
    // await client.query(
    //   `INSERT INTO log_task_status (task_id, task_status_id, action_by, action_date)
    //         VALUES ($1, 1, $2, current_timestamp)`,
    //   [taskNewId, createdUser]
    // );

    await client.query("COMMIT");
    return NextResponse.json({ inv_id: invNewId }, { status: 201 });
  } catch (err: any) {
    await client.query("ROLLBACK").catch(() => {});
    console.error("Invoice create error:", err);

    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  } finally {
    client.release();
  }
});
