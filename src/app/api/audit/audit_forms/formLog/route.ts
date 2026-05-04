import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { withAuth } from "@/lib/withAuth";
import { requirePermission } from "@/lib/requirePermission";
import { JwtPayload } from "@/lib/jwtPayload";

export const GET = withAuth(async (req: NextRequest, user: JwtPayload) => {
  //requirePermission(user.permissions, ["user.read"]);

  const userId = user.id;
  const sp = new URL(req.url).searchParams;
  const formId = sp.get("form_id");
  if (!formId) {
    return NextResponse.json({ error: "Form ID is required" }, { status: 400 });
  }

  const client = await db.connect();
  try {
    const dataRes = await client.query(
      `
      select 
        a.action_id,
        a.action_form_id,
        a.action_status_id,
        s.status_label action_status_name,
        to_char(a.action_date,'YYYY.MM.DD HH24:MI') action_date,
        a.action_by,
        u.user_level_id,
        ul.level_name user_level_name,
        u.user_firstname,
        u.user_phone,
        u.user_email,
        u.user_org_id,
        ao.org_register_no,
        ao.org_legal_name,
        ur.role_id,
        r.role_label,
        r.role_code,
        r.role_level,
        r.role_text
        from audit_form_actions a
        join ref_form_status s on a.action_status_id = s.status_id
        join reg_users_new u on a.action_by = u.user_id
        join ref_user_level ul on u.user_level_id = ul.level_id
        join reg_aud_org ao on u.user_org_id = ao.org_id
        join reg_user_roles_new ur on u.user_id = ur.user_id and ur.is_active = 1
        join ref_user_role r on ur.role_id = r.role_id
        where a.action_form_id = $1
        order by a.action_id asc
    `,
      [formId]
    );

    return NextResponse.json({ data: dataRes.rows }, { status: 200 });
  } catch (err) {
    console.error("DB Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  } finally {
    client.release();
  }
});
