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
      `SELECT form_id FROM audit_forms WHERE form_aud_id = $1 AND form_list_id = 18`,
      [audId]
    );
    if (!formRes.rows[0]) {
      const newFormRes = await client.query(
        `INSERT INTO audit_forms (form_aud_id, form_list_id, form_status_id) VALUES ($1, 18, 1) RETURNING form_id`,
        [audId]
      );
      const NewformId = newFormRes.rows[0].form_id;

      await client.query(
        `INSERT INTO audit_form_actions (action_form_id, action_status_id, action_date, action_by) VALUES ($1, 1, current_timestamp, $2)`,
        [NewformId, userId]
      );
    }
    const formResLast = await client.query(
      `SELECT form_id FROM audit_forms WHERE form_aud_id = $1 AND form_list_id = 18`,
      [audId]
    );
    const formId = formResLast.rows[0].form_id;

    await client.query(
      `INSERT INTO audit_fault_correction(risk_id, fc_form_id) 
        SELECT r.risk_id, $1 FROM audit_risks r 
        JOIN audit_risk_important i ON r.risk_id = i.risk_id
        JOIN audit_risk_result rr ON r.risk_id = rr.risk_id
        JOIN audit_risk_fault rf ON r.risk_id = rf.risk_id
        WHERE r.risk_aud_id = $2 and rr.res_fault_level = 1 and rf.rf_is_correctable = 1 NOT EXISTS (SELECT fc.risk_id FROM audit_fault_correction fc WHERE fc.risk_id = r.risk_id)`,
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
        r.risk_id,
        fc.fc_form_id,
        r.risk_type_id,
        t.type_label risk_type_name,
        r.risk_group_id,
        g.group_label risk_group_name,
        r.risk_sub_group_id,
        sg.sub_group_label risk_sub_group_name,
        r.risk_cd_type_id,
        cd.cd_type_label risk_cd_type_name,
        r.risk_content,
        res.res_result,
        res.res_fault_level,
        rf.rf_effect,
        rf.rf_amount,
        rf.rf_type_id,
        rf.rf_is_material,
        rf.rf_correctable,
        rf.rf_standard_clause,
        rf.rf_law_clause,
        fc.fc_sub_type,
        fc.fc_report_id,
        rt.report_name fc_report_name,
        fc.fc_description_id,
        fd.description_name fc_description_name,
        fc.fc_result
        fc.fc_comment,
        ri.risk_is_important
        from audit_risks r
        join audit_risk_fault rf on r.risk_id = rf.risk_id
        join audit_risk_result res on r.risk_id = res.risk_id
        join audit_risk_important ri on rr.risk_id = ri.risk_id
        join audit_fault_correction fc on r.risk_id = fc.risk_id
        left join ref_fc_report rt on fc.fc_report_id = rt.report_id
        left join ref_fc_description fd on fc.fc_description_id = fd.description_id
        join ref_risk_type t on r.risk_type_id = t.type_id
        left join ref_risk_group g on r.risk_group_id = g.group_id
        left join ref_risk_sub_group sg on r.risk_sub_group_id = sg.sub_group_id
        left join ref_risk_cd_type cd on r.risk_cd_type_id = cd.cd_type_id
        where rf.rf_form_id = $1
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

  const correctionData: {
    risk_id: number;
    fc_sub_type: string;
    fc_report_id: number;
    fc_description_id: number;
    fc_result: string;
    fc_comment: string;
  }[] = body.correctionData;

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

    for (const correction of correctionData) {
      const { risk_id, fc_sub_type, fc_report_id, fc_description_id, fc_result, fc_comment } =
        correction;
      await client.query(
        `UPDATE audit_fault_correction SET 
            fc_sub_type = $1, 
            fc_report_id = $2, 
            fc_description_id = $3, 
            fc_result = $4, 
            fc_comment = $5 
            WHERE risk_id = $6 AND fc_form_id = $7`,
        [fc_sub_type, fc_report_id, fc_description_id, fc_result, fc_comment, risk_id, formId]
      );
    }

    return NextResponse.json(
      { message: "Audit Fault Correction updated successfully" },
      { status: 201 }
    );
  } catch (err: any) {
    await client.query("ROLLBACK").catch(() => {});
    console.error("Audit Fault Correction update error:", err);

    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  } finally {
    client.release();
  }
});
