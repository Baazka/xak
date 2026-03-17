import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { withAuth } from "@/lib/withAuth";
import type { JwtPayload } from "@/lib/jwtPayload";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function getActorUserId(user: JwtPayload): number | null {
  const raw = (user as any)?.user?.id ?? (user as any)?.sub ?? (user as any)?.id ?? null;

  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export const DELETE = withAuth(
  async (_req: NextRequest, user: JwtPayload, context: RouteContext) => {
    try {
      const actorUserId = getActorUserId(user);
      const { id } = await context.params;

      const notiId = Number(id);

      if (!actorUserId || !Number.isInteger(notiId) || notiId <= 0) {
        return NextResponse.json({ error: "Invalid request" }, { status: 400 });
      }

      const upd = await db.query(
        `
        UPDATE sys_notification
        SET
          is_deleted = 1,
          deleted_by = $1,
          deleted_date = CURRENT_TIMESTAMP
        WHERE id = $2
          AND COALESCE(is_deleted,0) = 0
        RETURNING id
        `,
        [actorUserId, notiId]
      );

      if ((upd.rowCount ?? 0) === 0) {
        return NextResponse.json(
          { error: "Notification not found or already deleted" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        id: notiId,
      });
    } catch (error) {
      console.error("DELETE /api/admin/notifications/[id] error:", error);
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
  }
);
