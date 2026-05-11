import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { withAuth } from "@/lib/withAuth";
import { requirePermission } from "@/lib/requirePermission";
import { JwtPayload } from "@/lib/jwtPayload";

/* GET → edit */
export const GET = withAuth<{ id: string }>(async (req: NextRequest, user: JwtPayload, context) => {
  const { id } = await context.params;

  const result = await db.query(
    `
      SELECT id, contract_name, contract_begin_date, contract_end_date, contract_file_id
      FROM reg_xakorg_contract
      WHERE id = $1 
      `,
    [id]
  );

  if (result.rows.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(result.rows[0]);
});

/* PUT → update */
export const PUT = withAuth<{ id: string }>(async (req: NextRequest, user: JwtPayload, context) => {
  //requirePermission(user.permissions, ["xakorg.update"]);

  const { id } = await context.params;
  const { contract_name, contract_begin_date, contract_end_date, contract_file_id, status } =
    await req.json();

  const result = await db.query(
    `
      UPDATE reg_xakorg_contract
      SET contract_name = $1,
          contract_begin_date = $2,
          contract_end_date = $3,
          contract_file_id = $4,
          status = $5
      WHERE contract_id = $6
      RETURNING contract_id
      `,
    [contract_name, contract_begin_date, contract_end_date, contract_file_id, status, id]
  );

  if (result.rowCount === 0) {
    return NextResponse.json({ error: "Contract not found" }, { status: 404 });
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
      UPDATE reg_xakorg_contract
      SET status = 1
      WHERE contract_id = $1 AND status IS NULL
      RETURNING contract_id
      `,
      [id]
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ error: "Contract not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  }
);
