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
      SELECT user_id, user_register_no, user_firstname, user_phone, user_email
      FROM reg_users_new
      WHERE user_id = $1 AND user_status_id = 1
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
  const updatedUser = user.id;
  const { id } = await context.params;
  const { user_register_no, user_firstname, user_phone, user_email, role_id, is_role_change } =
    await req.json();

  const result = await db.query(
    `
      UPDATE reg_users_new
      SET user_register_no = $1,
          user_firstname = $2,
          user_phone = $3,
          user_email = $4,
          updated_by = $5,
          updated_date = current_timestamp
      WHERE user_id = $6 AND user_status_id in (0,1)
      RETURNING user_id
      `,
    [
      user_register_no,
      user_firstname,
      user_phone,
      String(user_email || "")
        .trim()
        .toLowerCase(),
      updatedUser,
      id,
    ]
  );

  if (result.rowCount === 0) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (is_role_change === 1) {
    const client = await db.connect();

    try {
      await client.query("BEGIN");

      const updateOld = await client.query(
        `UPDATE reg_user_roles_new SET
          is_active = 0,
          updated_by = $1,
          updated_date = current_timestamp
        WHERE user_id = $2 and is_active = 1`,
        [updatedUser, id]
      );

      const insertNew = await client.query(
        `
      INSERT INTO reg_user_roles_new (user_id, role_id, is_active, created_by, created_date)
      VALUES ($1, $2, 1, $3, current_timestamp)
      `,
        [id, role_id, updatedUser]
      );

      await client.query("COMMIT");
    } catch (err: any) {
      await client.query("ROLLBACK").catch(() => {});
      console.error("Update role error:", err);

      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    } finally {
      client.release();
    }
  }

  return NextResponse.json({ success: true });
});

/* DELETE → soft delete */
export const DELETE = withAuth<{ id: string }>(
  async (req: NextRequest, user: JwtPayload, context) => {
    //requirePermission(user.permissions, ["user.delete"]);
    const updatedUser = user.id;

    const { id } = await context.params;

    const result = await db.query(
      `
      UPDATE reg_users_new
      SET user_status_id = 2,
      updated_by = $1,
      updated_date = current_timestamp
      WHERE user_id = $2 AND user_status_id in (0,1)
      RETURNING user_id
      `,
      [updatedUser, id]
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  }
);
