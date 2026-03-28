import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { withAuth } from "@/lib/withAuth";
import { requirePermission } from "@/lib/requirePermission";
import { JwtPayload } from "@/lib/jwtPayload";

const SORTABLE_COLUMNS = new Set([
  "tran_cr_dt",
  "tran_status_name",
  "tran_code",
  "tran_amount",
  "inv_no",
  "created_date",
]);

export const GET = withAuth(async (req: NextRequest, user: JwtPayload) => {
  //requirePermission(user.permissions, ["user.read"]);

  const sp = new URL(req.url).searchParams;
  const page = Math.max(parseInt(sp.get("page") || "1"), 1);
  const limit = Math.max(parseInt(sp.get("limit") || "10"), 1);
  const search = sp.get("search") || "";

  const sortByRaw = sp.get("sortBy") || "tran_id";
  const sortBy = SORTABLE_COLUMNS.has(sortByRaw) ? sortByRaw : "tran_id";
  const sortOrder = (sp.get("sortOrder") || "desc").toLowerCase() === "desc" ? "DESC" : "ASC";

  const offset = (page - 1) * limit;

  let whereClause = "WHERE";
  if (user.user_level_id > 2) {
    whereClause += ` TRAN_ORG_ID = ${user.org_id} `;
  }

  const params: any[] = [];

  if (search) {
    params.push(`%${search}%`);
    if (user.user_level_id > 2) {
      whereClause += ` AND (tran_code ILIKE $${params.length} OR to_char(tran_date,'YYYY.MM.DD HH24:MI') ILIKE $${params.length} OR inv_no ILIKE $${params.length} OR tran_amount::text ILIKE $${params.length}
        or tran_cr_dt ILIKE $${params.length})`;
    } else {
      whereClause += ` AND (tran_code ILIKE $${params.length} OR to_char(tran_date,'YYYY.MM.DD HH24:MI') ILIKE $${params.length} OR inv_no ILIKE $${params.length} OR tran_amount::text ILIKE $${params.length}
        or tran_cr_dt ILIKE $${params.length} OR org_register_no ILIKE $${params.length} OR org_legal_name ILIKE $${params.length})`;
    }
  }

  const dataSql = `
    select 
        t.tran_id,
        t.tran_org_id,
        ao.org_register_no,
        ao.org_legal_name,
        t.tran_type_id,
        tt.tran_type_name,
        (case when t.tran_cr_dt = 'DT' then 'Орлого' when t.tran_cr_dt = 'CR' then 'Зарлага' end) as tran_cr_dt,
        t.tran_status_id,
        ts.status_name tran_status_name,
        t.tran_code,
        to_char(t.tran_amount,'FM9,999,999') as tran_amount,
        to_char(tran_date,'YYYY.MM.DD HH24:MI') tran_date,
        t.tran_inv_id,
        inv.inv_no,
        t.created_date
    from reg_transactions t
    join reg_aud_org ao on t.tran_org_id = ao.org_id
    join ref_transaction_type tt on t.tran_type_id = tt.tran_type_id
    join ref_transaction_status ts on t.tran_status_id = ts.status_id
    left join reg_invoices inv on t.tran_inv_id = inv.inv_id
    ${whereClause}
    ORDER BY ${sortBy} ${sortOrder}
    LIMIT $${params.length + 1}
    OFFSET $${params.length + 2}
    `;
  const totalSql = `
    SELECT COUNT(*)::int AS total, sum(case when t.tran_cr_dt = 'DT' then t.tran_amount else -1*t.tran_amount end)::integer AS balance
    from reg_transactions t
    join reg_aud_org ao on t.tran_org_id = ao.org_id
    join ref_transaction_type tt on t.tran_type_id = tt.tran_type_id
    join ref_transaction_status ts on t.tran_status_id = ts.status_id
    left join reg_invoices inv on t.tran_inv_id = inv.inv_id
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
      balance: totalRes.rows[0].balance,
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

  const depoAmt = body.depoAmount;
  const orgId = user.org_id;
  const userId = user.id;

  if (!depoAmt || depoAmt < 0 || depoAmt > 5000000) {
    return NextResponse.json({ error: "Цэнэглэх дүн буруу байна." }, { status: 422 });
  }

  const client = await db.connect();

  try {
    await client.query("BEGIN");

    const tranCodeRes = await client.query(`SELECT nextval('tran_code_seq') AS seq`);
    const tranCodeSeq = tranCodeRes.rows[0].seq;
    const tranCode = `TR01-${String(tranCodeSeq).padStart(6, "0")}`;

    const tranRes = await client.query(
      `INSERT INTO reg_transactions (tran_type_id, tran_cr_dt, tran_status_id, tran_code, tran_amount, tran_org_id, tran_user_id, tran_date, created_by, created_date)
           VALUES (1, 'DT', 1, $1, $2, $3, $4, current_timestamp, $4, current_timestamp)
           RETURNING tran_id`,
      [tranCode, depoAmt, orgId, userId]
    );
    const tranNewId = tranRes.rows[0].tran_id;

    // log_task_status insert
    // await client.query(
    //   `INSERT INTO log_task_status (task_id, task_status_id, action_by, action_date)
    //         VALUES ($1, 1, $2, current_timestamp)`,
    //   [taskNewId, createdUser]
    // );

    await client.query("COMMIT");
    return NextResponse.json({ tran_id: tranNewId }, { status: 201 });
  } catch (err: any) {
    await client.query("ROLLBACK").catch(() => {});
    console.error("Wallet deposit error:", err);

    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  } finally {
    client.release();
  }
});
