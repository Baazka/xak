import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { withAuth } from "@/lib/withAuth";
import { requirePermission } from "@/lib/requirePermission";
import { JwtPayload } from "@/lib/jwtPayload";

export const GET = withAuth(async (req: NextRequest, user: JwtPayload) => {
  //requirePermission(user.permissions, ["user.read"]);

  const sp = new URL(req.url).searchParams;
  const formId = sp.get("form_id");
  const userId = user.id;
  if (!formId) {
    return NextResponse.json({ error: "Form ID are required" }, { status: 400 });
  }

  const client = await db.connect();

  try {
    const confirmRes = await client.query(
      `with actions as (
        (SELECT DISTINCT ON (action_form_id) *
        FROM audit_form_actions
        WHERE action_status_id in (1,2)
        ORDER BY action_form_id, action_status_id DESC, action_date DESC)
        union all
        (SELECT DISTINCT ON (action_form_id) *
        FROM audit_form_actions
        WHERE action_status_id in (3)
        ORDER BY action_form_id, action_status_id DESC, action_date DESC))
        select 
        a.action_id,
        a.action_form_id,
        a.action_status_id,
        s.status_label action_status_name,
        to_char(a.action_date,'YYYY.MM.DD HH24:MI:SS') action_date,
        a.action_by,
        u.user_firstname,
        u.user_phone,
        u.user_email
        from actions a
        join ref_form_status s on a.action_status_id = s.status_id
        join reg_users_new u on a.action_by = u.user_id
        where a.action_form_id = $1
        order by a.action_status_id`,
      [formId]
    );

    return NextResponse.json(
      {
        confirm: confirmRes.rows,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("DB Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  } finally {
    client.release();
  }
});
