// src/app/api/invoices/[id]/payments/route.ts
import { NextResponse } from "next/server";
import db from "@/lib/db";

type Params = {
  params: {
    id: string; // invoice_id
  };
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
     AND p.payment_status = 'PAID'
    WHERE i.id = $1
    GROUP BY i.id, s.code
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
export async function GET(req: Request, { params }: Params) {
  const { id } = params;

  try {
    const result = await db.query(
      `
      SELECT
        p.id,
        p.amount,
        p.paid_at,
        p.payment_ref,
        m.code AS method
      FROM payments p
      JOIN ref_payment_method m ON m.id = p.method_id
      WHERE p.invoice_id = $1
        AND p.payment_status = 'PAID'
      ORDER BY p.paid_at DESC
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
}

/* ======================================================
   POST /api/invoices/{id}/payments
   ====================================================== */
// POST /api/invoices/[id]/payments
export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id: invoiceId } = await context.params;
  const client = await db.connect();

  try {
    const body = await req.json();
    const { amount, method_id, reference_no } = body;

    if (!amount || !method_id) {
      return NextResponse.json({ message: "Invalid payload" }, { status: 400 });
    }

    await client.query("BEGIN");

    // 1️⃣ Invoice total + paid
    const invRes = await client.query(
      `
      SELECT
        i.total_amount,
        COALESCE(SUM(p.amount), 0) AS paid_amount
      FROM invoices i
      LEFT JOIN payments p
        ON p.invoice_id = i.id
       AND p.status_id = (
         SELECT id FROM ref_payment_status WHERE code = 'PAID'
       )
      WHERE i.id = $1
      GROUP BY i.total_amount
      `,
      [invoiceId]
    );

    if (invRes.rowCount === 0) {
      throw new Error("INVOICE_NOT_FOUND");
    }

    const { total_amount, paid_amount } = invRes.rows[0];
    const balance = Number(total_amount) - Number(paid_amount);

    if (amount <= 0 || amount > balance) {
      throw new Error("INVALID_AMOUNT");
    }

    // 2️⃣ Insert payment (DB schema-д таарсан)
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
      [invoiceId, amount, reference_no ?? null, method_id]
    );

    // 3️⃣ Update invoice status
    const newStatus = amount === balance ? "PAID" : "PARTIAL";

    await client.query(
      `
      UPDATE invoices
      SET status_id = (
        SELECT id FROM ref_invoice_status WHERE code = $1
      )
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

    return NextResponse.json({ message: err.message }, { status: 500 });
  } finally {
    client.release();
  }
}
