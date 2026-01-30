// src/app/api/invoices/[id]/route.ts
import { NextResponse } from "next/server";
import db from "@/lib/db";

type Params = {
  params: {
    id: string;
  };
};

/* ======================================================
   GET /api/invoices/{id}
   ====================================================== */
export async function GET(req: Request, { params }: Params) {
  const { id } = params;

  try {
    // 1️⃣ Invoice header
    const invoiceRes = await db.query(
      `
      SELECT
        i.id,
        i.invoice_no,
        i.issue_date,
        i.due_date,
        i.subtotal,
        i.tax_amount,
        i.total_amount,
        i.currency,
        s.code AS status,
        x.name AS customer_name
      FROM invoices i
      JOIN ref_invoice_status s ON s.id = i.status_id
      JOIN xakorg x ON x.id = i.xakorg_id
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

    // 3️⃣ Payments
    const paymentsRes = await db.query(
      `
      SELECT
        p.id,
        p.amount,
        p.paid_at,
        m.code AS method,
        p.payment_ref
      FROM payments p
      JOIN ref_payment_method m ON m.id = p.method_id
      WHERE p.invoice_id = $1
        AND p.payment_status = 'PAID'
      ORDER BY p.paid_at
      `,
      [id]
    );

    // 4️⃣ Balance calculation
    const paidAmount = paymentsRes.rows.reduce((s: number, p: any) => s + Number(p.amount), 0);

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

/* ======================================================
   PUT /api/invoices/{id}
   (status update)
   ====================================================== */
export async function PUT(req: Request, { params }: Params) {
  const { id } = params;
  const body = await req.json();
  const { status } = body; // e.g. CANCELLED

  if (!status) {
    return NextResponse.json({ message: "Status is required" }, { status: 400 });
  }

  try {
    const res = await db.query(
      `
      UPDATE invoices
      SET status_id = (
        SELECT id FROM ref_invoice_status WHERE code = $1
      ),
      updated_at = NOW()
      WHERE id = $2
      RETURNING id
      `,
      [status, id]
    );

    if (res.rowCount === 0) {
      return NextResponse.json({ message: "Invoice not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Invoice status updated",
      status,
    });
  } catch (err: any) {
    console.error("❌ PUT /api/invoices/[id] error:", err);
    return NextResponse.json(
      { message: "Failed to update status", detail: err.message },
      { status: 500 }
    );
  }
}

/* ======================================================
   DELETE /api/invoices/{id}
   (soft cancel)
   ====================================================== */
export async function DELETE(req: Request, { params }: Params) {
  const { id } = params;

  try {
    const res = await db.query(
      `
      UPDATE invoices
      SET status_id = (
        SELECT id FROM ref_invoice_status WHERE code = 'CANCELLED'
      ),
      updated_at = NOW()
      WHERE id = $1
      RETURNING id
      `,
      [id]
    );

    if (res.rowCount === 0) {
      return NextResponse.json({ message: "Invoice not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Invoice cancelled",
    });
  } catch (err: any) {
    console.error("❌ DELETE /api/invoices/[id] error:", err);
    return NextResponse.json(
      { message: "Failed to cancel invoice", detail: err.message },
      { status: 500 }
    );
  }
}
