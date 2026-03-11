import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { withAuth } from "@/lib/withAuth";
import { requirePermission } from "@/lib/requirePermission";
import { JwtPayload } from "@/lib/jwtPayload";

/* GET → edit */
export const GET = withAuth<{ id: string }>(async (req: NextRequest, user: JwtPayload, context) => {
  //requirePermission(user.permissions, ["xakorg.read"]);

  const { id } = await context.params;

  const result = await db.query(
    `
      SELECT ORG_ID, ORG_REGISTER_NO, ORG_LEGAL_NAME, ORG_PHONE, ORG_EMAIL, ORG_ADDRESS, ORG_HEAD_NAME, ORG_HEAD_PHONE, ORG_HEAD_EMAIL, ORG_STATUS, CREATED_BY, TO_CHAR(CREATED_DATE,'YYYY.MM.DD') AS CREATED_DATE
      FROM REG_AUD_ORG
      WHERE ORG_ID = $1
      `,
    [id]
  );

  if (result.rows.length === 0) {
    return NextResponse.json({ error: "Бичлэг олдсонгүй" }, { status: 404 });
  }

  return NextResponse.json(result.rows[0]);
});

/* PUT → update */
export const PUT = withAuth<{ id: string }>(async (req: NextRequest, user: JwtPayload, context) => {
  //requirePermission(user.permissions, ["xakorg.update"]);

  const { id } = await context.params;
  const {
    org_register_no,
    org_legal_name,
    org_phone,
    org_email,
    org_address,
    org_head_name,
    org_head_phone,
    org_head_email,
    user_id,
  } = await req.json();

  const result = await db.query(
    `
      UPDATE REG_AUD_ORG
      SET ORG_REGISTER_NO = $1,
          ORG_LEGAL_NAME = $2,
          ORG_PHONE = $3,
          ORG_EMAIL = $4,
          ORG_ADDRESS = $5,
          ORG_HEAD_NAME = $6,
          ORG_HEAD_PHONE = $7,
          ORG_HEAD_EMAIL = $8,
          UPDATED_BY = $9,
          UPDATED_DATE = CURRENT_TIMESTAMP
      WHERE org_id = $10
      RETURNING org_id
      `,
    [
      org_register_no,
      org_legal_name,
      org_phone,
      org_email,
      org_address,
      org_head_name,
      org_head_phone,
      org_head_email,
      user_id,
      id,
    ]
  );

  if (result.rowCount === 0) {
    return NextResponse.json({ error: "ХАК олдсонгүй" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
});

/* DELETE → soft delete */
export const DELETE = withAuth<{ id: string }>(
  async (req: NextRequest, user: JwtPayload, context) => {
    //requirePermission(user.permissions, ["xakorg.delete"]);

    const { id } = await context.params;

    const result = await db.query(
      `
      UPDATE REG_AUD_ORG
      SET ORG_STATUS = 'INACTIVE',
      updated_by = 999,
      updated_date = current_timestamp
      WHERE org_id = $1 AND ORG_STATUS = 'ACTIVE'
      RETURNING org_id
      `,
      [id]
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ error: "ХАК олдсонгүй" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  }
);
