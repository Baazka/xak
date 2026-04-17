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
      `SELECT form_id FROM audit_forms WHERE form_aud_id = $1 AND form_list_id = 10`,
      [audId]
    );
    if (!formRes.rows[0]) {
      const newFormRes = await client.query(
        `INSERT INTO audit_forms (form_aud_id, form_list_id, form_status_id) VALUES ($1, 10, 1) RETURNING form_id`,
        [audId]
      );
      const NewformId = newFormRes.rows[0].form_id;

      await client.query(
        `INSERT INTO audit_form_actions (action_form_id, action_status_id, action_date, action_by) VALUES ($1, 1, current_timestamp, $2)`,
        [NewformId, userId]
      );
    }
    const formResLast = await client.query(
      `SELECT form_id FROM audit_forms WHERE form_aud_id = $1 AND form_list_id = 10`,
      [audId]
    );

    const formId = formResLast.rows[0].form_id;

    await client.query(
      `INSERT INTO audit_risk_operation(risk_id, op_form_id) 
        SELECT r.risk_id, $1 FROM audit_risks r WHERE r.risk_aud_id = $2 
        AND NOT EXISTS (SELECT op.risk_id FROM audit_risk_operation op WHERE op.risk_id = r.risk_id)`,
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
        f.form_description,
        f.form_sup_value
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
      o.risk_id,
      op_form_id,
      r.risk_type_id,
      t.type_label risk_type_name,
      r.risk_group_id,
      g.group_label risk_group_name,
      r.risk_sub_group_id,
      sg.sub_group_label risk_sub_group_name,
      r.risk_content,
      op_is_fraud,
      op_fraud_reason,
      op_is_control,
      op_genre,
      op_inspection_rate,
      op_effect_rate,
      op_is_material,
      op_is_impact,
      ri.risk_is_important
      from audit_risk_operation o
      join audit_risks r on o.risk_id = r.risk_id
      join ref_risk_type t on r.risk_type_id = t.type_id
      left join ref_risk_group g on r.risk_group_id = g.group_id
      left join ref_risk_sub_group sg on r.risk_sub_group_id = sg.sub_group_id
      join audit_risk_important ri on o.risk_id = ri.risk_id
      where o.op_form_id = $1
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
  const formSupValue = body.form_sup_value;

  if (!audId || !formId || !formStatusId) {
    return NextResponse.json(
      { error: "Audit ID, Form ID and Form Status ID are required" },
      { status: 400 }
    );
  }
  const operationData: {
    risk_id: number;
    op_form_id: number;
    op_is_fraud: number;
    op_fraud_reason: string;
    op_is_control: number;
    op_genre: string;
    op_inspection_rate: number;
    op_effect_rate: number;
    op_is_material: number;
    op_is_impact: number;
  }[] = body.operationData;

  console.log("opDta ", operationData);

  const client = await db.connect();

  try {
    const formRes = await client.query(
      `UPDATE audit_forms SET form_status_id = $1, form_description = $2, form_sup_value = $3 WHERE form_id = $4 RETURNING form_id`,
      [formStatusId, formDescription, formSupValue, formId]
    );
    await client.query(
      `INSERT INTO audit_form_actions (action_form_id, action_status_id, action_date, action_by) VALUES ($1, $2, current_timestamp, $3)`,
      [formId, formStatusId, userId]
    );

    for (const operation of operationData) {
      const {
        risk_id,
        op_form_id,
        op_is_fraud,
        op_fraud_reason,
        op_is_control,
        op_genre,
        op_inspection_rate,
        op_effect_rate,
        op_is_material,
        op_is_impact,
      } = operation;
      await client.query(
        `UPDATE audit_risk_operation SET 
          op_is_fraud = $1, 
          op_fraud_reason = $2, 
          op_is_control = $3, 
          op_genre = $4, 
          op_inspection_rate = $5, 
          op_effect_rate = $6, 
          op_is_material = $7, 
          op_is_impact = $8 
          WHERE risk_id = $9 AND op_form_id = $10`,
        [
          op_is_fraud,
          op_fraud_reason,
          op_is_control,
          op_genre,
          op_inspection_rate,
          op_effect_rate,
          op_is_material,
          op_is_impact,
          risk_id,
          formId,
        ]
      );
    }

    return NextResponse.json({ message: "Risk Operation updated successfully" }, { status: 201 });
  } catch (err: any) {
    await client.query("ROLLBACK").catch(() => {});
    console.error("Risk Operation update error:", err);

    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  } finally {
    client.release();
  }
});
