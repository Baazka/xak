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
      FROM ref_notification_type
      WHERE is_active = true
      ORDER BY id
      `
    );

    return NextResponse.json({
      data: res.rows,
    });
  } catch (err: any) {
    console.error("❌ GET ref_notification_type error:", err);
    return NextResponse.json(
      { message: "Failed to load notification types", detail: err.message },
      { status: 500 }
    );
  }
}
