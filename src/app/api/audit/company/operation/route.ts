import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { withAuth } from "@/lib/withAuth";
import { requirePermission } from "@/lib/requirePermission";
import { JwtPayload } from "@/lib/jwtPayload";

export const GET = withAuth(async (req: NextRequest, user: JwtPayload) => {
  //requirePermission(user.permissions, ["user.read"]);

  const sp = new URL(req.url).searchParams;
  const audId = sp.get("aud_id");
  if (!audId) {
    return NextResponse.json({ error: "Audit ID is required" }, { status: 400 });
  }

  const client = await db.connect();
  try {
    const dataRes = await client.query(
      `
      select 
        op_id,
        op_aud_id,
        op_code,
        op_name,
        to_char(op_date,'YYYY.MM.DD') op_date
        from audit_org_operation
        where op_aud_id = $1
    `,
      [audId]
    );

    return NextResponse.json(
      {
        data: dataRes.rows,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("DB Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  } finally {
    client.release();
  }
});

export const POST = withAuth(async (req: NextRequest, user: JwtPayload) => {
  //requirePermission(user.permissions, ["user.read"]);
  const body = await req.json();
  const audId = body.aud_id;
  const client = await db.connect();

  const opRawData: { op_id: number; op_code: string; op_name: string; op_date: Date }[] =
    body.operations; // expect array of {op_id, op_code, op_name, op_date }
  try {
    for (const opData of opRawData) {
      const { op_id, op_code, op_name, op_date } = opData;
      if (!op_id || op_id === null) {
        await client.query(
          `INSERT INTO audit_org_operation (op_aud_id, op_code, op_name, op_date)
            VALUES ($1, $2, $3, $4) RETURNING op_id`,
          [audId, op_code, op_name, op_date]
        );
      } else {
        await client.query(
          `UPDATE audit_org_operation SET op_code = $1, op_name = $2, op_date = $3 WHERE op_id = $4`,
          [op_code, op_name, op_date, op_id]
        );
      }
    }
    return NextResponse.json({ message: "Operations saved successfully" }, { status: 200 });
  } catch (err) {
    console.error("DB Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  } finally {
    client.release();
  }
});

export const DELETE = withAuth(async (req: NextRequest, user: JwtPayload) => {
  //requirePermission(user.permissions, ["user.create"]);

  const body = await req.json();
  const opId = body.op_id;
  const client = await db.connect();

  if (!opId) {
    return NextResponse.json({ error: "Operation ID is required" }, { status: 400 });
  }
  try {
    await client.query(`DELETE FROM audit_org_operation WHERE op_id = $1`, [opId]);
    return NextResponse.json({ message: "Operation deleted successfully" }, { status: 200 });
  } catch (err) {
    console.error("DB Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  } finally {
    client.release();
  }
});
