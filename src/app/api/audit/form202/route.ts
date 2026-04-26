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
      `select form_id from audit_forms where form_aud_id = $1 and form_list_id = 6 limit 1`,
      [audId]
    );
    if (!isExistRes.rows[0]) {
      const newFormRes = await client.query(
        `INSERT INTO audit_forms (form_aud_id, form_list_id, form_status_id) VALUES ($1, 6, 1) RETURNING form_id`,
        [audId]
      );

      const formId = newFormRes.rows[0].form_id;

      await client.query(
        `INSERT INTO audit_form_actions (action_form_id, action_status_id, action_date, action_by) VALUES ($1, 1, current_timestamp, $2)`,
        [formId, userId]
      );

      const indListRes = await client.query(
        `SELECT ind_id as fs_ind_id, null as fs_val1, null as fs_val2, ind_group_id, g.group_label as ind_group_label, ind_label, ind_code FROM ref_finstate_indicator i join ref_finstate_group g on i.ind_group_id = g.group_id order by i.ind_id`
      );

      for (const row of indListRes.rows) {
        const indId = row.ind_id;
        const finStateRes = await client.query(
          `INSERT INTO audit_finstates (fs_aud_id, fs_form_id, fs_ind_id) VALUES ($1, $2, $3) returning fs_id`,
          [audId, formId, indId]
        );
        row.fs_id = finStateRes.rows[0].fs_id;
        row.fs_aud_id = audId;
        row.fs_form_id = formId;
      }

      return NextResponse.json({ data: indListRes, form_id: formId }, { status: 200 });
    } else {
      const dataRes = await client.query(
        `
      select 
        f.fs_id,
        f.fs_aud_id,
        f.fs_form_id,
        f.fs_ind_id,
        i.ind_group_id,
        g.group_label as ind_group_label,
        i.ind_label,
        i.ind_code,
        f.fs_val1,
        f.fs_val2
        from audit_finstates f
        join audit_forms af on f.fs_form_id = af.form_id
        join ref_finstate_indicator i on f.fs_ind_id = i.ind_id
        join ref_finstate_group g on i.ind_group_id = g.group_id
        where af.form_aud_id = $1 and af.form_list_id = 6
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
  // Check Insert or Update
  const audId = body.aud_id;
  const formId = body.form_id;
  const statusId = body.status_id;

  const finStateData: { fs_id: number; fs_ind_id: number; fs_val1: string; fs_val2: string }[] =
    body.finstate_data; // expect array of {fs_id, fs_ind_id, fs_val1, fs_val2}

  if (!statusId || !audId || !formId || !finStateData || !Array.isArray(finStateData)) {
    return NextResponse.json({ error: "Мэдээлэл бүрэн оруулна уу" }, { status: 400 });
  }

  const client = await db.connect();
  try {
    await client.query("BEGIN");
    // UPDATE audit_forms
    await client.query(
      `
        UPDATE audit_forms
        set form_status_id = $1
        where form_id = $2
      `,
      [statusId, formId]
    );
    // INSERT audit_form_actions
    await client.query(
      `INSERT INTO audit_form_actions (action_form_id, action_status_id, action_date, action_by) VALUES ($1, $2, current_timestamp, $3)`,
      [formId, statusId, userId]
    );

    // UPDATE AUDIT_FINSTATES
    for (const fs of finStateData) {
      const { fs_id, fs_ind_id, fs_val1, fs_val2 } = fs;

      await client.query(
        `
          UPDATE audit_finstates
          set fs_val1 = $1, fs_val2 = $2
          where fs_id = $3 and fs_ind_id = $4
        `,
        [fs_val1, fs_val2, fs_id, fs_ind_id]
      );
    }

    await client.query("COMMIT");
    return NextResponse.json({ message: "Finstate updated successfully" }, { status: 201 });
  } catch (err: any) {
    await client.query("ROLLBACK").catch(() => {});
    console.error("Audit finstate update error:", err);

    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  } finally {
    client.release();
  }
});
