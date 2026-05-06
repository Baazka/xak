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
    const formRes = await client.query(
      `SELECT form_id FROM audit_forms WHERE form_aud_id = $1 AND form_list_id = 15`,
      [audId]
    );
    if (!formRes.rows[0]) {
      const newFormRes = await client.query(
        `INSERT INTO audit_forms (form_aud_id, form_list_id, form_status_id) VALUES ($1, 15, 1) RETURNING form_id`,
        [audId]
      );
      const NewformId = newFormRes.rows[0].form_id;

      await client.query(
        `INSERT INTO audit_form_actions (action_form_id, action_status_id, action_date, action_by) VALUES ($1, 1, current_timestamp, $2)`,
        [NewformId, userId]
      );

      await client.query(
        `INSERT INTO audit_risk_important(risk_id, risk_form_id) SELECT risk_id, $1 FROM audit_risks WHERE risk_aud_id = $2`,
        [NewformId, audId]
      );
    }
    const formResLast = await client.query(
      `SELECT form_id FROM audit_forms WHERE form_aud_id = $1 AND form_list_id = 15`,
      [audId]
    );
    const formId = formResLast.rows[0].form_id;

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
        f.form_description
        from audit_forms f
        join ref_audit_form af on f.form_list_id = af.form_id
        join ref_form_status s on f.form_status_id = s.status_id
        where f.form_id = $1`,
      [formId]
    );

    if (!formRes.rows[0]) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    const dataRes = await client.query(
      `
      select 
        ri.risk_id,
        ri.risk_form_id,
        ri.risk_is_important,
        r.risk_source_id,
        rs.source_name risk_source_name,
        to_char(risk_date,'YYYY.MM.DD') risk_date,
        r.risk_status_id,
        s.status_label risk_status_name,
        r.risk_content,
        r.risk_type_id,
        t.type_label risk_type_name,
        r.risk_group_id,
        g.group_label risk_group_name,
        r.risk_sub_group_id,
        sg.sub_group_label risk_sub_group_name,
        risk_cd_type_id,
        cd.cd_type_label risk_cd_type_name
        from audit_risk_important ri
        join audit_risks r on ri.risk_id = r.risk_id
        join ref_risk_source rs on r.risk_source_id = rs.source_id
        join ref_risk_status s on r.risk_status_id = s.status_id
        join ref_risk_type t on r.risk_type_id = t.type_id
        left join ref_risk_group g on r.risk_group_id = g.group_id
        left join ref_risk_sub_group sg on r.risk_sub_group_id = sg.sub_group_id
        left join ref_risk_cd_type cd on r.risk_cd_type_id = cd.cd_type_id
        where ri.risk_form_id = $1
    `,
      [formId]
    );

    return NextResponse.json(
      {
        formData: formDataRes.rows[0],
        data: dataRes.rows,
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
  const formId = body.form_id;

  if (!formId) {
    return NextResponse.json({ error: "Form ID is required" }, { status: 400 });
  }

  const importantData: { riskId: number; riskIsImportant: number }[] = body.importantData;

  const client = await db.connect();

  try {
    for (const imp of importantData) {
      const { riskId, riskIsImportant } = imp;
      await client.query(
        `UPDATE audit_risk_important SET risk_is_important = $1 WHERE risk_id = $2 AND risk_form_id = $3`,
        [riskIsImportant, riskId, formId]
      );
    }

    return NextResponse.json({ message: "Risk Important updated successfully" }, { status: 201 });
  } catch (err: any) {
    await client.query("ROLLBACK").catch(() => {});
    console.error("Risk Important update error:", err);

    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  } finally {
    client.release();
  }
});
