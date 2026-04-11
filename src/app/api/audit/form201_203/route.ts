import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { withAuth } from "@/lib/withAuth";
import { requirePermission } from "@/lib/requirePermission";
import { JwtPayload } from "@/lib/jwtPayload";
import { info } from "console";

export const GET = withAuth(async (req: NextRequest, user: JwtPayload) => {
  //requirePermission(user.permissions, ["user.read"]);

  const userId = user.id;
  const sp = new URL(req.url).searchParams;
  const audId = sp.get("aud_id");
  const formListId = sp.get("form_list_id");
  if (!audId || !formListId) {
    return NextResponse.json({ error: "Audit ID and Form List ID are required" }, { status: 400 });
  }

  const client = await db.connect();
  try {
    const isExistRes = await client.query(
      `select form_id from audit_forms where form_aud_id = $1 and form_list_id = $2 limit 1`,
      [audId, formListId]
    );
    if (!isExistRes.rows[0]) {
      const newFormRes = await client.query(
        `INSERT INTO audit_forms (form_aud_id, form_list_id, form_status_id) VALUES ($1, $2, 1) RETURNING form_id`,
        [audId, formListId]
      );

      const formId = newFormRes.rows[0].form_id;

      await client.query(
        `INSERT INTO audit_form_actions (action_form_id, action_status_id, action_date, action_by) VALUES ($1, 1, current_timestamp, $2)`,
        [formId, userId]
      );

      const indListRes = await client.query(
        `SELECT ind_id as info_ind_id, ind_group_label, ind_label, null as info_ind_value FROM ref_indicator WHERE ind_form_list_id = $1 order by ind_id`,
        [formListId]
      );

      for (const row of indListRes.rows) {
        const indId = row.info_ind_id;
        const coreInfoRes = await client.query(
          `INSERT INTO audit_core_info (info_form_id, info_ind_id) VALUES ($1, $2) returning info_id`,
          [formId, indId]
        );
        row.info_id = coreInfoRes.rows[0].info_id;
      }

      return NextResponse.json({ data: indListRes, form_id: formId }, { status: 200 });
    } else {
      const dataRes = await client.query(
        `
      select 
        c.info_id,
        c.info_form_id, 
        c.info_ind_id,
        i.ind_group_label,
        i.ind_label,
        c.info_ind_value
        from audit_core_info c
        join audit_forms af on c.info_form_id = af.form_id
        join ref_indicator i on c.info_ind_id = i.ind_id
        where af.form_aud_id = $1 and af.form_list_id = $2
    `,
        [audId, formListId]
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
  const audId = body.aud_id;
  const formId = body.form_id;
  const statusId = body.status_id;

  const coreInfoData: { info_id: number; info_ind_id: number; info_ind_value: boolean }[] =
    body.info_data; // expect array of {info_id, ind_id, info_value}

  if (!statusId || !audId || !formId || !coreInfoData || !Array.isArray(coreInfoData)) {
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

    // UPDATE AUDIT_CORE_INFO
    for (const info of coreInfoData) {
      const { info_id, info_ind_id, info_ind_value } = info;
      if (!info_ind_value) {
        return NextResponse.json({ error: "Мэдээлэл бүрэн оруулна уу" }, { status: 401 });
      }
      await client.query(
        `
          UPDATE audit_core_info
          set info_ind_value = $1
          where info_id = $2 and info_ind_id = $3
        `,
        [info_ind_value, info_id, info_ind_id]
      );
    }

    await client.query("COMMIT");
    return NextResponse.json({ message: "Core info updated successfully" }, { status: 201 });
  } catch (err: any) {
    await client.query("ROLLBACK").catch(() => {});
    console.error("Audit core info update error:", err);

    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  } finally {
    client.release();
  }
});
