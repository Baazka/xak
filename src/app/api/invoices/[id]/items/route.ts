// src/app/api/invoices/[id]/items/route.ts
import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { withAuth } from "@/lib/withAuth";
import type { JwtPayload } from "@/lib/jwtPayload";

type RouteParams = {
  id: string;
};

/* ======================================================
   GET /api/invoices/{id}/items
   ====================================================== */
export const GET = withAuth<RouteParams>(
  async (_req: NextRequest, _user: JwtPayload, context) => {
    const { id } = await context.params;

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
      console.error("GET invoice items error:", err);
      return NextResponse.json(
        { message: "Failed to load invoice items", detail: err.message },
        { status: 500 }
      );
    }
  }
);

/* ======================================================
   POST /api/invoices/{id}/items
   ====================================================== */
export const POST = withAuth<RouteParams>(
  async (req: NextRequest, _user: JwtPayload, context) => {
    const { id } = await context.params;
    const body = await req.json();

    const { description, quantity, unit_price } = body;

    if (!description || !quantity || !unit_price) {
      return NextResponse.json({ message: "Invalid payload" }, { status: 400 });
    }

    const client = await db.connect();
    try {
      await client.query("BEGIN");

      const lineTotal = Number(quantity) * Number(unit_price);

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

      console.error("POST invoice item error:", err);
      return NextResponse.json(
        { message: "Failed to add item", detail: err.message },
        { status: 500 }
      );
    } finally {
      client.release();
    }
  }
);

/* ======================================================
   DELETE /api/invoices/{id}/items?item_id=UUID
   ====================================================== */
export const DELETE = withAuth<RouteParams>(
  async (req: NextRequest, _user: JwtPayload, context) => {
    const { id } = await context.params;
    const { searchParams } = new URL(req.url);
    const itemId = searchParams.get("item_id");

    if (!itemId) {
      return NextResponse.json({ message: "item_id is required" }, { status: 400 });
    }

    const client = await db.connect();
    try {
      await client.query("BEGIN");

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

      console.error("DELETE invoice item error:", err);
      return NextResponse.json(
        { message: "Failed to delete item", detail: err.message },
        { status: 500 }
      );
    } finally {
      client.release();
    }
  }
);