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
    const formRes = await client.query(
      `select form_id from audit_forms where form_aud_id = $1 and form_list_id = 22 limit 1`,
      [audId]
    );

    const formId = formRes.rows[0].form_id;

    const formDataRes = await client.query(
      `
      select 
        f.form_id,
        f.form_aud_id,
        f.form_list_id,
        af.form_code,
        af.form_name,
        f.form_status_id,
        s.status_label form_status_name,
        f.form_description,
        f.form_file_id
        from audit_forms f
        join ref_audit_form af on f.form_list_id = af.form_id
        join ref_form_status s on f.form_status_id = s.status_id
        where f.form_id = $1`,
      [formId]
    );

    if (!formDataRes.rows[0]) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    const dataRes = await client.query(
      `
      select 
        info_id,
        info_aud_id,
        info_form_id,
        info_reg_no,
        info_legal_name,
        info_founded_date,
        info_certno,
        info_type,
        info_main_operation,
        info_is_special,
        info_shareholder,
        info_founder,
        info_asset,
        info_address,
        info_phone,
        info_email,
        info_head_name,
        info_head_phone,
        info_head_email,
        info_acc_name,
        info_acc_phone,
        info_acc_email
        from audit_org_info
        where info_form_id = $1
    `,
      [formId]
    );

    return NextResponse.json(
      {
        data: dataRes.rows[0] || null,
        formData: formDataRes.rows[0],
        form_id: formId,
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
  const formId = body.form_id;
  const formStatusId = body.form_status_id;

  if (!audId || !formId) {
    return NextResponse.json({ error: "Мэдээлэл бүрэн оруулна уу" }, { status: 400 });
  }

  const client = await db.connect();
  try {
    await client.query("BEGIN");
    // UPDATE audit_forms
    await client.query(`UPDATE audit_forms SET form_status_id = $1 WHERE form_id = $2`, [
      formStatusId,
      formId,
    ]);
    // INSERT audit_form_actions
    await client.query(
      `INSERT INTO audit_form_actions (action_form_id, action_status_id, action_date, action_by) VALUES ($1, $2, current_timestamp, $3)`,
      [formId, formStatusId, userId]
    );
    // UPDATE audit_org_info
    await client.query(
      `
        UPDATE audit_org_info
        set info_reg_no = $1,
        info_legal_name = $2,
        info_founded_date = $3,
        info_certno = $4,
        info_main_operation = $5,
        info_type = $6,
        info_is_special = $7,
        info_shareholder = $8,
        info_founder = $9,
        info_asset = $10,
        info_address = $11,
        info_phone = $12,
        info_email = $13,
        info_head_name = $14,
        info_head_phone = $15,
        info_head_email = $16,
        info_acc_name = $17,
        info_acc_phone = $18,
        info_acc_email = $19
        where info_form_id = $20`,
      [
        body.info_reg_no,
        body.info_legal_name,
        body.info_founded_date,
        body.info_certno,
        body.info_main_operation,
        body.info_type,
        body.info_is_special,
        body.info_shareholder,
        body.info_founder,
        body.info_asset,
        body.info_address,
        body.info_phone,
        body.info_email,
        body.info_head_name,
        body.info_head_phone,
        body.info_head_email,
        body.info_acc_name,
        body.info_acc_phone,
        body.info_acc_email,
        formId,
      ]
    );

    await client.query("COMMIT");
    return NextResponse.json({ aud_id: audId }, { status: 201 });
  } catch (err: any) {
    await client.query("ROLLBACK").catch(() => {});
    console.error("Audit org info update error:", err);

    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  } finally {
    client.release();
  }
});
