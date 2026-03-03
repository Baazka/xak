import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { withAuth } from "@/lib/withAuth";
import type { JwtPayload } from "@/lib/jwtPayload";

type CreateBody = {
  noti_type_id?: number; // optional
  title: string;
  content: string;

  // targets
  userIds?: number[];
  orgIds?: number[];
  roleIds?: number[];

  // optional audit
  createdBy?: number; // default: current user
};

function isAdmin(user: JwtPayload) {
  // ✅ танай JWT payload дээр roles нь role_code[] гэж үзээд шалгалаа
  const roles: string[] = Array.isArray((user as any)?.roles) ? (user as any).roles : [];
  const permissions: string[] = Array.isArray((user as any)?.permissions)
    ? (user as any).permissions
    : [];

  // Аль нэгээр нь хамгаал
  return roles.includes("ADMIN") || permissions.includes("NOTIFICATION_CREATE");
}

export const POST = withAuth(async (req: NextRequest, user: JwtPayload) => {
  if (!isAdmin(user)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = (await req.json().catch(() => null)) as CreateBody | null;
  const title = String(body?.title ?? "").trim();
  const content = String(body?.content ?? "").trim();
  const notiTypeId = body?.noti_type_id ?? null;

  const userIds = Array.isArray(body?.userIds) ? body!.userIds!.map(Number).filter(Boolean) : [];
  const orgIds = Array.isArray(body?.orgIds) ? body!.orgIds!.map(Number).filter(Boolean) : [];
  const roleIds = Array.isArray(body?.roleIds) ? body!.roleIds!.map(Number).filter(Boolean) : [];

  if (!title || !content) {
    return NextResponse.json({ error: "title/content required" }, { status: 400 });
  }
  if (userIds.length + orgIds.length + roleIds.length === 0) {
    return NextResponse.json({ error: "At least 1 target required" }, { status: 400 });
  }

  const createdBy =
    Number((user as any)?.user?.id ?? (user as any)?.sub ?? (user as any)?.id ?? 0) || null;

  // ✅ Transaction
  const client = db; // таны db wrapper pool байвал BEGIN/COMMIT ажиллана
  try {
    await client.query("BEGIN");

    // 1) master notification
    const insNoti = await client.query(
      `
      INSERT INTO public.sys_notification
        (noti_date, noti_type_id, noti_title, noti_content, created_by, created_date)
      VALUES
        (CURRENT_TIMESTAMP, $1, $2, $3, $4, CURRENT_TIMESTAMP)
      RETURNING id
      `,
      [notiTypeId, title, content, createdBy]
    );

    const notiId = Number(insNoti.rows[0]?.id);

    // 2) targets insert
    // таны ref: SYS_TARGET_TYPE -> TYPE_CODE (USER/ORG/ROLE)
    // энд type_id-уудыг DB-ээс авч map хийнэ (нэг удаа)
    const tt = await client.query(
      `
      SELECT type_id, type_code
      FROM public.sys_target_type
      WHERE type_code IN ('USER','ORG','ROLE')
      `
    );

    const typeIdByCode: Record<string, number> = {};
    for (const r of tt.rows) typeIdByCode[String(r.type_code)] = Number(r.type_id);

    const userTypeId = typeIdByCode["USER"];
    const orgTypeId = typeIdByCode["ORG"];
    const roleTypeId = typeIdByCode["ROLE"];

    if (!userTypeId || !orgTypeId || !roleTypeId) {
      throw new Error("sys_target_type missing USER/ORG/ROLE");
    }

    // helper bulk insert
    const insertRows: Array<{
      target_type_id: number;
      target_user_id: number | null;
      target_org_id: number | null;
      target_role_id: number | null;
    }> = [];

    for (const id of userIds)
      insertRows.push({
        target_type_id: userTypeId,
        target_user_id: id,
        target_org_id: null,
        target_role_id: null,
      });

    for (const id of orgIds)
      insertRows.push({
        target_type_id: orgTypeId,
        target_user_id: null,
        target_org_id: id,
        target_role_id: null,
      });

    for (const id of roleIds)
      insertRows.push({
        target_type_id: roleTypeId,
        target_user_id: null,
        target_org_id: null,
        target_role_id: id,
      });

    // Bulk VALUES
    const values: any[] = [];
    const placeholders: string[] = [];

    // columns:
    // target_noti_id, target_type_id, target_user_id, target_org_id, target_role_id,
    // target_is_read, created_by, created_date
    insertRows.forEach((row, i) => {
      const base = i * 8;
      placeholders.push(
        `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5}, $${base + 6}, $${base + 7}, $${base + 8})`
      );
      values.push(
        notiId,
        row.target_type_id,
        row.target_user_id,
        row.target_org_id,
        row.target_role_id,
        0, // unread
        createdBy,
        new Date()
      );
    });

    await client.query(
      `
      INSERT INTO public.sys_noti_target
        (target_noti_id, target_type_id, target_user_id, target_org_id, target_role_id,
         target_is_read, created_by, created_date)
      VALUES
        ${placeholders.join(",")}
      `,
      values
    );

    await client.query("COMMIT");

    return NextResponse.json({ success: true, id: notiId });
  } catch (e: any) {
    await db.query("ROLLBACK").catch(() => null);
    return NextResponse.json({ error: e?.message ?? "Server error" }, { status: 500 });
  }
});

//    // Хэдхэн хэрэглэгчид илгээх
// {
//   "noti_type_id": 1,
//   "title": "Invoice батлагдлаа",
//   "content": "INV-00021 батлагдлаа.",
//   "userIds": [12, 15, 18]
// }
//    // Байгууллага руу
// {
//   "title": "Системийн мэдэгдэл",
//   "content": "Өнөөдөр 19:00 цагт шинэчлэлт хийнэ.",
//   "orgIds": [3]
// }
//    // Рол руу
// {
//   "title": "Админ сануулга",
//   "content": "Тайлангийн хугацаа дуусах гэж байна.",
//   "roleIds": [1, 2]
// }
