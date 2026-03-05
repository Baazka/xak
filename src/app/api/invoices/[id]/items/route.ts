// src/app/api/invoices/[id]/items/route.ts
import { NextResponse } from "next/server";
import db from "@/lib/db";

type Params = {
  params: {
    id: string; // invoice_id
  };
};

/* ======================================================
   Helper: invoice editable эсэх
   ====================================================== */
// async function ensureInvoiceEditable(invoiceId: string) {
//   const res = await db.query(
//     `
//     SELECT s.code AS status
//     FROM invoices i
//     JOIN ref_invoice_status s ON s.id = i.status_id
//     WHERE i.id = $1
//     `,
//     [invoiceId]
//   );

//   if (res.rowCount === 0) {
//     throw new Error("INVOICE_NOT_FOUND");
//   }

//   if (res.rows[0].status === "PAID") {
//     throw new Error("INVOICE_PAID");
//   }
// }

/* ======================================================
   GET /api/invoices/{id}/items
   ====================================================== */
export async function GET(req: Request, { params }: Params) {
  const { id } = params;

  try {
    const result = await db.query(
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

    return NextResponse.json({
      data: result.rows,
    });
  } catch (err: any) {
    console.error("❌ GET invoice items error:", err);
    return NextResponse.json(
      { message: "Failed to load invoice items", detail: err.message },
      { status: 500 }
    );
  }
}

/* ======================================================
   POST /api/invoices/{id}/items
   ====================================================== */
export async function POST(req: Request, { params }: Params) {
  const { id } = params;
  const body = await req.json();

  const { description, quantity, unit_price } = body;

  if (!description || !quantity || !unit_price) {
    return NextResponse.json({ message: "Invalid payload" }, { status: 400 });
  }

  const client = await db.connect();
  try {
    await client.query("BEGIN");

    // 🔒 Validate invoice state
    //await ensureInvoiceEditable(id);

    const lineTotal = Number(quantity) * Number(unit_price);

    // 1️⃣ Insert item
    await client.query(
      `
      INSERT INTO invoice_items (
        invoice_id,
        description,
        quantity,
        unit_price,
        line_total
      )
      VALUES ($1, $2, $3, $4, $5)
      `,
      [id, description, quantity, unit_price, lineTotal]
    );

    // 2️⃣ Recalculate invoice totals
    await client.query(
      `
      UPDATE invoices
      SET
        subtotal = (
          SELECT COALESCE(SUM(line_total), 0)
          FROM invoice_items
          WHERE invoice_id = $1
        ),
        total_amount = (
          SELECT COALESCE(SUM(line_total), 0)
          FROM invoice_items
          WHERE invoice_id = $1
        ),
        updated_at = NOW()
      WHERE id = $1
      `,
      [id]
    );

    await client.query("COMMIT");

    return NextResponse.json({
      message: "Item added",
    });
  } catch (err: any) {
    await client.query("ROLLBACK");

    if (err.message === "INVOICE_NOT_FOUND") {
      return NextResponse.json({ message: "Invoice not found" }, { status: 404 });
    }

    if (err.message === "INVOICE_PAID") {
      return NextResponse.json({ message: "Cannot modify a PAID invoice" }, { status: 400 });
    }

    console.error("❌ POST invoice item error:", err);
    return NextResponse.json(
      { message: "Failed to add item", detail: err.message },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}

/* ======================================================
   DELETE /api/invoices/{id}/items?item_id=UUID
   ====================================================== */
export async function DELETE(req: Request, { params }: Params) {
  const { id } = params;
  const { searchParams } = new URL(req.url);
  const itemId = searchParams.get("item_id");

  if (!itemId) {
    return NextResponse.json({ message: "item_id is required" }, { status: 400 });
  }

  const client = await db.connect();
  try {
    await client.query("BEGIN");

    // 🔒 Validate invoice state
    //await ensureInvoiceEditable(id);

    const delRes = await client.query(
      `
      DELETE FROM invoice_items
      WHERE id = $1 AND invoice_id = $2
      `,
      [itemId, id]
    );

    if (delRes.rowCount === 0) {
      throw new Error("ITEM_NOT_FOUND");
    }

    // 🔄 Recalculate totals
    await client.query(
      `
      UPDATE invoices
      SET
        subtotal = (
          SELECT COALESCE(SUM(line_total), 0)
          FROM invoice_items
          WHERE invoice_id = $1
        ),
        total_amount = (
          SELECT COALESCE(SUM(line_total), 0)
          FROM invoice_items
          WHERE invoice_id = $1
        ),
        updated_at = NOW()
      WHERE id = $1
      `,
      [id]
    );

    await client.query("COMMIT");

    return NextResponse.json({
      message: "Item deleted",
    });
  } catch (err: any) {
    await client.query("ROLLBACK");

    if (err.message === "ITEM_NOT_FOUND") {
      return NextResponse.json({ message: "Item not found" }, { status: 404 });
    }

    if (err.message === "INVOICE_PAID") {
      return NextResponse.json({ message: "Cannot modify a PAID invoice" }, { status: 400 });
    }

    console.error("❌ DELETE invoice item error:", err);
    return NextResponse.json(
      { message: "Failed to delete item", detail: err.message },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
