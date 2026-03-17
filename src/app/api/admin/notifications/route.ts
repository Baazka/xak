import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { withAuth } from "@/lib/withAuth";
import { JwtPayload } from "@/lib/jwtPayload";
// import { requirePermission } from "@/lib/requirePermission";

const SORTABLE_COLUMNS = new Set([
  "id",
  "noti_date",
  "created_date",
  "noti_title",
  "target_type_code",
  "noti_type_name",
]);

export const GET = withAuth(async function GET(req: NextRequest, user: JwtPayload) {
  try {
    // requirePermission(user.permissions, ["notification.admin.read"]);

    const sp = new URL(req.url).searchParams;

    const page = Math.max(parseInt(sp.get("page") || "1", 10), 1);
    const limit = Math.max(parseInt(sp.get("limit") || "10", 10), 1);
    const search = (sp.get("search") || "").trim();
    const targetType = (sp.get("targetType") || "").trim().toUpperCase();
    const notiTypeId = sp.get("notiTypeId");
    const status = (sp.get("status") || "").trim().toLowerCase(); // active | deleted

    let whereClause = "WHERE 1=1";
    const params: any[] = [];

    // Хэрэв org-level admin бол өөрийн org-оор хязгаарлаж болно
    // if (user.user_level_id > 2) {
    //   params.push(Number(user.org_id));
    //   whereClause += `
    //     AND EXISTS (
    //       SELECT 1
    //       FROM sys_noti_target t2
    //       WHERE t2.target_noti_id = n.id
    //         AND t2.target_org_id = $${params.length}
    //     )
    //   `;
    // }

    // if (status === "deleted") {
    //   whereClause += " AND COALESCE(n.is_deleted, 0) = 1";
    // } else {
    //   whereClause += " AND COALESCE(n.is_deleted, 0) = 0";
    // }

    if (search) {
      params.push(`%${search}%`);
      whereClause += `
        AND (
          n.noti_title ILIKE $${params.length}
          OR n.noti_content ILIKE $${params.length}
          OR COALESCE(nt.type_name, '') ILIKE $${params.length}
          OR COALESCE(tt.type_code, '') ILIKE $${params.length}
        )
      `;
    }

    if (targetType) {
      params.push(targetType);
      whereClause += ` AND UPPER(tt.type_code) = $${params.length}`;
    }

    if (notiTypeId && Number.isInteger(Number(notiTypeId)) && Number(notiTypeId) > 0) {
      params.push(Number(notiTypeId));
      whereClause += ` AND n.noti_type_id = $${params.length}`;
    }

    const sortByRaw = (sp.get("sortBy") || "created_date").toLowerCase();
    const sortBy = SORTABLE_COLUMNS.has(sortByRaw) ? sortByRaw : "created_date";
    const sortOrder = (sp.get("sortOrder") || "desc").toLowerCase() === "asc" ? "ASC" : "DESC";

    const sortColumnMap: Record<string, string> = {
      id: "n.id",
      noti_date: "n.noti_date",
      created_date: "n.created_date",
      noti_title: "n.noti_title",
      target_type_code: "target_type_code",
      noti_type_name: "noti_type_name",
    };

    const orderByColumn = sortColumnMap[sortBy] ?? "n.created_date";
    const offset = (page - 1) * limit;

    const dataSql = `
      SELECT
        n.id,
        n.noti_date,
        n.noti_type_id,
        nt.type_name AS noti_type_name,
        n.noti_title,
        n.noti_content,
        n.created_by,
        n.created_date,
        --COALESCE(n.is_deleted, 0) AS is_deleted,
        --n.deleted_by,
        --n.deleted_date,

        creator.firstname || ' ' || creator.lastname AS created_by_name,

        MIN(tt.type_code) AS target_type_code,
        MIN(tt.type_name) AS target_type_name,

        COUNT(DISTINCT t.target_id)::int AS target_count,
        COUNT(DISTINCT tu.user_id)::int AS recipient_count
      FROM sys_notification n
      LEFT JOIN sys_noti_type nt
        ON nt.type_id = n.noti_type_id
      LEFT JOIN reg_users creator
        ON creator.id = n.created_by
      LEFT JOIN sys_noti_target t
        ON t.target_noti_id = n.id
      LEFT JOIN sys_target_type tt
        ON tt.type_id = t.target_type_id
      LEFT JOIN sys_noti_target_user tu
        ON tu.target_id = t.target_id
      ${whereClause}
      GROUP BY
        n.id,
        n.noti_date,
        n.noti_type_id,
        nt.type_name,
        n.noti_title,
        n.noti_content,
        n.created_by,
        n.created_date,
        --n.is_deleted,
        --n.deleted_by,
        --n.deleted_date,
        creator.firstname,
        creator.lastname
      ORDER BY ${orderByColumn} ${sortOrder}
      LIMIT $${params.length + 1}
      OFFSET $${params.length + 2}
    `;

    const countSql = `
      SELECT COUNT(*)::int AS total
      FROM (
        SELECT n.id
        FROM sys_notification n
        LEFT JOIN sys_noti_type nt
          ON nt.type_id = n.noti_type_id
        LEFT JOIN sys_noti_target t
          ON t.target_noti_id = n.id
        LEFT JOIN sys_target_type tt
          ON tt.type_id = t.target_type_id
        ${whereClause}
        GROUP BY n.id
      ) q
    `;

    const client = await db.connect();

    try {
      const [dataRes, countRes] = await Promise.all([
        client.query(dataSql, [...params, limit, offset]),
        client.query(countSql, params),
      ]);

      return NextResponse.json({
        data: dataRes.rows,
        total: countRes.rows[0]?.total ?? 0,
        page,
        limit,
      });
    } finally {
      client.release();
    }
  } catch (err) {
    console.error("GET /api/admin/notifications error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
});
