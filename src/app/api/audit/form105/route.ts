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
      `select form_id from audit_forms where form_aud_id = $1 and form_list_id = 2 limit 1`,
      [audId]
    );
    if (!isExistRes.rows[0]) {
      const newFormRes = await client.query(
        `INSERT INTO audit_forms (form_aud_id, form_list_id, form_status_id) VALUES ($1, 2, 1) RETURNING form_id`,
        [audId]
      );

      const formId = newFormRes.rows[0].form_id;

      await client.query(
        `INSERT INTO audit_form_actions (action_form_id, action_status_id, action_date, action_by) VALUES ($1, 1, current_timestamp, $2)`,
        [formId, userId]
      );

      const indListRes = await client.query(
        `SELECT ind_id, ind_group_label, ind_label, null as cr_rate_value, null as cr_description FROM ref_indicator WHERE ind_form_list_id = 2 order by ind_id`
      );

      for (const row of indListRes.rows) {
        const indId = row.ind_id;
        const conceptRateRes = await client.query(
          `INSERT INTO audit_concept_rate (cr_form_id, cr_ind_id) VALUES ($1, $2) returning cr_id`,
          [formId, indId]
        );
        row.cr_id = conceptRateRes.rows[0].cr_id;
      }

      return NextResponse.json({ data: indListRes, form_id: formId }, { status: 200 });
    } else {
      const dataRes = await client.query(
        `
      select 
            cr.cr_id,
            cr.cr_form_id,
            cr.cr_ind_id,
            i.ind_group_label,
            i.ind_label,
            cr.cr_rate_value,
            cr.cr_description
        from audit_concept_rate cr
        join audit_forms af on cr.cr_form_id = af.form_id
        join ref_indicator i on cr.cr_ind_id = i.ind_id
        where af.form_aud_id = $1 and af.form_list_id = 2
    `,
        [audId]
      );

      return NextResponse.json(
        { data: dataRes.rows, form_id: isExistRes.rows[0].form_id },
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
  const formId = body.form_id;

  const crData: {
    cr_id: number;
    cr_form_id: number;
    cr_ind_id: number;
    cr_rate_value: string;
    cr_description: string;
  }[] = body.cr_data; // expect array of {cr_id, cr_form_id, cr_ind_id, cr_rate_value, cr_description}

  if (!formId || !crData || !Array.isArray(crData)) {
    return NextResponse.json({ error: "Мэдээлэл бүрэн оруулна уу" }, { status: 400 });
  }

  const client = await db.connect();
  try {
    await client.query("BEGIN");

    // UPDATE AUDIT_CONCEPT_RATE
    for (const cr of crData) {
      const { cr_ind_id, cr_rate_value, cr_description } = cr;
      await client.query(
        `
          UPDATE audit_concept_rate
          set cr_rate_value = $1, cr_description = $2
          where cr_id = $3 and cr_ind_id = $4 and cr_form_id = $5
      `,
        [cr_rate_value, cr_description, cr.cr_id, cr_ind_id, formId]
      );
    }

    await client.query("COMMIT");
    return NextResponse.json({ message: "Concept rate updated successfully" }, { status: 201 });
  } catch (err: any) {
    await client.query("ROLLBACK").catch(() => {});
    console.error("Audit concept rate update error:", err);

    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  } finally {
    client.release();
  }
});
