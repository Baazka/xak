// src/app/api/payments/route.ts
import { NextResponse } from "next/server";
import db from "@/lib/db";

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
        JOIN ref_payment_method m ON m.id = p.method_id
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
