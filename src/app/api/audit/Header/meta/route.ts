import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { withAuth } from "@/lib/withAuth";
import { requirePermission } from "@/lib/requirePermission";
import { JwtPayload } from "@/lib/jwtPayload";

export const GET = withAuth(async (req: NextRequest, user: JwtPayload) => {
  //requirePermission(user.permissions, ["user.read"]);
  const sp = new URL(req.url).searchParams;
  const audId = sp.get("aud_id");
  if (!audId) {
    return NextResponse.json({ error: "Audit ID is required" }, { status: 400 });
  }
  const client = await db.connect();

  try {
    const [audOrgResult, audTeamResult] = await Promise.all([
      client.query(
        `
        select 
        a.aud_id,
        a.aud_code,
        a.aud_name,
        a.aud_year,
        to_char(a.aud_begin_date,'YYYY.MM.DD') aud_begin_date,
        to_char(a.aud_end_date,'YYYY.MM.DD') aud_end_date,
        a.aud_status_id,
        s.status_label aud_status_name,
        s.status_code aud_status_code,
        ao.org_regno,
        ao.org_legal_name,
        ao.org_head_name,
        ao.org_head_phone,
        ao.org_head_email,
        ao.org_acc_name,
        ao.org_acc_phone,
        ao.org_acc_email
        from audit_data a
        join ref_audit_status s on a.aud_status_id = s.status_id
        join audit_organization ao on a.aud_id = ao.aud_id
        where a.aud_id = $1
      `,
        [audId]
      ),
      client.query(
        `select 
        a.aud_id,
        t.team_id,
        t.team_role_id,
        r.role_text,
        t.team_user_id,
        u.user_firstname,
        u.user_phone,
        u.user_email
        from audit_data a
        join audit_team t on a.aud_id = t.team_aud_id
        join reg_users_new u on t.team_user_id = u.user_id
        join ref_user_role r on t.team_role_id = r.role_id
        where a.aud_id = $1`,
        [audId]
      ),
    ]);

    return NextResponse.json(
      {
        audOrgResult: audOrgResult.rows[0],
        audTeamResult: audTeamResult.rows,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/audit/Header/meta error:", error);
    return NextResponse.json({ error: "Failed to load header metadata" }, { status: 500 });
  } finally {
    client.release();
  }
});
