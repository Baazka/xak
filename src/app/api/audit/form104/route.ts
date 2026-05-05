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
  const teamId = sp.get("team_id");
  if (!audId) {
    return NextResponse.json({ error: "Audit ID is required" }, { status: 400 });
  }

  const client = await db.connect();
  try {
    const isExistRes = await client.query(
      `select form_id from audit_forms where form_aud_id = $1 and form_team_id = $2 and form_list_id = 1 limit 1`,
      [audId, teamId]
    );
    if (!isExistRes.rows[0]) {
      const newFormRes = await client.query(
        `INSERT INTO audit_forms (form_aud_id, form_team_id, form_list_id, form_status_id) VALUES ($1, $2, 1, 1) RETURNING form_id`,
        [audId, teamId]
      );

      const formId = newFormRes.rows[0].form_id;

      await client.query(
        `INSERT INTO audit_form_actions (action_form_id, action_status_id, action_date, action_by) VALUES ($1, 1, current_timestamp, $2)`,
        [formId, userId]
      );

      const indListRes = await client.query(
        `SELECT ind_id, true as noti_value, ind_group_label, ind_label FROM ref_indicator WHERE ind_form_list_id = 1`
      );

      for (const row of indListRes.rows) {
        const indId = row.ind_id;
        const notiRes = await client.query(
          `INSERT INTO audit_notices (noti_form_id, noti_ind_id) VALUES ($1, $2) returning noti_id`,
          [formId, indId]
        );
        row.noti_id = notiRes.rows[0].noti_id;
      }

      return NextResponse.json({ data: indListRes, form_id: formId }, { status: 200 });
    } else {
      const dataRes = await client.query(
        `
      select 
        n.noti_id,
        n.noti_form_id, 
        i.ind_id,
        i.ind_group_label,
        i.ind_label,
        n.noti_value
        from audit_notices n
        join audit_forms af on n.noti_form_id = af.form_id
        join ref_indicator i on n.noti_ind_id = i.ind_id
        where af.form_aud_id = $1 and af.form_team_id = $2 and af.form_list_id = 1
    `,
        [audId, teamId]
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

  const notiData: { noti_id: number; ind_id: number; noti_value: boolean }[] = body.noti_data; // expect array of {noti_id, ind_id, noti_value}

  if (!statusId || !audId || !formId || !notiData || !Array.isArray(notiData)) {
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

    // UPDATE AUDIT_NOTICES
    for (const noti of notiData) {
      const { ind_id, noti_value } = noti;
      if (!noti_value) {
        return NextResponse.json({ error: "Мэдээлэл бүрэн оруулна уу" }, { status: 402 });
      }
      await client.query(
        `
          UPDATE audit_notices
          set noti_value = $1
          where noti_form_id = $2 and noti_ind_id = $3
        `,
        [noti_value, formId, ind_id]
      );
    }

    await client.query("COMMIT");
    return NextResponse.json({ message: "Notice updated successfully" }, { status: 201 });
  } catch (err: any) {
    await client.query("ROLLBACK").catch(() => {});
    console.error("Audit notice update error:", err);

    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  } finally {
    client.release();
  }
});
