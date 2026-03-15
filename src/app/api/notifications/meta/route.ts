// src/app/api/notifications/meta/route.ts
import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET() {
  try {
    const [notiTypeResult, targetTypeResult, orgsRes, usersRes, rolesRes] = await Promise.all([
      db.query(`
        SELECT type_id, type_name, type_description
        FROM sys_noti_type
        ORDER BY type_id
      `),
      db.query(`
        SELECT type_id, type_name, type_code
        FROM sys_target_type
        ORDER BY type_id
      `),
      db.query(`
        SELECT org_id, org_register_no, org_legal_name
        FROM reg_aud_org
        WHERE ORG_STATUS = 'ACTIVE'
        ORDER BY org_legal_name
      `),
      db.query(`
        SELECT org_register_no, org_legal_name, u.user_id, u.user_firstname, u.user_phone, u.user_email
        FROM reg_users_new u
        JOIN reg_aud_org o ON u.user_org_id = o.org_id
        WHERE u.user_status_id = 1 and o.org_status = 'ACTIVE'
        ORDER BY u.user_id desc
      `),
      db.query(`
        SELECT role_id, role_label, role_code, role_text FROM ref_user_role
        WHERE role_level = 2
        ORDER BY role_id ASC 
      `),
    ]);

    return NextResponse.json({
      notificationTypes: notiTypeResult.rows,
      targetTypes: targetTypeResult.rows,
      orgs: orgsRes.rows,
      users: usersRes.rows,
      roles: rolesRes.rows,
    });
  } catch (error) {
    console.error("GET /api/notifications/meta error:", error);
    return NextResponse.json({ error: "Failed to load notification metadata" }, { status: 500 });
  }
}
