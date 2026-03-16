import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { withAuth } from "@/lib/withAuth";
import type { JwtPayload } from "@/lib/jwtPayload";

function getUserId(user: JwtPayload): number | null {
  const raw = (user as any)?.user?.id ?? (user as any)?.sub ?? (user as any)?.id ?? null;

  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export const POST = withAuth(async (_req: NextRequest, user: JwtPayload) => {
  const userId = getUserId(user);

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const upd = await db.query(
    `
    UPDATE public.sys_noti_target_user tu
    SET is_read = 1
    WHERE tu.user_id = $1
      AND COALESCE(tu.is_read, 0) = 0
      AND EXISTS (
        SELECT 1
        FROM public.sys_noti_target t
        WHERE t.target_id = tu.target_id
      )
    RETURNING tu.target_id
    `,
    [userId]
  );

  return NextResponse.json({
    success: true,
    updated: upd.rowCount ?? 0,
  });
});
