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

  const invId = body.inv_id;
  const orgId = body.org_id;
  const invAudCnt = body.inv_aud_count;
  const invAmt = Number(body.inv_amount);
  const userId = user.id;

  const client = await db.connect();

  if (!invAmt || !invAudCnt || !invId || !orgId) {
    return NextResponse.json({ error: "Мэдээлэл бүрэн биш байна." }, { status: 422 });
  }

  try {
    await client.query("BEGIN");

    const tranCodeRes = await client.query(`SELECT nextval('tran_code_seq') AS seq`);
    const tranCodeSeq = tranCodeRes.rows[0].seq;
    const tranCode = `TR04-${String(tranCodeSeq).padStart(6, "0")}`;

    const tranRes = await client.query(
      `INSERT INTO reg_transactions (tran_type_id, tran_cr_dt, tran_status_id, tran_code, tran_amount, tran_org_id, tran_user_id, tran_date, created_by, created_date, tran_inv_id)
           VALUES (4, 'CR', 1, $1, $2, $3, $4, current_timestamp, $4, current_timestamp, $5)
           RETURNING tran_id`,
      [tranCode, invAmt, orgId, userId, invId]
    );
    const tranNewId = tranRes.rows[0].tran_id;

    const invUpdateRes = await client.query(
      `UPDATE reg_invoices
       SET inv_status_id = 2, updated_by = $1, updated_date = current_timestamp
       WHERE inv_id = $2`,
      [userId, invId]
    );

    for (let i = 0; i < invAudCnt; i++) {
      await client.query(
        `INSERT INTO reg_invoice_audit (inva_inv_id, created_by, created_date)
         VALUES ($1, $2, current_timestamp)`,
        [invId, userId]
      );
    }

    await client.query("COMMIT");
    return NextResponse.json({ tran_id: tranNewId }, { status: 201 });
  } catch (err: any) {
    await client.query("ROLLBACK").catch(() => {});
    console.error("Payment wallet error:", err);

    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  } finally {
    client.release();
  }
});

export const PUT = withAuth(async (req: NextRequest, user: JwtPayload) => {
  //requirePermission(user.permissions, ["user.create"]);

  const body = await req.json();

  const invId = body.inv_id;
  const orgId = body.org_id;
  const invAudCnt = body.inv_aud_count;
  const invAmt = Number(body.inv_amount);
  const userId = user.id;

  const client = await db.connect();

  if (!invAmt || !invAudCnt || !invId || !orgId) {
    return NextResponse.json({ error: "Мэдээлэл бүрэн биш байна." }, { status: 422 });
  }

  try {
    await client.query("BEGIN");

    const tranDTCodeRes = await client.query(`SELECT nextval('tran_code_seq') AS seq`);
    const tranDTCodeSeq = tranDTCodeRes.rows[0].seq;
    const tranDTCode = `TR02-${String(tranDTCodeSeq).padStart(6, "0")}`;

    const tranDTRes = await client.query(
      `INSERT INTO reg_transactions (tran_type_id, tran_cr_dt, tran_status_id, tran_code, tran_amount, tran_org_id, tran_user_id, tran_date, created_by, created_date)
           VALUES (2, 'DT', 1, $1, $2, $3, $4, current_timestamp, $4, current_timestamp)
           RETURNING tran_id`,
      [tranDTCode, invAmt, orgId, userId]
    );
    const tranDTId = tranDTRes.rows[0].tran_id;

    const tranCRCodeRes = await client.query(`SELECT nextval('tran_code_seq') AS seq`);
    const tranCRCodeSeq = tranCRCodeRes.rows[0].seq;
    const tranCRCode = `TR03-${String(tranCRCodeSeq).padStart(6, "0")}`;

    const tranCRRes = await client.query(
      `INSERT INTO reg_transactions (tran_type_id, tran_cr_dt, tran_status_id, tran_code, tran_amount, tran_org_id, tran_user_id, tran_date, created_by, created_date, tran_inv_id)
           VALUES (2, 'CR', 1, $1, $2, $3, $4, current_timestamp, $4, current_timestamp, $5)
           RETURNING tran_id`,
      [tranCRCode, invAmt, orgId, userId, invId]
    );
    const tranCRId = tranCRRes.rows[0].tran_id;

    const invUpdateRes = await client.query(
      `UPDATE reg_invoices
       SET inv_status_id = 2, updated_by = $1, updated_date = current_timestamp
       WHERE inv_id = $2`,
      [userId, invId]
    );

    for (let i = 0; i < invAudCnt; i++) {
      await client.query(
        `INSERT INTO reg_invoice_audit (inva_inv_id, created_by, created_date)
         VALUES ($1, $2, current_timestamp)`,
        [invId, userId]
      );
    }

    await client.query("COMMIT");
    return NextResponse.json({ tran_id: tranCRId }, { status: 201 });
  } catch (err: any) {
    await client.query("ROLLBACK").catch(() => {});
    console.error("Payment QPay error:", err);

    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  } finally {
    client.release();
  }
});
