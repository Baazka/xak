// api/invoices_new/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { withAuth } from "@/lib/withAuth";
import { requirePermission } from "@/lib/requirePermission";
import { JwtPayload } from "@/lib/jwtPayload";

/* PUT → update */
export const PUT = withAuth<{ id: string }>(async (req: NextRequest, user: JwtPayload, context) => {
  //requirePermission(user.permissions, ["user.update"]);
  const userId = user.id;
  const { id } = await context.params;
  const { inv_id, inv_org_id, inv_type_id, inv_aud_count, inv_aud_amount } = await req.json();

  const result = await db.query(
    `
      UPDATE reg_invoices
      SET inv_org_id = $1,
          inv_type_id = $2,
          inv_aud_count = $3,
          inv_amount = $4,
          updated_by=$5,
          updated_date = current_timestamp
      WHERE inv_id = $6
      RETURNING inv_id
      `,
    [inv_org_id, inv_type_id, inv_aud_count, inv_aud_amount, userId, inv_id]
  );

  if (result.rowCount === 0) {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
});

/* DELETE → soft delete */
export const DELETE = withAuth<{ id: string }>(
  async (req: NextRequest, user: JwtPayload, context) => {
    //requirePermission(user.permissions, ["user.delete"]);
    const userId = user.id;

    const { id } = await context.params;

    const result = await db.query(
      `
      UPDATE reg_invoices
      SET inv_status_id = 3,
      updated_by = $1,
      updated_date = current_timestamp
      WHERE inv_id = $2
      RETURNING inv_id
      `,
      [userId, id]
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  }
);
