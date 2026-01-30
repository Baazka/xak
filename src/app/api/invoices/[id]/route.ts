import { NextResponse } from "next/server";
import db from "@/lib/db";

/* ======================================================
   GET /api/invoices/[id]
   ====================================================== */
export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;

  try {
    // 1️⃣ Invoice header
    const invoiceRes = await db.query(
      `
      SELECT
        i.id,
        i.invoice_no,
        i.issue_date,
        i.due_date,
        i.total_amount,
        i.currency,
        s.code AS status
      FROM invoices i
      JOIN ref_invoice_status s ON s.id = i.status_id
      WHERE i.id = $1
      `,
      [id]
    );

    if (invoiceRes.rowCount === 0) {
      return NextResponse.json({ message: "Invoice not found" }, { status: 404 });
    }

    const invoice = invoiceRes.rows[0];

    // 2️⃣ Items
    const itemsRes = await db.query(
      `
      SELECT
        id,
        description,
        quantity,
        unit_price,
        line_total
      FROM invoice_items
      WHERE invoice_id = $1
      ORDER BY id
      `,
      [id]
    );

    // 3️⃣ Payments (DB schema-тай таарсан)
    const paymentsRes = await db.query(
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
  ORDER BY p.payment_date
  `,
      [id]
    );

    // 4️⃣ Balance
    const paidAmount = paymentsRes.rows.reduce((sum: number, p: any) => sum + Number(p.amount), 0);

    const balance = Number(invoice.total_amount) - paidAmount;

    return NextResponse.json({
      invoice,
      items: itemsRes.rows,
      payments: paymentsRes.rows,
      summary: {
        paid_amount: paidAmount,
        balance,
      },
    });
  } catch (err: any) {
    console.error("❌ GET /api/invoices/[id] error:", err);

    return NextResponse.json(
      { message: "Failed to load invoice", detail: err.message },
      { status: 500 }
    );
  }
}
