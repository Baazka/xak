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

export const POST = withAuth(async (req: NextRequest, user: JwtPayload) => {
  //requirePermission(user.permissions, ["user.create"]);

  const body = await req.json();

  const userId = user.id;
  const audId = body.aud_id;
  const formId = body.form_id;
  const meetingId = body.meeting_id;
  const meetingTypeId = body.meeting_type_id;
  const meetingDate = body.meeting_date;
  const meetingTime = body.meeting_time;
  const meetingPlace = body.meeting_place;
  const meetingScope = body.meeting_scope;
  const meetingFileId = body.meeting_file_id;

  if (
    !meetingTypeId ||
    !meetingDate ||
    !meetingTime ||
    !meetingPlace ||
    !meetingScope ||
    !meetingFileId
  ) {
    return NextResponse.json({ error: "Хүсэлтийн мэдээлэл бүрэн оруулна уу" }, { status: 400 });
  }

  const client = await db.connect();

  try {
    if (meetingId) {
      // audit_meetings update
      await client.query(
        `UPDATE audit_meetings SET meeting_type_id = $1, meeting_place = $2, meeting_date = $3, meeting_time = $4, meeting_scope = $5, meeting_file_id = $6 WHERE meeting_id = $7`,
        [
          meetingTypeId,
          meetingPlace,
          meetingDate,
          meetingTime,
          meetingScope,
          meetingFileId,
          meetingId,
        ]
      );
      return NextResponse.json({ message: "Meeting updated successfully" }, { status: 201 });
    } else {
      // audit_meetings insert
      const meetingRes = await client.query(
        `INSERT INTO audit_meetings (meeting_aud_id, meeting_form_id, meeting_type_id, meeting_place, meeting_date, meeting_time, meeting_scope, meeting_file_id, created_by, created_date)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, current_timestamp) RETURNING meeting_id`,
        [
          audId,
          formId,
          meetingTypeId,
          meetingPlace,
          meetingDate,
          meetingTime,
          meetingScope,
          meetingFileId,
          userId,
        ]
      );
      return NextResponse.json({ meeting_id: meetingRes.rows[0].meeting_id }, { status: 200 });
    }
  } catch (err: any) {
    await client.query("ROLLBACK").catch(() => {});
    console.error("Create meeting error:", err);

    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  } finally {
    client.release();
  }
});

export const DELETE = withAuth(async (req: NextRequest, user: JwtPayload) => {
  //requirePermission(user.permissions, ["user.create"]);

  const body = await req.json();

  const meetingId = body.meeting_id;
  if (!meetingId) {
    return NextResponse.json({ error: "Meeting ID is required" }, { status: 400 });
  }

  const client = await db.connect();

  try {
    await client.query("BEGIN");

    // audit_meetings delete
    await client.query(`DELETE FROM audit_meetings WHERE meeting_id = $1`, [meetingId]);

    await client.query("COMMIT");
    return NextResponse.json({ message: "Meeting deleted successfully" }, { status: 200 });
  } catch (err: any) {
    await client.query("ROLLBACK").catch(() => {});
    console.error("Delete meeting error:", err);

    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  } finally {
    client.release();
  }
});
