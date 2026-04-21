import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { withAuth } from "@/lib/withAuth";
import { requirePermission } from "@/lib/requirePermission";
import { JwtPayload } from "@/lib/jwtPayload";

export const GET = withAuth(async (req: NextRequest, user: JwtPayload) => {
  //requirePermission(user.permissions, ["user.read"]);

  const userId = user.id;
  const sp = new URL(req.url).searchParams;
  const audId = sp.get("aud_id");
  if (!audId) {
    return NextResponse.json({ error: "Audit ID is required" }, { status: 400 });
  }

  const client = await db.connect();
  try {
    const formRes = await client.query(
      `select form_id from audit_forms where form_aud_id = $1 and form_list_id = 19 limit 1`,
      [audId]
    );
    if (!formRes.rows[0].form_id) {
      const newFormRes = await client.query(
        `INSERT INTO audit_forms (form_aud_id, form_list_id, form_status_id) VALUES ($1, 19, 1) RETURNING form_id`,
        [audId]
      );

      const formId = newFormRes.rows[0].form_id;

      await client.query(
        `INSERT INTO audit_form_actions (action_form_id, action_status_id, action_date, action_by) VALUES ($1, 1, current_timestamp, $2)`,
        [formId, userId]
      );

      const indListRes = await client.query(
        `SELECT ind_id fp_ind_id, ind_group_label, ind_label, null as fp_type_id, null as fp_ind_value FROM ref_indicator WHERE ind_form_list_id = 19 order by ind_id`
      );

      for (const row of indListRes.rows) {
        const indId = row.fp_ind_id;
        const finishProcedureRes = await client.query(
          `INSERT INTO audit_finish_procedure (fp_form_id, fp_ind_id) VALUES ($1, $2) returning fp_id`,
          [formId, indId]
        );
        row.fp_id = finishProcedureRes.rows[0].fp_id;
      }

      return NextResponse.json({ data: indListRes, form_id: formId }, { status: 200 });
    } else {
      const dataRes = await client.query(
        `
      select 
            fp.fp_id,
            fp.fp_form_id,
            fp.fp_ind_id,
            i.ind_label,
            fp.fp_type_id,
            fp.fp_ind_value
        from audit_finish_procedure fp
        join audit_forms af on fp.fp_form_id = af.form_id
        join ref_indicator i on fp.fp_ind_id = i.ind_id
        where af.form_id = $1
    `,
        [formRes.rows[0].form_id]
      );

      return NextResponse.json(
        { data: dataRes.rows, form_id: formRes.rows[0].form_id },
        { status: 200 }
      );
    }
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

  const fpData: {
    fp_id: number;
    fp_ind_id: number;
    fp_type_id: number;
    fp_ind_value: string;
  }[] = body.fp_data; // expect array of {fp_id, fp_form_id, fp_ind_id, fp_type_id, fp_ind_value}

  if (!formStatusId || !audId || !formId || !fpData || !Array.isArray(fpData)) {
    return NextResponse.json({ error: "Мэдээлэл бүрэн оруулна уу" }, { status: 400 });
  }

  const client = await db.connect();
  try {
    await client.query("BEGIN");
    // UPDATE audit_forms
    await client.query(
      `
        UPDATE audit_forms
        set form_status_id = $1, form_description = $2
        where form_id = $3
      `,
      [formStatusId, formDescription, formId]
    );
    // INSERT audit_form_actions
    await client.query(
      `INSERT INTO audit_form_actions (action_form_id, action_status_id, action_date, action_by) VALUES ($1, $2, current_timestamp, $3)`,
      [formId, formStatusId, userId]
    );

    // UPDATE AUDIT_FINISH_PROCEDURE
    for (const fp of fpData) {
      const { fp_id, fp_type_id, fp_ind_id, fp_ind_value } = fp;
      await client.query(
        `
          UPDATE audit_finish_procedure
          set fp_ind_value = $1, fp_type_id = $2
          where fp_id = $3 and fp_ind_id = $3
        `,
        [fp_ind_value, fp_type_id, fp_id, fp_ind_id]
      );
    }

    await client.query("COMMIT");
    return NextResponse.json({ message: "Finish procedure updated successfully" }, { status: 201 });
  } catch (err: any) {
    await client.query("ROLLBACK").catch(() => {});
    console.error("Audit finish procedure update error:", err);

    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  } finally {
    client.release();
  }
});
