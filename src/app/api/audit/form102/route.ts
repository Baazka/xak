import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { withAuth } from "@/lib/withAuth";
import { requirePermission } from "@/lib/requirePermission";
import { JwtPayload } from "@/lib/jwtPayload";

export const GET = withAuth(async (req: NextRequest, user: JwtPayload) => {
  //requirePermission(user.permissions, ["user.read"]);

  const sp = new URL(req.url).searchParams;
  const audId = sp.get("aud_id");
  const userId = user.id;

  if (!audId) {
    return NextResponse.json({ error: "Audit ID is required" }, { status: 400 });
  }

  const client = await db.connect();
  try {
    await client.query("BEGIN");

    const formRes = await client.query(
      `SELECT form_id FROM audit_forms WHERE form_aud_id = $1 and form_list_id = 22 limit 1`,
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
        to_char(info_founded_date,'YYYY.MM.DD') info_founded_date,
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
