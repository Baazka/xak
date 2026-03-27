// src/app/api/payments/route.ts
import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/withAuth";
import db from "@/lib/db";
import { JwtPayload } from "@/lib/jwtPayload";

/* ======================================================
   GET /api/payments
   ====================================================== */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const page = Number(searchParams.get("page") ?? 1);
    const limit = Number(searchParams.get("limit") ?? 10);
    const offset = (page - 1) * limit;

    const invoiceNo = searchParams.get("invoice_no");
    const method = searchParams.get("method"); // BANK, CASH, CARD
    const status = searchParams.get("status") ?? "PAID";

    const result = await db.query(
      `
      WITH filtered AS (
        SELECT
          p.id,
          p.amount,
          p.paid_at,
          p.payment_ref,
          p.payment_status,
          i.invoice_no,
          m.code AS method
        FROM payments p
        JOIN invoices i ON i.id = p.invoice_id
        JOIN ref_payment_method_old m ON m.id = p.method_id
        WHERE
          ($1::text IS NULL OR i.invoice_no ILIKE '%' || $1 || '%')
          AND ($2::text IS NULL OR m.code = $2)
          AND ($3::text IS NULL OR p.payment_status = $3)
      ),
      metrics AS (
        SELECT
          COUNT(*) AS total_count,
          COALESCE(SUM(amount), 0) AS total_amount
        FROM filtered
      )
      SELECT
        json_agg(
          json_build_object(
            'id', f.id,
            'invoice_no', f.invoice_no,
            'amount', f.amount,
            'paid_at', f.paid_at,
            'method', f.method,
            'payment_ref', f.payment_ref,
            'status', f.payment_status
          )
          ORDER BY f.paid_at DESC
        ) AS payments,
        (SELECT row_to_json(metrics) FROM metrics) AS metrics
      FROM (
        SELECT *
        FROM filtered
        ORDER BY paid_at DESC
        LIMIT $4 OFFSET $5
      ) f;
      `,
      [
        invoiceNo && invoiceNo !== "" ? invoiceNo : null,
        method && method !== "" ? method : null,
        status && status !== "" ? status : null,
        limit,
        offset,
      ]
    );

    const row = result.rows[0];

    return NextResponse.json({
      data: row?.payments ?? [],
      metrics: row?.metrics ?? {
        total_count: 0,
        total_amount: 0,
      },
    });
  } catch (err: any) {
    console.error("❌ GET /api/payments error:", err);
    return NextResponse.json(
      { message: "Failed to load payments", detail: err.message },
      { status: 500 }
    );
  }
}

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
