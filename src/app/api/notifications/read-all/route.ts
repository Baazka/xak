import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { withAuth } from "@/lib/withAuth";
import type { JwtPayload } from "@/lib/jwtPayload";

export const POST = withAuth(async (req: NextRequest, user: JwtPayload) => {
  const userId = Number((user as any)?.user?.id ?? (user as any)?.sub ?? (user as any)?.id ?? 0);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // orgId
  const orgRes = await db.query(`SELECT user_org_id FROM reg_users_new WHERE user_id = $1`, [
    userId,
  ]);
  const orgId = orgRes.rows?.[0]?.user_org_id ?? -1;

  // role_code -> role_id
  const roleCodes: string[] = Array.isArray((user as any)?.roles) ? (user as any).roles : [];
  const roleIdsRes =
    roleCodes.length > 0
      ? await db.query(`SELECT role_id FROM ref_user_role WHERE role_code = ANY($1::text[])`, [
          roleCodes,
        ])
      : { rows: [] as any[] };
  const roleIds = roleIdsRes.rows.map((r: any) => Number(r.role_id)).filter(Boolean);
  const roleIdsSafe = roleIds.length ? roleIds : [-1];

  const upd = await db.query(
    `
    UPDATE public.sys_noti_target t
    SET target_is_read = 1
    WHERE t.target_is_read = 0
      AND (
        t.target_user_id = $1
        OR (t.target_org_id = $2)
        OR (t.target_role_id = ANY($3::int[]))
      )
    `,
    [userId, orgId, roleIdsSafe]
  );

  return NextResponse.json({ success: true, updated: upd.rowCount ?? 0 });
});
