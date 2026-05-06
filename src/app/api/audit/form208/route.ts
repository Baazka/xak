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
    const isExistRes = await client.query(
      `select form_id from audit_forms where form_aud_id = $1 and form_list_id = 7 limit 1`,
      [audId]
    );
    if (!isExistRes.rows[0]) {
      const newFormRes = await client.query(
        `INSERT INTO audit_forms (form_aud_id, form_list_id, form_status_id) VALUES ($1, 7, 1) RETURNING form_id`,
        [audId]
      );

      const formId = newFormRes.rows[0].form_id;

      await client.query(
        `INSERT INTO audit_form_actions (action_form_id, action_status_id, action_date, action_by) VALUES ($1, 1, current_timestamp, $2)`,
        [formId, userId]
      );

      const indListRes = await client.query(
        `SELECT ind_id as str_ind_id, null as str_ind_value, ind_label FROM ref_indicator i where ind_form_list_id = 7 order by i.ind_id`
      );

      for (const row of indListRes.rows) {
        const indId = row.str_ind_id;
        const strategyRes = await client.query(
          `INSERT INTO audit_strategy (str_form_id, str_ind_id) VALUES ($1, $2) returning str_id`,
          [formId, indId]
        );
      }
    }
    const formResLast = await client.query(
      `SELECT form_id FROM audit_forms WHERE form_aud_id = $1 AND form_list_id = 7`,
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
        s.str_id,
        s.str_form_id,
        s.str_ind_id,
        i.ind_label str_ind_label,
        s.str_ind_value
        from audit_strategy s
        join ref_indicator i on s.str_ind_id = i.ind_id
        where s.str_form_id = $1
    `,
      [formId]
    );

    return NextResponse.json(
      { formData: formDataRes.rows[0], data: dataRes.rows, form_id: formId },
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
  const formFileId = body.form_file_id;

  const strData: { str_id: number; str_ind_id: number; str_ind_value: string }[] = body.strData;

  if (!formId || !strData || !Array.isArray(strData)) {
    return NextResponse.json({ error: "Мэдээлэл бүрэн оруулна уу" }, { status: 400 });
  }

  const client = await db.connect();
  try {
    await client.query("BEGIN");

    if (formFileId) {
      await client.query(
        `
        UPDATE audit_forms
        set form_file_id = $1
        where form_id = $2
      `,
        [formFileId, formId]
      );
    }

    // UPDATE AUDIT_STRATEGY
    for (const str of strData) {
      const { str_id, str_ind_id, str_ind_value } = str;

      await client.query(
        `
          UPDATE audit_strategy
          set str_ind_value = $1
          where str_id = $2 and str_ind_id = $3 and str_form_id = $4
        `,
        [str_ind_value, str_id, str_ind_id, formId]
      );
    }

    await client.query("COMMIT");
    return NextResponse.json({ message: "Strategy updated successfully" }, { status: 201 });
  } catch (err: any) {
    await client.query("ROLLBACK").catch(() => {});
    console.error("Strategy update error:", err);

    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  } finally {
    client.release();
  }
});
