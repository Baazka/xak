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
      `SELECT form_id FROM audit_forms WHERE form_aud_id = $1 AND form_list_id = 13`,
      [audId]
    );

    if (!formRes.rows[0]) {
      const newFormRes = await client.query(
        `INSERT INTO audit_forms (form_aud_id, form_list_id, form_status_id) VALUES ($1, 13, 1) RETURNING form_id`,
        [audId]
      );
      const NewformId = newFormRes.rows[0].form_id;

      await client.query(
        `INSERT INTO audit_form_actions (action_form_id, action_status_id, action_date, action_by) VALUES ($1, 1, current_timestamp, $2)`,
        [NewformId, userId]
      );
    }

    const formLastRes = await client.query(
      `SELECT form_id FROM audit_forms WHERE form_aud_id = $1 AND form_list_id = 13 ORDER BY form_id DESC LIMIT 1`,
      [audId]
    );

    const formId = formLastRes.rows[0].form_id;

    await client.query(
      `INSERT INTO audit_risk_corporality (risk_id, rc_form_id) select r.risk_id, $1 from audit_risks r where r.risk_aud_id = $2 and NOT EXISTS (SELECT rc.risk_id FROM audit_risk_corporality rc WHERE rc.rc_form_id = $1 and rc.risk_id = r.risk_id)`,
      [formId, userId]
    );

    const formPrevRes = await client.query(
      `SELECT form_id FROM audit_forms WHERE form_aud_id = $1 AND form_list_id = 9`,
      [audId]
    );
    const formPrevId = formPrevRes.rows[0].form_id;

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

    const prevFormDataRes = await client.query(
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
      [formPrevId]
    );

    const prevRes = await client.query(
      `
      select 
        c.corp_id,
        c.corp_form_id,
        c.corp_ind_id,
        i.ind_level corp_ind_level,
        i.ind_label corp_ind_label,
        c.corp_ind_value
        from audit_corporality c
        join ref_corporality_indicator i on c.corp_ind_id = i.ind_id
        where c.corp_form_id = $1
      ORDER BY c.corp_ind_id
    `,
      [formPrevId]
    );

    const dataRes = await client.query(
      `
      select 
        c.corp_id,
        c.corp_form_id,
        c.corp_ind_id,
        i.ind_level corp_ind_level,
        i.ind_label corp_ind_label,
        c.corp_ind_value
        from audit_corporality c
        join ref_corporality_indicator i on c.corp_ind_id = i.ind_id
        where c.corp_form_id = $1
      ORDER BY c.corp_ind_id
    `,
      [formId]
    );

    const riskRes = await client.query(
      `
        select 
            r.risk_id, 
            r.risk_content,
            r.risk_group_id,
            g.group_label risk_group_name,
            r.risk_sub_group_id,
            sg.sub_group_label risk_sub_group_name,
            rc.rc_dt_kt,
            rc.rc_population,
            rc.rc_corp_rate,
            rc.rc_corp_amount,
            rc.rc_exec_percent,
            rc.rc_exec_amount
        from audit_risks r 
        join audit_risk_important i on r.risk_id = i.risk_id
        join ref_risk_group g on r.risk_group_id = g.group_id
        join ref_risk_sub_group sg on r.risk_sub_group_id = sg.sub_group_id
        left join audit_risk_corporality rc on r.risk_id = rc.risk_id
        where r.risk_type_id = 2 and i.risk_is_important = 1 and risk_aud_id = $1 and rc.rc_form_id = $2`,
      [audId, formId]
    );

    return NextResponse.json(
      {
        formData: formDataRes.rows[0],
        prevFormData: prevFormDataRes.rows[0],
        prevData: prevRes.rows,
        data: dataRes.rows,
        riskData: riskRes.rows,
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

  const isUpdate = body.is_update;

  if (!audId || !formId || !formStatusId) {
    return NextResponse.json(
      { error: "Audit ID, Form ID and Form Status ID are required" },
      { status: 400 }
    );
  }

  const corpData: { corp_id: number; corp_ind_id: number; corp_ind_value: string }[] =
    body.corpData;

  const riskData: {
    risk_id: number;
    rc_form_id: number;
    rc_dt_kt: string;
    rc_population: number;
    rc_corp_rate: number;
    rc_corp_amount: number;
    rc_exec_percent: number;
    rc_exec_amount: number;
  }[] = body.riskData;

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

    const prevCorp = await client.query(
      `SELECT count(*) as total FROM audit_corporality WHERE corp_form_id = $1 ORDER BY corp_id DESC`,
      [formId]
    );

    const prevCnt = prevCorp.rows[0].total;

    if (isUpdate) {
      for (const corp of corpData) {
        const { corp_id, corp_ind_id, corp_ind_value } = corp;
        if (prevCnt > 0) {
          await client.query(
            `UPDATE audit_corporality SET corp_ind_value = $1 WHERE corp_id = $2 AND corp_id = $3`,
            [corp_ind_value, corp_ind_id, corp_id]
          );
        } else {
          await client.query(
            `INSERT INTO audit_corporality (corp_form_id, corp_ind_id, corp_ind_value) VALUES ($1, $2, $3) RETURNING corp_id`,
            [formId, corp_ind_id, corp_ind_value]
          );
        }
      }
    }

    for (const risk of riskData) {
      const {
        risk_id,
        rc_form_id,
        rc_dt_kt,
        rc_population,
        rc_corp_rate,
        rc_corp_amount,
        rc_exec_percent,
        rc_exec_amount,
      } = risk;
      await client.query(
        `UPDATE audit_risk_corporality SET 
          rc_dt_kt = $1, 
          rc_population = $2, 
          rc_corp_rate = $3, 
          rc_corp_amount = $4, 
          rc_exec_percent = $5, 
          rc_exec_amount = $6 
        WHERE risk_id = $7 AND rc_form_id = $8`,
        [
          rc_dt_kt,
          rc_population,
          rc_corp_rate,
          rc_corp_amount,
          rc_exec_percent,
          rc_exec_amount,
          risk_id,
          rc_form_id,
        ]
      );
    }

    return NextResponse.json({ message: "Corporality 2 updated successfully" }, { status: 201 });
  } catch (err: any) {
    await client.query("ROLLBACK").catch(() => {});
    console.error("Corporality 2 update error:", err);

    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  } finally {
    client.release();
  }
});
