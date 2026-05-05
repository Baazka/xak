import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { withAuth } from "@/lib/withAuth";
import { requirePermission } from "@/lib/requirePermission";
import { JwtPayload } from "@/lib/jwtPayload";

export const GET = withAuth(async (req: NextRequest, user: JwtPayload) => {
  //requirePermission(user.permissions, ["user.read"]);

  const sp = new URL(req.url).searchParams;
  const audId = sp.get("aud_id");
  const formListId = sp.get("formlist_id");
  const userId = user.id;

  console.log("GET", audId, formListId);

  if (!audId) {
    return NextResponse.json({ error: "Audit ID is required" }, { status: 400 });
  }
  if (!formListId) {
    return NextResponse.json({ error: "Form ID is required" }, { status: 400 });
  }

  if (!audId || !formListId) {
    return NextResponse.json({ error: "Audit ID and Form ID are required" }, { status: 400 });
  }

  const client = await db.connect();

  try {
    let lastFormId: number;

    const formRes = await client.query(
      `SELECT form_id
       FROM audit_forms
       WHERE form_aud_id = $1 AND form_list_id = $2
       LIMIT 1`,
      [audId, formListId]
    );

    if (formRes.rows[0]) {
      lastFormId = formRes.rows[0].form_id;
    } else {
      const newFormRes = await client.query(
        `INSERT INTO audit_forms (form_aud_id, form_list_id, form_status_id)
         VALUES ($1, $2, 1)
         RETURNING form_id`,
        [audId, formListId]
      );

      lastFormId = newFormRes.rows[0].form_id;

      await client.query(
        `INSERT INTO audit_form_actions
          (action_form_id, action_status_id, action_date, action_by)
         VALUES ($1, 1, current_timestamp, $2)`,
        [lastFormId, userId]
      );
    }

    const formDataRes = await client.query(
      `
      SELECT 
        f.form_id,
        f.form_aud_id,
        f.form_list_id,
        af.form_stage,
        af.form_name,
        af.form_code,
        f.form_status_id,
        s.status_label AS form_status_name,
        s.status_code AS from_status_code,
        f.form_description,
        f.form_sup_value,
        f.form_file_id
      FROM audit_forms f
      JOIN ref_audit_form af ON f.form_list_id = af.form_id
      JOIN ref_form_status s ON f.form_status_id = s.status_id
      WHERE f.form_id = $1
      `,
      [lastFormId]
    );

    if (!formDataRes.rows[0]) {
      return NextResponse.json({ error: "Form data not found" }, { status: 404 });
    }

    return NextResponse.json({ formData: formDataRes.rows[0] }, { status: 200 });
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
  const formStatusId = body.form_status_id;
  const formDescription = body.form_description;
  const formSupValue = body.form_sup_value;
  const formFileId = body.form_file_id;

  if (!formId || !formStatusId) {
    return NextResponse.json({ error: "Form ID and Form Status ID are required" }, { status: 400 });
  }

  const client = await db.connect();

  try {
    const formRes = await client.query(
      `UPDATE audit_forms SET form_status_id = $1, form_description = $2, form_sup_value = $3, form_file_id = $4 WHERE form_id = $5 RETURNING form_id`,
      [formStatusId, formDescription, formSupValue, formFileId, formId]
    );

    if (!formRes.rows[0].form_id) {
      return NextResponse.json({ error: "Update form not found" }, { status: 404 });
    }

    await client.query(
      `INSERT INTO audit_form_actions (action_form_id, action_status_id, action_date, action_by) VALUES ($1, $2, current_timestamp, $3)`,
      [formId, formStatusId, userId]
    );

    return NextResponse.json({ message: "Audit form updated successfully" }, { status: 201 });
  } catch (err: any) {
    await client.query("ROLLBACK").catch(() => {});
    console.error("Audit Form update error:", err);

    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  } finally {
    client.release();
  }
});
