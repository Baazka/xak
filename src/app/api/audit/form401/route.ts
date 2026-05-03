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
      `SELECT form_id FROM audit_forms WHERE form_aud_id = $1 AND form_list_id = 21`,
      [audId]
    );
    if (!formRes.rows[0]) {
      const newFormRes = await client.query(
        `INSERT INTO audit_forms (form_aud_id, form_list_id, form_status_id) VALUES ($1, 21, 1) RETURNING form_id`,
        [audId]
      );
      const NewformId = newFormRes.rows[0].form_id;

      await client.query(
        `INSERT INTO audit_form_actions (action_form_id, action_status_id, action_date, action_by) VALUES ($1, 1, current_timestamp, $2)`,
        [NewformId, userId]
      );
    }
    const formResLast = await client.query(
      `SELECT form_id FROM audit_forms WHERE form_aud_id = $1 AND form_list_id = 21`,
      [audId]
    );
    const formId = formResLast.rows[0].form_id;

    const isDataExist = await client.query(
      `SELECT 1 FROM audit_conclusion WHERE con_form_id = $1 LIMIT 1`,
      [formId]
    );

    if (!isDataExist.rows[0]) {
      await client.query(`INSERT INTO audit_conclusion (con_form_id) VALUES ($1)`, [formId]);
    }

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

    const dataRes = await client.query(
      `
      select 
        c.con_id,
        c.con_form_id,
        c.con_type_id,
        ct.type_label con_type_name,
        c.con_base,
        c.con_file_id
        from audit_conclusion c
        left join ref_conclusion_type ct on c.con_type_id = ct.type_id
        where c.con_form_id = $1
    `,
      [formId]
    );

    const infoRes = await client.query(
      `
      select 
        --af.form_aud_id,
        c.con_form_id,
        a.corp_val,
        a.corp_exec_val,
        b.material_count,
        b.not_material_count,
        b.other_count,
        b.aldaa_count,
        b.zorchil_count,
        b.corrected_amount,
        b.uncorrected_amount
        from audit_conclusion c
        join audit_forms af on c.con_form_id = af.form_id
        left join (select 
        form_aud_id, form_id, form_list_id,
        sum(case when form_list_id = 13 and info_ind_id = 114 and info_ind_value::integer = 11 then 1 else 0 end) f_order,
        COALESCE(NULLIF(sum(case when form_list_id = 9 and corp_ind_id = 8 then corp_ind_value::numeric else 0 end),0), sum(case when form_list_id = 13 and info_ind_id = 112 then info_ind_value::numeric else 0 end)) corp_val,
        COALESCE(NULLIF(sum(case when form_list_id = 9 and corp_ind_id = 10 then corp_ind_value::numeric else 0 end),0),sum(case when form_list_id = 13 and info_ind_id = 113 then info_ind_value::numeric else 0 end)) corp_exec_val		
		    from audit_forms f 
        left join audit_corporality co on f.form_id = co.corp_form_id
        left join audit_core_info c on f.form_id = c.info_form_id
        where form_aud_id = $1 and form_list_id in (9,13) 
        group by form_aud_id, form_id, form_list_id
        order by f_order desc, form_list_id asc
        LIMIT 1
        ) a on a.form_aud_id = af.form_aud_id
        left join (select 
        form_aud_id,
        sum(case when rf_is_material = 1 then 1 else 0 end) material_count,
        sum(case when rf_is_material = 2 then 1 else 0 end) not_material_count,
        sum(case when rf_is_material = 3 then 1 else 0 end) other_count,
        sum(case when r.res_fault_level = 1 then 1 else 0 end) aldaa_count,
        sum(case when r.res_fault_level = 2 then 1 else 0 end) zorchil_count,
        sum(case when c.fc_report_id is not null and c.fc_report_id > 0 then f.rf_amount else 0 end) corrected_amount,
        sum(case when c.fc_report_id is null or c.fc_report_id < 1 then f.rf_amount else 0 end) uncorrected_amount
        from audit_forms af
        join audit_risk_fault f on af.form_id = f.rf_form_id
        join audit_risk_result r on r.risk_id = f.risk_id
        left join audit_fault_correction c on f.risk_id = c.risk_id
        where form_aud_id = $1 and form_list_id = 17
        group by form_aud_id
        ) b on b.form_aud_id = af.form_aud_id
        where c.con_form_id = $2
    `,
      [audId, formId]
    );

    return NextResponse.json(
      {
        formData: formDataRes.rows[0],
        data: dataRes.rows,
        info: infoRes.rows,
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

  const solutionData: {
    risk_id: number;
    fs_subject: string;
    fs_solution_id: number;
    fs_solution_clause: string;
    fs_type_id: number;
  }[] = body.solutionData;

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

    for (const solution of solutionData) {
      const { risk_id, fs_subject, fs_solution_id, fs_solution_clause, fs_type_id } = solution;
      await client.query(
        `UPDATE audit_fault_solution SET 
            fs_subject = $1, 
            fs_solution_id = $2, 
            fs_solution_clause = $3, 
            fs_type_id = $4 
            WHERE risk_id = $5 AND fs_form_id = $6`,
        [fs_subject, fs_solution_id, fs_solution_clause, fs_type_id, risk_id, formId]
      );
    }

    return NextResponse.json(
      { message: "Audit Fault Solution updated successfully" },
      { status: 201 }
    );
  } catch (err: any) {
    await client.query("ROLLBACK").catch(() => {});
    console.error("Audit Fault Solution update error:", err);

    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  } finally {
    client.release();
  }
});
