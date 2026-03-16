import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { withAuth } from "@/lib/withAuth";
import type { JwtPayload } from "@/lib/jwtPayload";

type TargetTypeCode = "ALL" | "XAK" | "USER" | "ROLE";

type CreateBody = {
  noti_type_id?: number | null;
  title?: string;
  content?: string;
  target_type_code?: TargetTypeCode | string;
  userIds?: number[];
  roleId?: number | null;
  orgIds?: number[];
};

function uniqPositiveInts(input: unknown): number[] {
  if (!Array.isArray(input)) return [];
  return [...new Set(input.map(Number).filter((x) => Number.isInteger(x) && x > 0))];
}

function getActorUserId(user: JwtPayload): number | null {
  const raw = (user as any)?.user?.id ?? (user as any)?.sub ?? (user as any)?.id ?? null;
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export const POST = withAuth(async (req: NextRequest, user: JwtPayload) => {
  const actorUserId = getActorUserId(user);

  if (!actorUserId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as CreateBody | null;
  console.log(body, "body");
  const title = String(body?.title ?? "").trim();
  const content = String(body?.content ?? "").trim();
  const targetTypeCode = String(body?.target_type_code ?? "")
    .trim()
    .toUpperCase() as TargetTypeCode;

  const notiTypeId =
    body?.noti_type_id === null || body?.noti_type_id === undefined
      ? null
      : Number(body.noti_type_id);

  const userIds = uniqPositiveInts(body?.userIds);
  const roleId = body?.roleId === null || body?.roleId === undefined ? null : Number(body?.roleId);
  const orgIds = uniqPositiveInts(body?.orgIds);

  if (!title || !content || !targetTypeCode) {
    return NextResponse.json(
      { error: "title, content, target_type_code required" },
      { status: 400 }
    );
  }

  if (!["ALL", "XAK", "USER", "ROLE"].includes(targetTypeCode)) {
    return NextResponse.json({ error: "Invalid target_type_code" }, { status: 400 });
  }

  if (notiTypeId !== null && (!Number.isInteger(notiTypeId) || notiTypeId <= 0)) {
    return NextResponse.json({ error: "noti_type_id must be a positive integer" }, { status: 400 });
  }

  if (targetTypeCode === "USER" && userIds.length === 0) {
    return NextResponse.json({ error: "userIds required for USER target" }, { status: 400 });
  }

  if (targetTypeCode === "ROLE" && roleId === null) {
    return NextResponse.json({ error: "roleId required for ROLE target" }, { status: 400 });
  }

  if (targetTypeCode === "XAK" && orgIds.length === 0) {
    return NextResponse.json({ error: "orgIds required for XAK target" }, { status: 400 });
  }

  const client = await db.connect();

  try {
    await client.query("BEGIN");

    const targetTypeRes = await client.query(
      `
      SELECT type_id, type_code
      FROM sys_target_type
      WHERE UPPER(type_code) = $1
      LIMIT 1
      `,
      [targetTypeCode]
    );

    const targetTypeRow = targetTypeRes.rows[0];
    if (!targetTypeRow) {
      throw new Error("Invalid target_type_code");
    }

    const targetTypeId = Number(targetTypeRow.type_id);

    const notiRes = await client.query(
      `
      INSERT INTO sys_notification
      (
        noti_date,
        noti_type_id,
        noti_title,
        noti_content,
        created_by,
        created_date
      )
      VALUES
      (
        CURRENT_TIMESTAMP,
        $1,
        $2,
        $3,
        $4,
        CURRENT_TIMESTAMP
      )
      RETURNING id
      `,
      [notiTypeId, title, content, actorUserId]
    );

    const notiId = Number(notiRes.rows[0]?.id);
    if (!notiId) {
      throw new Error("Failed to create notification");
    }

    const targets: Array<{
      orgId: number | null;
      roleId: number | null;
      recipientUserIds: number[];
    }> = [];

    if (targetTypeCode === "USER") {
      targets.push({
        orgId: null,
        roleId: null,
        recipientUserIds: userIds,
      });
    } else if (targetTypeCode === "ROLE") {
      const roleUsersRes = await client.query(
        `
    SELECT DISTINCT ur.role_id, ur.user_id
    FROM reg_user_roles_new ur
    JOIN reg_users_new u ON u.user_id = ur.user_id
    WHERE ur.is_active = 1
      AND u.user_status_id = 1
      AND ur.role_id = $1
    `,
        [roleId]
      );

      const recipientUserIds = [
        ...new Set(
          roleUsersRes.rows
            .map((r) => Number(r.user_id))
            .filter((x) => Number.isInteger(x) && x > 0)
        ),
      ];

      if (recipientUserIds.length > 0) {
        targets.push({
          orgId: null,
          roleId,
          recipientUserIds,
        });
      }
    } else if (targetTypeCode === "XAK") {
      const orgUsersRes = await client.query(
        `
        SELECT DISTINCT u.user_org_id, u.user_id
        FROM reg_users_new u
        JOIN reg_user_roles_new ur ON ur.user_id = u.user_id AND ur.is_active = 1
        WHERE u.user_status_id = 1
          AND u.user_org_id = ANY($1::int[])
        `,
        [orgIds]
      );

      const orgToUsers = new Map<number, number[]>();

      for (const row of orgUsersRes.rows) {
        const orgId = Number(row.user_org_id);
        const userId = Number(row.user_id);
        if (!Number.isInteger(orgId) || orgId <= 0) continue;
        if (!Number.isInteger(userId) || userId <= 0) continue;

        const arr = orgToUsers.get(orgId) ?? [];
        arr.push(userId);
        orgToUsers.set(orgId, arr);
      }

      for (const oid of orgIds) {
        const recipientUserIds = [...new Set(orgToUsers.get(oid) ?? [])];
        if (recipientUserIds.length > 0) {
          targets.push({
            orgId: oid,
            roleId: null,
            recipientUserIds,
          });
        }
      }
    } else if (targetTypeCode === "ALL") {
      const allUsersRes = await client.query(
        `
        SELECT u.user_id
        FROM reg_users_new u
        JOIN reg_user_roles_new ur ON ur.user_id = u.user_id AND ur.is_active = 1
        WHERE u.user_status_id = 1
        `
      );

      const recipientUserIds = [
        ...new Set(
          allUsersRes.rows.map((r) => Number(r.user_id)).filter((x) => Number.isInteger(x) && x > 0)
        ),
      ];

      if (recipientUserIds.length > 0) {
        targets.push({
          orgId: null,
          roleId: null,
          recipientUserIds,
        });
      }
    }

    if (targets.length === 0) {
      return NextResponse.json(
        { error: "No recipients found for selected target type" },
        { status: 400 }
      );
    }

    const insertedTargets: Array<{
      targetId: number;
      recipientUserIds: number[];
    }> = [];

    for (const target of targets) {
      const targetRes = await client.query(
        `
        INSERT INTO sys_noti_target
        (
          target_noti_id,
          target_type_id,
          target_org_id,
          target_role_id,
          created_by,
          created_date
        )
        VALUES
        (
          $1,
          $2,
          $3,
          $4,
          $5,
          CURRENT_TIMESTAMP
        )
        RETURNING target_id
        `,
        [notiId, targetTypeId, target.orgId, target.roleId, actorUserId]
      );

      const targetId = Number(targetRes.rows[0]?.target_id);
      if (!targetId) {
        throw new Error("Failed to create notification target");
      }

      insertedTargets.push({
        targetId,
        recipientUserIds: [...new Set(target.recipientUserIds)],
      });
    }

    const targetUserRows: Array<[number, number, number, number]> = [];

    for (const item of insertedTargets) {
      for (const uid of item.recipientUserIds) {
        targetUserRows.push([item.targetId, uid, 0, actorUserId]);
      }
    }

    if (targetUserRows.length === 0) {
      return NextResponse.json({ error: "No target-user rows generated" }, { status: 400 });
    }

    const tuValues: Array<number> = [];
    const tuPlaceholders: string[] = [];

    targetUserRows.forEach((row, index) => {
      const base = index * 4;
      tuPlaceholders.push(
        `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, CURRENT_TIMESTAMP)`
      );
      tuValues.push(row[0], row[1], row[2], row[3]);
    });

    await client.query(
      `
      INSERT INTO sys_noti_target_user
      (
        target_id,
        user_id,
        is_read,
        created_by,
        created_date
      )
      VALUES
      ${tuPlaceholders.join(",")}
      `,
      tuValues
    );

    await client.query("COMMIT");

    const recipientCount = new Set(targetUserRows.map((r) => r[1])).size;

    return NextResponse.json({
      success: true,
      id: notiId,
      targetTypeCode,
      recipientCount,
      targetCount: insertedTargets.length,
    });
  } catch (error: any) {
    await client.query("ROLLBACK").catch(() => null);
    console.error("POST /api/notifications/create error:", error);
    return NextResponse.json({ error: error?.message ?? "Server error" }, { status: 500 });
  } finally {
    client.release();
  }
});
