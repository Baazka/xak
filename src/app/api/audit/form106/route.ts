import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { withAuth } from "@/lib/withAuth";
import { requirePermission } from "@/lib/requirePermission";
import { JwtPayload } from "@/lib/jwtPayload";
import { useState } from "react";

export const GET = withAuth(async (req: NextRequest, user: JwtPayload) => {
  //requirePermission(user.permissions, ["user.read"]);

  const sp = new URL(req.url).searchParams;
  const audId = sp.get("aud_id");
  const userId = user.id;
  if (!audId) {
    return NextResponse.json({ error: "Audit ID is required" }, { status: 400 });
  }
  const [formId, setFormId] = useState<number | null>(null);

  const client = await db.connect();

  try {
    const formRes = await client.query(
      `SELECT form_id FROM audit_forms WHERE form_aud_id = $1 AND form_list_id = 5`,
      [audId]
    );
    if (!formRes.rows[0]) {
      const newFormRes = await client.query(
        `INSERT INTO audit_forms (form_aud_id, form_list_id, form_status_id) VALUES ($1, 5, 1) RETURNING form_id`,
        [audId]
      );
      const formId = newFormRes.rows[0].form_id;
      setFormId(formId);

      await client.query(
        `INSERT INTO audit_form_actions (action_form_id, action_status_id, action_date, action_by) VALUES ($1, 1, current_timestamp, $2)`,
        [formId, userId]
      );
    }
    setFormId(formRes.rows[0].form_id);

    const dataRes = await client.query(
      `
      select 
        meeting_id,
        meeting_aud_id,
        meeting_form_id,
        meeting_type_id,
        mt.type_label meeting_type_name,
        to_char(meeting_date, 'YYYY.MM.DD')::text as meeting_date,
        to_char(meeting_time, 'HH24:MI')::text as meeting_time,
        meeting_place,
        meeting_scope,
        meeting_file_id
        from audit_meetings t
        join ref_meeting_type mt on t.meeting_type_id = mt.type_id
        where meeting_aud_id = $1 and meeting_form_id = $2
      ORDER BY meeting_id DESC
    `,
      [audId, formId]
    );

    return NextResponse.json(
      {
        data: dataRes.rows,
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
