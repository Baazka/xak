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
    const dataRes = await client.query(
      `
      select 
        distinct aud_id,
        aud_code,
        aud_name,
        t.team_user_id,
        u.user_firstname,
        u.user_phone
        from audit_data ad
        join audit_team t on ad.aud_id = t.team_aud_id
        join reg_users_new u on t.team_user_id = u.user_id
        join ref_user_role ur on t.team_role_id = ur.role_id
        where t.is_active=  1 and aud_id = $1
    `,
      [audId]
    );

    return NextResponse.json(
      {
        data: dataRes.rows,
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
