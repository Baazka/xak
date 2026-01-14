import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { withAuth } from "@/lib/withAuth";
import { requirePermission } from "@/lib/requirePermission";
import { JwtPayload } from "@/lib/jwtPayload";

/* GET → edit */
export const GET = withAuth<{ id: string }>(async (req: NextRequest, user: JwtPayload, context) => {
  requirePermission(user.permissions, ["xakorg.read"]);

  const { id } = await context.params;

  const result = await db.query(
    "SELECT id, name, reg_no FROM reg_xakorg WHERE id = $1 AND status IS NULL",
    [id]
  );

  if (result.rowCount === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(result.rows[0]);
});

/* PUT → update */
export const PUT = withAuth<{ id: string }>(async (req: NextRequest, user: JwtPayload, context) => {
  requirePermission(user.permissions, ["xakorg.update"]);

  const { id } = await context.params;
  const { name, reg_no, email, phone, address } = await req.json();

  const result = await db.query(
    `
      UPDATE reg_xakorg
      SET name = $1,
          reg_no = $2,
          email = $3,
          phone = $4,
          address = $5
      WHERE id = $6 AND status IS NULL
      RETURNING id
      `,
    [name, reg_no, email, phone, address, id]
  );

  if (result.rowCount === 0) {
    return NextResponse.json({ error: "Xakorg not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
});

/* DELETE → soft delete */
export const DELETE = withAuth<{ id: string }>(
  async (req: NextRequest, user: JwtPayload, context) => {
    requirePermission(user.permissions, ["xakorg.delete"]);

    const { id } = await context.params;

    const result = await db.query(
      `
      UPDATE reg_xakorg
      SET status = 1
      WHERE id = $1 AND status IS NULL
      RETURNING id
      `,
      [id]
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ error: "Xakorg not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  }
);
