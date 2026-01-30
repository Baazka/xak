// src/app/api/refs/invoice-status/route.ts
import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET() {
  try {
    const res = await db.query(
      `
      SELECT
        id,
        code,
        name
      FROM ref_invoice_status
      WHERE is_active = true
      ORDER BY sort_order, id
      `
    );

    return NextResponse.json({
      data: res.rows,
    });
  } catch (err: any) {
    console.error("❌ GET ref_invoice_status error:", err);
    return NextResponse.json(
      { message: "Failed to load invoice statuses", detail: err.message },
      { status: 500 }
    );
  }
}
