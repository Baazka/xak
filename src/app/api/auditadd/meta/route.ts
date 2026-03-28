// src/app/api/auditadd/meta/route.ts

import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { withAuth } from "@/lib/withAuth";
import { requirePermission } from "@/lib/requirePermission";
import { JwtPayload } from "@/lib/jwtPayload";

export async function GET(req: NextRequest, user: JwtPayload) {
  const compSql = `SELECT comp_id, comp_reg_no, comp_legal_name FROM reg_company`;

  let whereClause = "WHERE 1=1";
  if (user.user_level_id > 2) {
    whereClause += ` AND USER_ORG_ID = ${user.org_id} `;
  }

  const userSql = `SELECT user_id, user_firstname, user_phone, user_email FROM reg_users_new ${whereClause}`;

  try {
    const [companyRes, userRes] = await Promise.all([db.query(compSql), db.query(userSql)]);

    return NextResponse.json({
      company: companyRes.rows,
      users: userRes.rows,
    });
  } catch (error) {
    console.error("GET /api/auditadd/meta error:", error);
    return NextResponse.json({ error: "Failed to load notification metadata" }, { status: 500 });
  }
}
