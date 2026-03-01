// app/api/notifications/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import db from "@/lib/db"; // таны existing db client

// ✅ Та өөрийн auth-оос user info гаргаж авдаг функцээ энд тааруул.
// Доорх нь жишээ placeholder: cookie дотор user мэдээлэл байна гэж үзэв.
// Реал дээр jwtVerify(token) гэх мэтээр userId, orgId, roleIds гаргаарай.
type AuthUser = {
  id: number;
  orgId?: number | null;
  roleIds?: number[]; // role_id list
};

async function getAuthUser(): Promise<AuthUser> {
  // жишээ: cookie дээр user_id хадгалдаг гэж үзье
  const c = await cookies();
  const userId = Number(c.get("user_id")?.value || 0);
  const orgId = c.get("org_id") ? Number(c.get("org_id")!.value) : null;
  const roleIds = c.get("role_ids")?.value
    ? c
        .get("role_ids")!
        .value.split(",")
        .map((x) => Number(x.trim()))
        .filter(Boolean)
    : [];

  if (!userId) throw new Error("Unauthorized");
  return { id: userId, orgId, roleIds };
}

export async function GET(req: Request) {
  try {
    const user = await getAuthUser();

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, Number(searchParams.get("page") ?? 1));
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? 20)));
    const offset = (page - 1) * limit;

    const unreadOnly = searchParams.get("unreadOnly") === "1";

    // ✅ Target filter:
    // USER: target_user_id = user.id
    // ORG : target_org_id = user.orgId
    // ROLE: target_role_id IN (user.roleIds)
    //
    // Тайлбар: зарим нөхцөлд orgId null байж болно.
    const roleIds = user.roleIds?.length ? user.roleIds : [-1]; // empty үед IN () алдаа гаргахгүйн тулд
    const orgId = user.orgId ?? -1;

    // 1) List
    const listSql = `
      SELECT
        n.id,
        n.noti_date AS date,
        n.noti_title AS title,
        n.noti_content AS content,

        -- notification type (optional)
        nt.type_id AS noti_type_id,
        nt.type_name AS noti_type_name,

        -- recipient row (per-user/read)
        t.target_id,
        t.target_is_read AS is_read,
        st.type_code AS target_type_code

      FROM sys_not_target t
      JOIN sys_notification n ON n.id = t.target_noti_id
      LEFT JOIN sys_not_type nt ON nt.type_id = n.noti_type_id
      LEFT JOIN sys_target_type st ON st.type_id = t.target_type_id

      WHERE
        (
          t.target_user_id = $1
          OR (t.target_org_id = $2)
          OR (t.target_role_id = ANY($3::int[]))
        )
        AND ($4::boolean = false OR t.target_is_read = 0)

      ORDER BY n.noti_date DESC
      LIMIT $5 OFFSET $6
    `;

    const listParams = [user.id, orgId, roleIds, unreadOnly, limit, offset];
    const listRes = await db.query(listSql, listParams);

    // 2) Total
    const totalSql = `
      SELECT COUNT(*)::int AS total
      FROM sys_not_target t
      JOIN sys_notification n ON n.id = t.target_noti_id
      WHERE
        (
          t.target_user_id = $1
          OR (t.target_org_id = $2)
          OR (t.target_role_id = ANY($3::int[]))
        )
        AND ($4::boolean = false OR t.target_is_read = 0)
    `;
    const totalRes = await db.query(totalSql, [user.id, orgId, roleIds, unreadOnly]);
    const total = totalRes.rows?.[0]?.total ?? 0;

    // 3) Unread count (always)
    const unreadSql = `
      SELECT COUNT(*)::int AS unread_count
      FROM sys_not_target t
      WHERE
        (
          t.target_user_id = $1
          OR (t.target_org_id = $2)
          OR (t.target_role_id = ANY($3::int[]))
        )
        AND t.target_is_read = 0
    `;
    const unreadRes = await db.query(unreadSql, [user.id, orgId, roleIds]);
    const unreadCount = unreadRes.rows?.[0]?.unread_count ?? 0;

    return NextResponse.json({
      data: listRes.rows,
      page,
      limit,
      total,
      unreadCount,
    });
  } catch (err: any) {
    const msg = err?.message || "Server error";
    const status = msg === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ message: msg }, { status });
  }
}
