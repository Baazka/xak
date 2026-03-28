// src/app/api/notifications/meta/route.ts
import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET() {
  try {
    const [companyRes] = await Promise.all([
      db.query(`
        select comp_id, comp_reg_no, comp_legal_name from reg_company
      `),
    ]);

    return NextResponse.json({
      company: companyRes.rows,
    });
  } catch (error) {
    console.error("GET /api/auditadd/meta error:", error);
    return NextResponse.json({ error: "Failed to load notification metadata" }, { status: 500 });
  }
}
