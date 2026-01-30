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
export async function POST(req: Request, { params }: Params) {
  const { id } = params;
  const body = await req.json();

  const { amount, method_id, payment_ref } = body;

  if (!amount || !method_id) {
    return NextResponse.json({ message: "Invalid payload" }, { status: 400 });
  }

  const client = await db.connect();
  try {
    await client.query("BEGIN");

    // 🔒 Validate invoice + balance
    const { status, balance } = await getInvoiceInfo(id);

    if (status === "PAID") {
      throw new Error("INVOICE_ALREADY_PAID");
    }

    if (Number(amount) <= 0 || Number(amount) > balance) {
      throw new Error("INVALID_AMOUNT");
    }

    // 1️⃣ Insert payment
    await client.query(
      `
      INSERT INTO payments (
        invoice_id,
        amount,
        method_id,
        payment_ref,
        payment_status,
        paid_at
      )
      VALUES ($1, $2, $3, $4, 'PAID', NOW())
      `,
      [id, amount, method_id, payment_ref ?? null]
    );

    // 2️⃣ Update invoice status
    const newStatus = Number(amount) === balance ? "PAID" : "PARTIAL";

    await client.query(
      `
      UPDATE invoices
      SET status_id = (
        SELECT id FROM ref_invoice_status WHERE code = $1
      ),
      updated_at = NOW()
      WHERE id = $2
      `,
      [newStatus, id]
    );

    await client.query("COMMIT");

    return NextResponse.json({
      message: "Payment successful",
      status: newStatus,
    });
  } catch (err: any) {
    await client.query("ROLLBACK");

    if (err.message === "INVOICE_NOT_FOUND") {
      return NextResponse.json({ message: "Invoice not found" }, { status: 404 });
    }

    if (err.message === "INVOICE_ALREADY_PAID") {
      return NextResponse.json({ message: "Invoice already PAID" }, { status: 400 });
    }

    if (err.message === "INVALID_AMOUNT") {
      return NextResponse.json({ message: "Invalid payment amount" }, { status: 400 });
    }

    console.error("❌ POST payment error:", err);
    return NextResponse.json({ message: "Payment failed", detail: err.message }, { status: 500 });
  } finally {
    client.release();
  }
}
