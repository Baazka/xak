// src/app/api/audit/risk/meta/route.ts
import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET() {
  try {
    const [riskTypeResult, groupResult, subGroupResult, cdTypeResult] = await Promise.all([
      db.query(`
        SELECT type_id, type_label
        FROM ref_risk_type
        ORDER BY type_id
      `),
      db.query(`
        SELECT group_id, group_label
        FROM ref_risk_group
        ORDER BY group_id
      `),
      db.query(`
        SELECT sub_group_id, sub_group_label
        FROM ref_risk_sub_group
        ORDER BY sub_group_id
      `),
      db.query(`
        SELECT cd_type_id, cd_type_label
        FROM ref_risk_cd_type
        ORDER BY cd_type_id
      `),
    ]);

    return NextResponse.json({
      riskTypes: riskTypeResult.rows,
      groups: groupResult.rows,
      subGroups: subGroupResult.rows,
      cdTypes: cdTypeResult.rows,
    });
  } catch (error) {
    console.error("GET /api/audit/risk/meta error:", error);
    return NextResponse.json({ error: "Failed to load risk metadata" }, { status: 500 });
  }
}
