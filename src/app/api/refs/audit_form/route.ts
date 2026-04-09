// src/app/api/refs/audit_form/route.ts
import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET() {
  try {
    const res = await db.query(
      `
        SELECT 
            form_id,
            form_name,
            form_stage,
            form_code
        FROM ref_audit_form
        WHERE is_active = 1
        ORDER BY form_id
      `
    );

    return NextResponse.json({
      data: res.rows,
    });
  } catch (err: any) {
    console.error("❌ GET ref_audit_form error:", err);
    return NextResponse.json(
      { message: "Failed to load audit forms", detail: err.message },
      { status: 500 }
    );
  }
}
