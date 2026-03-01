// src/app/api/notifications/[id]/read/route.ts
import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { withAuth } from "@/lib/withAuth";
import type { JwtPayload } from "@/lib/jwtPayload";

type Params = { id: string };

export const POST = withAuth<Params>(async (req: NextRequest, user: JwtPayload, context) => {
  const { id } = await context.params;
  const notiId = Number(id);

  const userId = Number((user as any)?.user?.id ?? (user as any)?.sub ?? (user as any)?.id ?? 0);
  if (!userId || !notiId) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  // orgId
  const orgRes = await db.query(`SELECT user_org_id FROM reg_users_new WHERE user_id = $1`, [
    userId,
  ]);
  const orgId = orgRes.rows?.[0]?.user_org_id ?? null;

  // role_code -> role_id
  const roleCodes: string[] = Array.isArray((user as any)?.roles)
    ? ((user as any).roles as string[])
    : [];

  const roleIdsRes =
    roleCodes.length > 0
      ? await db.query(`SELECT role_id FROM ref_user_role WHERE role_code = ANY($1::text[])`, [
          roleCodes,
        ])
      : { rows: [] as any[] };

  const roleIds = roleIdsRes.rows.map((r: any) => Number(r.role_id)).filter(Boolean);

  const orgIdSafe = orgId ?? -1;
  const roleIdsSafe = roleIds.length ? roleIds : [-1];

  //
  const upd = await db.query(
    `
    UPDATE sys_noti_target 
    SET target_is_read = 1
    WHERE target_noti_id = $1
      AND (
        target_user_id = $2
        OR target_org_id = $3
        OR target_role_id = ANY($4::int[])
      )
    RETURNING target_id
    `,
    [notiId, userId, orgIdSafe, roleIdsSafe]
  );

  return NextResponse.json({
    success: true,
    updated: upd.rowCount ?? 0,
  });
});
