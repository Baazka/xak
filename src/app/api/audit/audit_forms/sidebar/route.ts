import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { withAuth } from "@/lib/withAuth";
import { requirePermission } from "@/lib/requirePermission";
import { JwtPayload } from "@/lib/jwtPayload";

export const GET = withAuth(async (req: NextRequest, user: JwtPayload) => {
  //requirePermission(user.permissions, ["user.read"]);

  const sp = new URL(req.url).searchParams;
  const auditId = sp.get("aud_id");
  const userId = user.id;

  if (!auditId) {
    return NextResponse.json({ error: "Audit ID is required" }, { status: 400 });
  }

  const client = await db.connect();

  try {
    const sidebarDataRes = await client.query(
      `
      select 
        af.form_id,
        af.form_stage,
        af.form_name,
        af.form_code,
        f.form_aud_id,
        f.form_status_id,
        s.status_code from_status_code,
        s.status_label form_status_name,
        (select count(c.comment_id) from audit_form_comments c where c.comment_form_id = f.form_id and c.is_active = 1) cmt_count
        from ref_audit_form af
        left join (select f.form_id, f.form_aud_id, f.form_list_id, f.form_status_id from audit_forms f
        left join audit_team t on f.form_aud_id = t.team_aud_id and t.team_role_id = 5 and t.is_active = 1
        where form_aud_id = $1 and (form_list_id != 1 or (form_list_id = 1 and f.form_team_user_id = t.team_user_id))) f on af.form_id = f.form_list_id
        left join ref_form_status s on f.form_status_id = s.status_id
        where af.is_active = 1 order by af.form_code asc
      `,
      [auditId]
    );

    if (!sidebarDataRes.rows[0]) {
      return NextResponse.json({ error: "Sidebar data not found" }, { status: 404 });
    }

    return NextResponse.json({ sidebarData: sidebarDataRes.rows }, { status: 200 });
  } catch (err) {
    console.error("DB Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  } finally {
    client.release();
  }
});
