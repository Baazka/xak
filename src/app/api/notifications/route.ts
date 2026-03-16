// src/app/api/notifications/route.ts
import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { withAuth } from "@/lib/withAuth";
import type { JwtPayload } from "@/lib/jwtPayload";

export const GET = withAuth(async (req: NextRequest, user: JwtPayload) => {
  try {
    const userId = Number((user as any)?.user?.id ?? (user as any)?.sub ?? (user as any)?.id ?? 0);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, Number(searchParams.get("page") ?? 1));
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? 20)));
    const offset = (page - 1) * limit;
    const unreadOnly = searchParams.get("unreadOnly") === "1";

    const orgRes = await db.query(`SELECT user_org_id FROM reg_users_new WHERE user_id = $1`, [
      userId,
    ]);
    const orgId = orgRes.rows?.[0]?.user_org_id ?? null;

    // JWT дээр roles нь role_code list байна гэж үзээд ref_user_role-оос role_id авна
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

    //  Notification list
    const list = await db.query(
      `
    SELECT
      n.id,
      n.noti_date AS date,
      n.noti_title AS title,
      n.noti_content AS content,
      tu.is_read
    FROM sys_noti_target  t
    JOIN sys_notification n ON n.id = t.target_noti_id
    JOIN sys_noti_target_user tu ON tu.target_id = t.target_id
    WHERE
      (
        tu.user_id = $1
        OR (t.target_org_id = $2)
        OR (t.target_role_id = ANY($3::int[]))
      )
      AND ($4::boolean = false OR tu.is_read = 0)
    ORDER BY n.noti_date DESC
    LIMIT $5 OFFSET $6
    `,
      [userId, orgIdSafe, roleIdsSafe, unreadOnly, limit, offset]
    );

    //  Unread count
    const unread = await db.query(
      `
    SELECT COUNT(*)::int AS unread_count
    FROM sys_noti_target  t
    JOIN sys_noti_target_user tu ON tu.target_id = t.target_id
    WHERE
      (
        tu.user_id = $1
        OR (t.target_org_id = $2)
        OR (t.target_role_id = ANY($3::int[]))
      )
      AND tu.is_read = 0
    `,
      [userId, orgIdSafe, roleIdsSafe]
    );

    return NextResponse.json({
      data: list.rows,
      page,
      limit,
      unreadCount: unread.rows?.[0]?.unread_count ?? 0,
    });
  } catch (error) {
    console.error("GET /api/notifications error:", error);
    return NextResponse.json({ error: "Failed to load notifications" }, { status: 500 });
  }
});
