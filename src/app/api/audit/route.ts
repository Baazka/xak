//src/app/api/xakorg/route.ts
import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { withAuth } from "@/lib/withAuth";
import { requirePermission } from "@/lib/requirePermission";
import { JwtPayload } from "@/lib/jwtPayload";
// import { buildWhereClause, safeParseFilters } from "./_where";

const SORTABLE_COLUMNS = new Set(["aud_id", "aud_code", "aud_year", "aud_name"]);

export const GET = withAuth(async function GET(req: NextRequest, user: JwtPayload) {
  try {
    // requirePermission(user.permissions, ["xakorg.read"]);

    const sp = new URL(req.url).searchParams;

    const page = Math.max(parseInt(sp.get("page") || "1"), 1);
    const limit = Math.max(parseInt(sp.get("limit") || "10"), 1);
    const search = sp.get("search") || "";
    // const filters = safeParseFilters(sp.get("filters"));

    // whereClause + params бэлэн болсон (search/filter бүгд эндээс гарна)
    // const { whereClause, params } = buildWhereClause(search, filters);

    let whereClause = "WHERE AUD_STATUS_ID IS NOT NULL";
    if (user.user_level_id > 2) {
      whereClause += ` AND AUD_ORG_ID = ${user.org_id} `;
    }

    const sortByRaw = sp.get("sortBy") || "AUD_ID";
    const sortBy = SORTABLE_COLUMNS.has(sortByRaw) ? sortByRaw : "aud_id";
    const sortOrder = (sp.get("sortOrder") || "asc").toLowerCase() === "desc" ? "DESC" : "ASC";

    const offset = (page - 1) * limit;

    const params: any[] = [];

    if (search) {
      params.push(`%${search}%`);
      if (user.user_level_id > 2) {
        whereClause += ` AND (aud_code ILIKE $${params.length} OR COMP_REG_NO ILIKE $${params.length} OR COMP_LEGAL_NAME ILIKE $${params.length} OR AUD_NAME ILIKE $${params.length})`;
      } else {
        whereClause += ` AND (aud_code ILIKE $${params.length} OR COMP_REG_NO ILIKE $${params.length} OR COMP_LEGAL_NAME ILIKE $${params.length} OR AUD_NAME ILIKE $${params.length}
                      OR org_register_no ILIKE $${params.length} OR org_legal_name ILIKE $${params.length})`;
      }
    }

    const dataSql = `
      SELECT 
        AUD_ID,
        AUD_ORG_ID,
        AO.ORG_REGISTER_NO,
        AO.ORG_LEGAL_NAME,
        AUD_COMP_ID,
        RC.COMP_REG_NO,
        RC.COMP_LEGAL_NAME,
        AUD_CODE,
        AUD_TYPE_ID,
        RAT.TYPE_NAME AUD_TYPE_NAME,
        AUD_YEAR,
        AUD_NAME,
        TO_CHAR(AUD_BEGIN_DATE,'YYYY.MM.DD') AUD_BEGIN_DATE,
        TO_CHAR(AUD_END_DATE,'YYYY.MM.DD') AUD_END_DATE,
        AUD_STATUS_ID,
        RAS.STATUS_LABEL AUD_STATUS_LABEL
        FROM AUDIT_DATA AD
        JOIN REG_AUD_ORG AO ON AD.AUD_ORG_ID = AO.ORG_ID
        JOIN REG_COMPANY RC ON AD.AUD_COMP_ID = RC.COMP_ID
        JOIN REF_AUDIT_TYPE RAT ON AD.AUD_TYPE_ID = RAT.TYPE_ID
        JOIN REF_AUDIT_STATUS RAS ON AD.AUD_STATUS_ID = RAS.STATUS_ID
      ${whereClause}
      ORDER BY ${sortBy} ${sortOrder}
      LIMIT $${params.length + 1}
      OFFSET $${params.length + 2}
    `;

    const countSql = `
      SELECT COUNT(*)::int AS total
      FROM AUDIT_DATA AD
    JOIN REG_AUD_ORG AO ON AD.AUD_ORG_ID = AO.ORG_ID
    JOIN REG_COMPANY RC ON AD.AUD_COMP_ID = RC.COMP_ID
    JOIN REF_AUDIT_TYPE RAT ON AD.AUD_TYPE_ID = RAT.TYPE_ID
    JOIN REF_AUDIT_STATUS RAS ON AD.AUD_STATUS_ID = RAS.STATUS_ID
      ${whereClause}
    `;

    const client = await db.connect();

    try {
      const [dataRes, countRes] = await Promise.all([
        client.query(dataSql, [...params, limit, offset]),
        client.query(countSql, params),
      ]);

      return NextResponse.json({
        data: dataRes.rows,
        total: countRes.rows[0].total,
        page,
        limit,
      });
    } finally {
      client.release();
    }
  } catch (err) {
    console.error("DB Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
});
// export const POST = withAuth(async function POST(req: NextRequest, user) {
//   //requirePermission(user.permissions, ["xakorg.create"]);

//   const body = await req.json();
//   const {
//     org_register_no,
//     org_legal_name,
//     org_phone,
//     org_email,
//     org_address,
//     org_head_name,
//     org_head_phone,
//     org_head_email,
//     user_id,
//   } = body;

//   // ---------- validation ----------
//   if (!org_legal_name || !org_register_no || !org_email) {
//     return NextResponse.json({ message: "Нэр болон регистр заавал" }, { status: 400 });
//   }

//   // ---------- uniqueness check ----------
//   const exists = await db.query(
//     "SELECT 1 FROM reg_aud_org WHERE org_register_no = $1 AND org_status = 'ACTIVE'",
//     [org_register_no]
//   );

//   if (exists.rows.length > 0) {
//     return NextResponse.json({ message: "ХАК бүртгэлтэй байна." }, { status: 409 });
//   }

//   // ---------- insert ----------
//   const result = await db.query(
//     `
//       INSERT INTO reg_aud_org
//         (ORG_REGISTER_NO, ORG_LEGAL_NAME, ORG_PHONE, ORG_EMAIL, ORG_ADDRESS, ORG_HEAD_NAME, ORG_HEAD_PHONE, ORG_HEAD_EMAIL, CREATED_BY, CREATED_DATE, ORG_STATUS)
//       VALUES
//         ($1, $2, $3, $4, $5, $6, $7, $8, $9, current_timestamp, 'ACTIVE')
//       RETURNING *
//       `,
//     [
//       org_register_no,
//       org_legal_name,
//       org_phone,
//       org_email,
//       org_address,
//       org_head_name,
//       org_head_phone,
//       org_head_email,
//       999,
//     ]
//   );

//   return NextResponse.json(result.rows[0], { status: 201 });
// });
