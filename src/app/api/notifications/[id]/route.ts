import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { withAuth } from "@/lib/withAuth";

export const GET = withAuth(async (_req: NextRequest, user: any, ctx: any) => {
  const { id } = await ctx.params;
  const notificationId = Number(id);

  if (!Number.isInteger(notificationId) || notificationId <= 0) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const result = await db.query(
    `
      SELECT id, noti_title, noti_content, noti_date
      FROM sys_notification
      WHERE id = $1
      LIMIT 1
    `,
    [notificationId]
  );

  if (result.rows.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(result.rows[0]);
});
