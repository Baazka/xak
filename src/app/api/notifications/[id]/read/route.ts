// src/app/api/notifications/[id]/read/route.ts
import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { withAuth } from "@/lib/withAuth";
import type { JwtPayload } from "@/lib/jwtPayload";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function getUserId(user: JwtPayload): number | null {
  const raw = (user as any)?.user?.id ?? (user as any)?.sub ?? (user as any)?.id ?? null;

  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export const POST = withAuth(async (_req: NextRequest, user: JwtPayload, context: RouteContext) => {
  const { id } = await context.params;
  const notiId = Number(id);
  const userId = getUserId(user);

  if (!userId || !Number.isInteger(notiId) || notiId <= 0) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const upd = await db.query(
    `
      UPDATE sys_noti_target_user tu
      SET is_read = 1
      WHERE tu.user_id = $1
        AND COALESCE(tu.is_read, 0) <> 1
        AND tu.target_id IN (
          SELECT t.target_id
          FROM sys_noti_target t
          WHERE t.target_noti_id = $2
        )
      RETURNING tu.target_id, tu.user_id
      `,
    [userId, notiId]
  );

  return NextResponse.json({
    success: true,
    updated: upd.rowCount ?? 0,
  });
});
