import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { withAuth } from "@/lib/withAuth";
import type { JwtPayload } from "@/lib/jwtPayload";

type TargetTypeCode = "ALL" | "XAKADMIN" | "XAK" | "USER" | "ROLE";

type CreateBody = {
  noti_type_id?: number | null;
  title?: string;
  content?: string;
  target_type_code?: TargetTypeCode;
  userIds?: number[];
  roleIds?: number[];
  orgIds?: number[];
};

export const POST = withAuth(async (req: NextRequest, user: JwtPayload) => {
  const body = (await req.json().catch(() => null)) as CreateBody | null;

  const title = String(body?.title ?? "").trim();
  const content = String(body?.content ?? "").trim();
  const notiTypeId =
    body?.noti_type_id === null || body?.noti_type_id === undefined
      ? null
      : Number(body.noti_type_id);

  const targetTypeCode = String(body?.target_type_code ?? "")
    .trim()
    .toUpperCase() as TargetTypeCode;

  if (!title || !content || !targetTypeCode) {
    return NextResponse.json(
      { error: "title, content, target_type_code required" },
      { status: 400 }
    );
  }

  if (notiTypeId !== null && (!Number.isInteger(notiTypeId) || Number(notiTypeId) <= 0)) {
    return NextResponse.json({ error: "noti_type_id must be a positive integer" }, { status: 400 });
  }

  const createdBy =
    Number((user as any)?.user?.id ?? (user as any)?.sub ?? (user as any)?.id ?? 0) || null;

  const userIds = Array.isArray(body?.userIds)
    ? body!.userIds.map(Number).filter((x) => Number.isInteger(x) && x > 0)
    : [];

  const roleIds = Array.isArray(body?.roleIds)
    ? body!.roleIds.map(Number).filter((x) => Number.isInteger(x) && x > 0)
    : [];
  const orgIds = Array.isArray(body?.orgIds)
    ? body!.orgIds.map(Number).filter((x) => Number.isInteger(x) && x > 0)
    : [];

  if (targetTypeCode === "USER" && userIds.length === 0) {
    return NextResponse.json({ error: "userIds required for USER target" }, { status: 400 });
  }

  if (targetTypeCode === "ROLE" && roleIds.length === 0) {
    return NextResponse.json({ error: "roleIds required for ROLE target" }, { status: 400 });
  }

  const client = await db.connect();

  try {
    await client.query("BEGIN");

    // 1) target type resolve by CODE
    const targetTypeRes = await client.query(
      `
      SELECT type_id, type_code
      FROM public.sys_target_type
      WHERE UPPER(type_code) = $1
      LIMIT 1
      `,
      [targetTypeCode]
    );

    const targetType = targetTypeRes.rows[0];

    if (!targetType) {
      throw new Error(`Invalid target_type_code: ${targetTypeCode}`);
    }

    const targetTypeId = Number(targetType.type_id);

    // 2) master notification insert
    const insNoti = await client.query(
      `
      INSERT INTO public.sys_notification
        (
          noti_date,
          noti_type_id,
          noti_title,
          noti_content,
          noti_is_read,
          created_by,
          created_date
        )
      VALUES
        (
          CURRENT_TIMESTAMP,
          $1,
          $2,
          $3,
          0,
          $4,
          CURRENT_TIMESTAMP
        )
      RETURNING id
      `,
      [notiTypeId, title, content, createdBy]
    );

    const notiId = Number(insNoti.rows[0]?.id);

    let recipientUserIds: number[] = [];
    let recipientRoleMap = new Map<number, number | null>();

    if (targetTypeCode === "USER") {
      recipientUserIds = [...new Set(userIds)];
      for (const uid of recipientUserIds) {
        recipientRoleMap.set(uid, null);
      }
    } else if (targetTypeCode === "ROLE") {
      const roleUsers = await client.query(
        `
        SELECT DISTINCT ur.user_id, ur.role_id
        FROM reg_user_roles_new ur
        WHERE ur.is_active = 1 and ur.role_id = ANY($1::int[])
        `,
        [roleIds]
      );

      recipientUserIds = [];
      recipientRoleMap = new Map<number, number | null>();

      for (const row of roleUsers.rows) {
        const uid = Number(row.user_id);
        const rid = Number(row.role_id);

        if (Number.isInteger(uid) && uid > 0) {
          if (!recipientRoleMap.has(uid)) {
            recipientUserIds.push(uid);
            recipientRoleMap.set(uid, rid);
          }
        }
      }
    } else if (targetTypeCode === "ALL") {
      const allUsers = await client.query(
        `
        SELECT u.id AS user_id
        FROM reg_users_new u
        WHERE u.user_status_id = 1
        `
      );

      recipientUserIds = [
        ...new Set(
          allUsers.rows.map((r) => Number(r.user_id)).filter((x) => Number.isInteger(x) && x > 0)
        ),
      ];

      for (const uid of recipientUserIds) {
        recipientRoleMap.set(uid, null);
      }
    } else if (targetTypeCode === "XAKADMIN") {
      const admins = await client.query(
        `
        SELECT DISTINCT ur.user_id, ur.role_id
        FROM reg_user_roles_new ur
        JOIN ref_user_role rur ON rur.role_id = ur.role_id
        WHERE UPPER(rur.code) = 'XAKADMIN' and ur.is_active = 1
        `
      );

      recipientUserIds = [];
      recipientRoleMap = new Map<number, number | null>();

      for (const row of admins.rows) {
        const uid = Number(row.user_id);
        const rid = Number(row.role_id);

        if (Number.isInteger(uid) && uid > 0) {
          if (!recipientRoleMap.has(uid)) {
            recipientUserIds.push(uid);
            recipientRoleMap.set(uid, rid);
          }
        }
      }
    } else if (targetTypeCode === "XAK") {
      const xakUsers = await client.query(
        `
        SELECT DISTINCT u.id AS user_id
        FROM reg_users_new ur
        WHERE ur.org_id = ANY($1::int[]) and ur.user_status_id = 1
        `,
        [orgIds]
      );

      recipientUserIds = [
        ...new Set(
          xakUsers.rows.map((r) => Number(r.user_id)).filter((x) => Number.isInteger(x) && x > 0)
        ),
      ];

      for (const uid of recipientUserIds) {
        recipientRoleMap.set(uid, null);
      }
    } else {
      throw new Error(`Unsupported target type: ${targetTypeCode}`);
    }

    if (recipientUserIds.length === 0) {
      throw new Error("No recipients found for selected target type");
    }

    // 3) recipient rows insert
    const values: any[] = [];
    const placeholders: string[] = [];

    recipientUserIds.forEach((uid, i) => {
      const base = i * 8;
      placeholders.push(
        `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5}, $${base + 6}, $${base + 7}, $${base + 8})`
      );

      values.push(
        notiId, // target_noti_id
        targetTypeId, // target_type_id
        uid, // target_user_id
        1, // target_org_id
        1, //recipientRoleMap.get(uid) ?? null, // target_role_id
        0, // target_is_read
        createdBy,
        new Date()
      );
    });

    await client.query(
      `
      INSERT INTO public.sys_noti_target
      (
        target_noti_id,
        target_type_id,
        target_user_id,
        target_org_id,
        target_role_id,
        target_is_read,
        created_by,
        created_date
      )
      VALUES
      ${placeholders.join(",")}
      `,
      values
    );

    await client.query("COMMIT");

    return NextResponse.json({
      success: true,
      id: notiId,
      recipientCount: recipientUserIds.length,
    });
  } catch (e: any) {
    await client.query("ROLLBACK").catch(() => null);
    return NextResponse.json({ error: e?.message ?? "Server error" }, { status: 500 });
  } finally {
    client.release();
  }
});
