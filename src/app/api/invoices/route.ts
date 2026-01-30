// app/api/invoices/route.ts
import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const rawSearch = searchParams.get("search");
    const search = rawSearch && rawSearch.trim() !== "" ? rawSearch : null;

    const status = searchParams.get("status") ?? "ALL";
    const page = Number(searchParams.get("page") ?? 1);
    const limit = Number(searchParams.get("limit") ?? 10);
    const offset = (page - 1) * limit;

    const result = await db.query(
      `
      WITH filtered AS (
        SELECT
          i.id,
          i.invoice_no,
          i.total_amount,
          i.due_date,
          i.created_at,
          s.code AS status
        FROM invoices i
        JOIN ref_invoice_status s ON s.id = i.status_id
        WHERE
          ($1::text IS NULL OR i.invoice_no ILIKE '%' || $1 || '%')
          AND ($2::text = 'ALL' OR s.code = $2)
      ),
      metrics AS (
        SELECT
          COUNT(*) AS total_count,
          COALESCE(SUM(
            CASE
              WHEN status != 'PAID'
               AND due_date < CURRENT_DATE
              THEN total_amount
            END
          ), 0) AS overdue_amount,
          COALESCE(SUM(
            CASE
              WHEN status != 'PAID'
               AND due_date BETWEEN CURRENT_DATE
                   AND CURRENT_DATE + INTERVAL '30 days'
              THEN total_amount
            END
          ), 0) AS due_30_days
        FROM filtered
      )
      SELECT
        json_agg(
          json_build_object(
            'id', f.id,
            'invoice_no', f.invoice_no,
            'status', f.status,
            'total_amount', f.total_amount,
            'due_date', f.due_date,
            'created_at', f.created_at
          )
          ORDER BY f.created_at DESC
        ) AS invoices,
        (SELECT row_to_json(metrics) FROM metrics) AS metrics
      FROM (
        SELECT *
        FROM filtered
        ORDER BY created_at DESC
        LIMIT $3 OFFSET $4
      ) f;
      `,
      [search, status, limit, offset]
    );

    const row = result.rows[0];

    return NextResponse.json({
      data: row?.invoices ?? [],
      metrics: row?.metrics ?? {
        total_count: 0,
        overdue_amount: 0,
        due_30_days: 0,
      },
    });
  } catch (err: any) {
    console.error("❌ /api/invoices error:", err);

    return NextResponse.json(
      { message: "Invoice API error", detail: err.message },
      { status: 500 }
    );
  }
}
