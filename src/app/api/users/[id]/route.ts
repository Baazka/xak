// api/users/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { withAuth } from "@/lib/withAuth";
import { requirePermission } from "@/lib/requirePermission";
import { JwtPayload } from "@/lib/jwtPayload";

/* GET → edit */
export const GET = withAuth<{ id: string }>(async (req: NextRequest, user: JwtPayload, context) => {
  //requirePermission(user.permissions, ["user.read"]);

  const { id } = await context.params;

  const result = await db.query(
    `
      SELECT user_id, user_firstname, user_email
      FROM reg_users_new
      WHERE user_id = $1 AND user_status_id IS DISTINCT FROM 2
      `,
    [id]
  );

  if (result.rows.length === 0) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json(result.rows[0]);
});

/* PUT → update */
export const PUT = withAuth<{ id: string }>(async (req: NextRequest, user: JwtPayload, context) => {
  //requirePermission(user.permissions, ["user.update"]);

  const { id } = await context.params;
  const { user_firstname, user_email } = await req.json();

  const result = await db.query(
    `
      UPDATE reg_users_new
      SET user_firstname = $1,
          user_email = $2
      WHERE user_id = $3 AND user_status_id IS DISTINCT FROM 2
      RETURNING user_id
      `,
    [
      user_firstname,
      String(user_email || "")
        .trim()
        .toLowerCase(),
      id,
    ]
  );

  if (result.rowCount === 0) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
});

/* DELETE → soft delete */
export const DELETE = withAuth<{ id: string }>(
  async (req: NextRequest, user: JwtPayload, context) => {
    //requirePermission(user.permissions, ["user.delete"]);

    const { id } = await context.params;

    const result = await db.query(
      `
      UPDATE reg_users_new
      SET user_status_id = 2
      WHERE user_id = $1 AND user_status_id IS DISTINCT FROM 2
      RETURNING user_id
      `,
      [id]
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  }
);
