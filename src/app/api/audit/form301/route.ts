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
      `SELECT form_id FROM audit_forms WHERE form_aud_id = $1 AND form_list_id = 12`,
      [audId]
    );
    if (!formRes.rows[0]) {
      const newFormRes = await client.query(
        `INSERT INTO audit_forms (form_aud_id, form_list_id, form_status_id) VALUES ($1, 12, 1) RETURNING form_id`,
        [audId]
      );
      const NewformId = newFormRes.rows[0].form_id;

      await client.query(
        `INSERT INTO audit_form_actions (action_form_id, action_status_id, action_date, action_by) VALUES ($1, 1, current_timestamp, $2)`,
        [NewformId, userId]
      );
    }
    const formResLast = await client.query(
      `SELECT form_id FROM audit_forms WHERE form_aud_id = $1 AND form_list_id = 12`,
      [audId]
    );
    const formId = formResLast.rows[0].form_id;

    const form205Res = await client.query(
      `select form_sup_value from audit_forms where form_aud_id = $1 and form_list_id = 10 limit 1`,
      [audId]
    );

    const supVal = form205Res.rows[0].form_sup_value;

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
        r.risk_aud_id,
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
        r.risk_cd_type_id,
        cd.cd_type_label risk_cd_type_name,
        ri.risk_is_important,
        o.op_is_fraud,
        o.op_fraud_reason,
        o.op_is_control,
        o.op_genre,
        o.op_inspection_rate,
        o.op_effect_rate,
        o.op_is_material,
        o.op_is_impact,
        rr.resp_main_type_id,
        rm.main_type_label resp_main_type_name,
        rr.resp_rtype_id,
        rr.resp_sub_rtype_id,
        rr.resp_simple_type,
        rr.resp_response,
        rr.resp_standard_clause,
        rr.resp_law_clause
        from audit_risks r
        join audit_risk_important ri on r.risk_id = ri.risk_id
        left join audit_risk_operation o on r.risk_id = o.risk_id
        left join audit_risk_response rr on r.risk_id = rr.risk_id
        left join ref_risk_response_main rm on rr.resp_main_type_id = rm.main_type_id
        join ref_risk_source rs on r.risk_source_id = rs.source_id
        join ref_risk_status s on r.risk_status_id = s.status_id
        join ref_risk_type t on r.risk_type_id = t.type_id
        left join ref_risk_group g on r.risk_group_id = g.group_id
        left join ref_risk_sub_group sg on r.risk_sub_group_id = sg.sub_group_id
        left join ref_risk_cd_type cd on r.risk_cd_type_id = cd.cd_type_id
        where r.risk_aud_id = $1 and r.risk_status_id != 99
    `,
      [audId]
    );

    return NextResponse.json(
      {
        formData: formDataRes.rows[0],
        data: dataRes.rows,
        form_id: formId,
        supVal: supVal,
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

  if (!formId) {
    return NextResponse.json({ error: "Form ID is required" }, { status: 400 });
  }
  const riskData: {
    risk_content: string;
    risk_type_id: number;
    risk_group_id: number;
    risk_sub_group_id: number;
    risk_cd_type_id: number;
    risk_is_important: number;
    op_is_fraud: number;
    op_fraud_reason: string;
    op_is_control: number;
    op_genre: number;
    op_inspection_rate: number;
    op_effect_rate: number;
    op_is_material: number;
    op_is_impact: number;
    resp_main_type_id: number;
    resp_rtype_id: number;
    resp_sub_rtype_id: number;
    resp_simple_type: string;
    resp_response: string;
    resp_standard_clause: string;
    resp_law_clause: string;
  } = body.riskData;

  const client = await db.connect();

  try {
    // INSERT AUDIT_RISKS
    const riskRes = await client.query(
      `INSERT INTO audit_risks (risk_aud_id, risk_source_id, risk_date, risk_status_id, risk_content, risk_type_id, risk_group_id, risk_sub_group_id, risk_cd_type_id) 
        VALUES ($1, 4, current_timestamp, 1, $2, $3, $4, $5, $6) RETURNING risk_id`,
      [
        audId,
        riskData.risk_content,
        riskData.risk_type_id,
        riskData.risk_group_id,
        riskData.risk_sub_group_id,
        riskData.risk_cd_type_id,
      ]
    );

    const newRiskId = riskRes.rows[0].risk_id;

    // INSERT AUDIT_RISK_IMPORTANT
    await client.query(
      `INSERT INTO audit_risk_important (risk_id, risk_form_id, risk_is_important) VALUES ($1, $2, $3)`,
      [newRiskId, formId, riskData.risk_is_important]
    );

    // INSERT AUDIT_RISK_OPERATION
    if (riskData.op_is_fraud || riskData.op_genre || riskData.op_is_material) {
      await client.query(
        `INSERT INTO audit_risk_operation (risk_id, of_form_id, op_is_fraud, op_fraud_reason, op_is_control, op_genre, op_inspection_rate, op_effect_rate, op_is_material, op_is_impact) 
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          newRiskId,
          formId,
          riskData.op_is_fraud,
          riskData.op_fraud_reason,
          riskData.op_is_control,
          riskData.op_genre,
          riskData.op_inspection_rate,
          riskData.op_effect_rate,
          riskData.op_is_material,
          riskData.op_is_impact,
        ]
      );
    }

    // INSERT AUDIT_RISK_RESPONSE
    if (riskData.resp_response) {
      await client.query(
        `INSERT INTO audit_risk_response (risk_id, resp_form_id, resp_main_type_id, resp_rtype_id, resp_sub_rtype_id, resp_simple_type, resp_response, resp_standard_clause, resp_law_clause) 
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          newRiskId,
          formId,
          riskData.resp_main_type_id,
          riskData.resp_rtype_id,
          riskData.resp_sub_rtype_id,
          riskData.resp_simple_type,
          riskData.resp_response,
          riskData.resp_standard_clause,
          riskData.resp_law_clause,
        ]
      );
    }

    return NextResponse.json({ message: "Source 4 Risk inserted successfully" }, { status: 201 });
  } catch (err: any) {
    await client.query("ROLLBACK").catch(() => {});
    console.error("Source 4 Risk insert error:", err);

    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  } finally {
    client.release();
  }
});
