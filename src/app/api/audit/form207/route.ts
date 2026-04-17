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
      `SELECT form_id FROM audit_forms WHERE form_aud_id = $1 AND form_list_id = 11`,
      [audId]
    );
    if (!formRes.rows[0]) {
      const newFormRes = await client.query(
        `INSERT INTO audit_forms (form_aud_id, form_list_id, form_status_id) VALUES ($1, 11, 1) RETURNING form_id`,
        [audId]
      );
      const NewformId = newFormRes.rows[0].form_id;

      await client.query(
        `INSERT INTO audit_form_actions (action_form_id, action_status_id, action_date, action_by) VALUES ($1, 1, current_timestamp, $2)`,
        [NewformId, userId]
      );
    }
    const formResLast = await client.query(
      `SELECT form_id FROM audit_forms WHERE form_aud_id = $1 AND form_list_id = 11`,
      [audId]
    );
    const formId = formResLast.rows[0].form_id;

    await client.query(
      `INSERT INTO audit_risk_response(risk_id, resp_form_id) SELECT r.risk_id, $1 FROM audit_risks r WHERE r.risk_aud_id = $2 and NOT EXISTS (SELECT rr.risk_id FROM audit_risk_response rr WHERE rr.risk_id = r.risk_id)`,
      [formId, audId]
    );

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
        rr.risk_id,
        rr.resp_form_id,
        r.risk_type_id,
        t.type_label risk_type_name,
        r.risk_group_id,
        g.group_label risk_group_name,
        r.risk_sub_group_id,
        sg.sub_group_label risk_sub_group_name,
        r.risk_cd_type_id,
        cd.cd_type_label risk_cd_type_name,
        r.risk_content,
        rr.resp_main_type_id,
        rm.main_type_label resp_main_type_name,
        resp_rtype_id,
        resp_sub_rtype_id,
        resp_simple_type,
        resp_response,
        resp_standard_clause,
        resp_law_clause,
        ri.risk_is_important
        from audit_risk_response rr
        join audit_risks r on rr.risk_id = r.risk_id
        join ref_risk_type t on r.risk_type_id = t.type_id
        left join ref_risk_group g on r.risk_group_id = g.group_id
        left join ref_risk_sub_group sg on r.risk_sub_group_id = sg.sub_group_id
        left join ref_risk_cd_type cd on r.risk_cd_type_id = cd.cd_type_id
        left join ref_risk_response_main rm on rr.resp_main_type_id = rm.main_type_id
        join audit_risk_important ri on rr.risk_id = ri.risk_id
        where rr.resp_form_id = $1
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
  const audId = body.aud_id;
  const formId = body.form_id;
  const formStatusId = body.form_status_id;
  const formDescription = body.form_description;

  if (!audId || !formId || !formStatusId) {
    return NextResponse.json(
      { error: "Audit ID, Form ID and Form Status ID are required" },
      { status: 400 }
    );
  }

  const respData: {
    risk_id: number;
    resp_main_type_id: number;
    resp_rtype_id: number;
    resp_sub_rtype_id: number;
    resp_simple_type: string;
    resp_response: string;
    resp_standard_clause: string;
    resp_law_clause: string;
  }[] = body.respData;

  const client = await db.connect();

  try {
    const formRes = await client.query(
      `UPDATE audit_forms SET form_status_id = $1, form_description = $2 WHERE form_id = $3 RETURNING form_id`,
      [formStatusId, formDescription, formId]
    );
    await client.query(
      `INSERT INTO audit_form_actions (action_form_id, action_status_id, action_date, action_by) VALUES ($1, $2, current_timestamp, $3)`,
      [formId, formStatusId, userId]
    );

    for (const resp of respData) {
      const {
        risk_id,
        resp_main_type_id,
        resp_rtype_id,
        resp_sub_rtype_id,
        resp_simple_type,
        resp_response,
        resp_standard_clause,
        resp_law_clause,
      } = resp;
      await client.query(
        `UPDATE audit_risk_response SET 
            resp_main_type_id = $1, 
            resp_rtype_id = $2, 
            resp_sub_rtype_id = $3, 
            resp_simple_type = $4, 
            resp_response = $5, 
            resp_standard_clause = $6, 
            resp_law_clause = $7 
            WHERE risk_id = $8 AND resp_form_id = $9`,
        [
          resp_main_type_id,
          resp_rtype_id,
          resp_sub_rtype_id,
          resp_simple_type,
          resp_response,
          resp_standard_clause,
          resp_law_clause,
          risk_id,
          formId,
        ]
      );
    }

    return NextResponse.json({ message: "Audit Response updated successfully" }, { status: 201 });
  } catch (err: any) {
    await client.query("ROLLBACK").catch(() => {});
    console.error("Audit Response update error:", err);

    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  } finally {
    client.release();
  }
});
