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
      `SELECT form_id FROM audit_forms WHERE form_aud_id = $1 AND form_list_id = 16`,
      [audId]
    );

    if (!formRes.rows[0]) {
      const newFormRes = await client.query(
        `INSERT INTO audit_forms (form_aud_id, form_list_id, form_status_id) VALUES ($1, 16, 1) RETURNING form_id`,
        [audId]
      );
      const NewformId = newFormRes.rows[0].form_id;

      await client.query(
        `INSERT INTO audit_form_actions (action_form_id, action_status_id, action_date, action_by) VALUES ($1, 1, current_timestamp, $2)`,
        [NewformId, userId]
      );
    }

    const formLastRes = await client.query(
      `SELECT form_id FROM audit_forms WHERE form_aud_id = $1 AND form_list_id = 16 ORDER BY form_id DESC LIMIT 1`,
      [audId]
    );

    const formId = formLastRes.rows[0].form_id;

    await client.query(
      `INSERT INTO audit_risk_collection (risk_id, col_form_id) 
        SELECT r.risk_id, $1 FROM audit_risks r 
        join audit_risk_important i on r.risk_id = i.risk_id
        where r.risk_aud_id = $2 and r.risk_type_id = 2 and i.risk_is_important = 1 AND NOT EXISTS (SELECT rc.risk_id FROM audit_risk_collection rc WHERE rc.col_form_id = $1 and rc.risk_id = r.risk_id)`,
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
            r.risk_id, 
            r.risk_content,
            r.risk_group_id,
            g.group_label risk_group_name,
            r.risk_sub_group_id,
            sg.sub_group_label risk_sub_group_name,
            rc.col_list_count,
            rc.col_list_amount,
            rc.col_heavy_count,
            rc.col_heavy_amount,
            rc.col_abnormal_count,
            rc.col_abnormal_amount,
            rc.col_abnormal_desc,
            rc.col_rest_count,
            rc.col_rest_amount,
            rc.col_trust_level,
            rc.col_total_count,
            rc.col_total_amount,
            rc.col_choose_type,
            rc.col_fault_count,
            rc.col_fault_amount,
            rc.col_heavy_fcount,
            rc.col_heavy_famount,
            rc.col_abnormal_fcount,
            rc.col_abnormal_famount,
            rc.col_total_fcount,
            rc.col_total_famount,
            rc.col_fault_convert,
            ric.rc_exec_amount,
        from audit_risks r 
        join audit_risk_important i on r.risk_id = i.risk_id
        join ref_risk_group g on r.risk_group_id = g.group_id
        join ref_risk_sub_group sg on r.risk_sub_group_id = sg.sub_group_id
        left join audit_risk_collection rc on r.risk_id = rc.risk_id and rc.col_form_id = $2
        left join audit_risk_corporality ric on r.risk_id = ric.risk_id
        where r.risk_type_id = 2 and i.risk_is_important = 1 and r.risk_aud_id = $1`,
      [audId, formId]
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

  const colData: {
    risk_id: number;
    col_list_count: number;
    col_list_amount: number;
    col_heavy_count: number;
    col_heavy_amount: number;
    col_abnormal_count: number;
    col_abnormal_amount: number;
    col_abnormal_desc: string;
    col_rest_count: number;
    col_rest_amount: number;
    col_trust_level: number;
    col_total_count: number;
    col_total_amount: number;
    col_choose_type: number;
    col_fault_count: number;
    col_fault_amount: number;
    col_heavy_fcount: number;
    col_heavy_famount: number;
    col_abnormal_fcount: number;
    col_abnormal_famount: number;
    col_total_fcount: number;
    col_total_famount: number;
    col_fault_convert: number;
  }[] = body.colData;

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

    for (const col of colData) {
      const {
        risk_id,
        col_list_count,
        col_list_amount,
        col_heavy_count,
        col_heavy_amount,
        col_abnormal_count,
        col_abnormal_amount,
        col_abnormal_desc,
        col_rest_count,
        col_rest_amount,
        col_trust_level,
        col_total_count,
        col_total_amount,
        col_choose_type,
        col_fault_count,
        col_fault_amount,
        col_heavy_fcount,
        col_heavy_famount,
        col_abnormal_fcount,
        col_abnormal_famount,
        col_total_fcount,
        col_total_famount,
        col_fault_convert,
      } = col;
      await client.query(
        `UPDATE audit_risk_collection SET 
          col_list_count = $1, 
          col_list_amount = $2, 
          col_heavy_count = $3, 
          col_heavy_amount = $4, 
          col_abnormal_count = $5, 
          col_abnormal_amount = $6, 
          col_abnormal_desc = $7, 
          col_rest_count = $8, 
          col_rest_amount = $9, 
          col_trust_level = $10, 
          col_total_count = $11, 
          col_total_amount = $12, 
          col_choose_type = $13, 
          col_fault_count = $14, 
          col_fault_amount = $15, 
          col_heavy_fcount = $16, 
          col_heavy_famount = $17, 
          col_abnormal_fcount = $18, 
          col_abnormal_famount = $19, 
          col_total_fcount = $20, 
          col_total_famount = $21, 
          col_fault_convert = $22 
        WHERE risk_id = $23 AND col_form_id = $24`,
        [
          col_list_count,
          col_list_amount,
          col_heavy_count,
          col_heavy_amount,
          col_abnormal_count,
          col_abnormal_amount,
          col_abnormal_desc,
          col_rest_count,
          col_rest_amount,
          col_trust_level,
          col_total_count,
          col_total_amount,
          col_choose_type,
          col_fault_count,
          col_fault_amount,
          col_heavy_fcount,
          col_heavy_famount,
          col_abnormal_fcount,
          col_abnormal_famount,
          col_total_fcount,
          col_total_famount,
          col_fault_convert,
          risk_id,
          formId,
        ]
      );
    }

    return NextResponse.json({ message: "Collection updated successfully" }, { status: 201 });
  } catch (err: any) {
    await client.query("ROLLBACK").catch(() => {});
    console.error("Collection update error:", err);

    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  } finally {
    client.release();
  }
});
