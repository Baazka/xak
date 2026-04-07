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
        aud_id, 
        org_regno,
        org_legal_name,
        org_founded_date,
        org_certno,
        org_main_operation,
        org_type,
        org_is_special,
        org_shareholder,
        org_founder,
        org_asset,
        org_address,
        org_phone,
        org_email,
        org_head_name,
        org_head_phone,
        org_head_email,
        org_acc_name,
        org_acc_phone,
        org_acc_email
        from audit_organization
        where aud_id = $1
    `,
      [audId]
    );

    return NextResponse.json(
      {
        data: dataRes.rows[0] || null,
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
  //requirePermission(user.permissions, ["user.create"]);

  const body = await req.json();
  const userId = user.id;
  // Check Insert or Update
  const audId = body.aud_id;

  console.log(body, "<======body");

  if (!audId) {
    return NextResponse.json({ error: "Мэдээлэл бүрэн оруулна уу" }, { status: 400 });
  }

  const client = await db.connect();
  try {
    await client.query("BEGIN");
    // UPDATE
    await client.query(
      `
        UPDATE audit_organization
        set org_regno = $1,
        org_legal_name = $2,
        org_founded_date = $3,
        org_certno = $4,
        org_main_operation = $5,
        org_type = $6,
        org_is_special = $7,
        org_shareholder = $8,
        org_founder = $9,
        org_asset = $10,
        org_address = $11,
        org_phone = $12,
        org_email = $13,
        org_head_name = $14,
        org_head_phone = $15,
        org_head_email = $16,
        org_acc_name = $17,
        org_acc_phone = $18,
        org_acc_email = $19,
        UPDATED_BY = $20,
        UPDATED_DATE = current_timestamp
        where AUD_id = $21`,
      [
        body.org_regno,
        body.org_legal_name,
        body.org_founded_date,
        body.org_certno,
        body.org_main_operation,
        body.org_type,
        body.org_is_special,
        body.org_shareholder,
        body.org_founder,
        body.org_asset,
        body.org_address,
        body.org_phone,
        body.org_email,
        body.org_head_name,
        body.org_head_phone,
        body.org_head_email,
        body.org_acc_name,
        body.org_acc_phone,
        body.org_acc_email,
        userId,
        audId,
      ]
    );

    await client.query("COMMIT");
    return NextResponse.json({ aud_id: audId }, { status: 201 });
  } catch (err: any) {
    await client.query("ROLLBACK").catch(() => {});
    console.error("Audit organization update error:", err);

    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  } finally {
    client.release();
  }
});
