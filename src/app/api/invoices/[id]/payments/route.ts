// src/app/api/invoices/[id]/payments/route.ts
import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { withAuth } from "@/lib/withAuth";
import type { JwtPayload } from "@/lib/jwtPayload";

type RouteParams = {
  id: string; // invoice_id
};

/* ======================================================
   Helper: invoice info + balance
   ====================================================== */
async function getInvoiceInfo(invoiceId: string) {
  const res = await db.query(
    `
    SELECT
      i.id,
      i.total_amount,
      s.code AS status,
      COALESCE(SUM(p.amount), 0) AS paid_amount
    FROM invoices i
    JOIN ref_invoice_status s ON s.id = i.status_id
    LEFT JOIN payments p
      ON p.invoice_id = i.id
     AND p.status_id = (
       SELECT id FROM ref_payment_status WHERE code = 'PAID'
     )
    WHERE i.id = $1
    GROUP BY i.id, i.total_amount, s.code
    `,
    [invoiceId]
  );

  if (res.rowCount === 0) {
    throw new Error("INVOICE_NOT_FOUND");
  }

  const row = res.rows[0];
  const balance = Number(row.total_amount) - Number(row.paid_amount);

  return {
    status: row.status,
    balance,
  };
}

/* ======================================================
   GET /api/invoices/{id}/payments
   ====================================================== */
export const GET = withAuth<RouteParams>(async (_req: NextRequest, _user: JwtPayload, context) => {
  const { id } = await context.params;

  try {
    const result = await db.query(
      `
        SELECT
          p.id,
          p.amount,
          p.payment_date,
          p.reference_no,
          m.code AS method
        FROM payments p
        JOIN ref_payment_method m ON m.id = p.method_id
        WHERE p.invoice_id = $1
          AND p.status_id = (
            SELECT id FROM ref_payment_status WHERE code = 'PAID'
          )
        ORDER BY p.payment_date DESC
        `,
      [id]
    );

    return NextResponse.json({
      data: result.rows,
    });
  } catch (err: any) {
    console.error("❌ GET payments error:", err);
    return NextResponse.json(
      { message: "Failed to load payments", detail: err.message },
      { status: 500 }
    );
  }
});

/* ======================================================
   POST /api/invoices/{id}/payments
   ====================================================== */
export const POST = withAuth<RouteParams>(async (req: NextRequest, _user: JwtPayload, context) => {
  const { id: invoiceId } = await context.params;
  const client = await db.connect();

  try {
    const body = await req.json();
    const amountNum = Number(body?.amount);
    const methodIdNum = Number(body?.method_id);
    const referenceNo = body?.reference_no ?? null;

    if (!amountNum || !methodIdNum) {
      return NextResponse.json({ message: "Invalid payload" }, { status: 400 });
    }

    await client.query("BEGIN");

    const info = await getInvoiceInfo(invoiceId);

    if (info.status === "PAID") {
      await client.query("ROLLBACK");
      return NextResponse.json({ message: "Cannot modify a PAID invoice" }, { status: 400 });
    }

    if (amountNum <= 0 || amountNum > info.balance) {
      await client.query("ROLLBACK");
      return NextResponse.json({ message: "INVALID_AMOUNT" }, { status: 400 });
    }

    await client.query(
      `
        INSERT INTO payments (
          invoice_id,
          amount,
          payment_date,
          reference_no,
          status_id,
          method_id
        )
        VALUES (
          $1,
          $2,
          NOW(),
          $3,
          (SELECT id FROM ref_payment_status WHERE code = 'PAID'),
          $4
        )
        `,
      [invoiceId, amountNum, referenceNo, methodIdNum]
    );

    const remainingBalance = info.balance - amountNum;
    const newStatus = remainingBalance === 0 ? "PAID" : "PARTIAL";

    await client.query(
      `
        UPDATE invoices
        SET
          status_id = (
            SELECT id
            FROM ref_invoice_status
            WHERE code = $1
          ),
          updated_at = NOW()
        WHERE id = $2
        `,
      [newStatus, invoiceId]
    );

    await client.query("COMMIT");

    return NextResponse.json({
      message: "Payment successful",
      status: newStatus,
    });
  } catch (err: any) {
    await client.query("ROLLBACK");
    console.error("❌ POST payment error:", err);

    if (err.message === "INVOICE_NOT_FOUND") {
      return NextResponse.json({ message: "Invoice not found" }, { status: 404 });
    }

    return NextResponse.json({ message: err.message || "Failed to save payment" }, { status: 500 });
  } finally {
    client.release();
  }
});
