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
      `SELECT form_id FROM audit_forms WHERE form_aud_id = $1 AND form_list_id = 8`,
      [audId]
    );
    if (!formRes.rows[0]) {
      const newFormRes = await client.query(
        `INSERT INTO audit_forms (form_aud_id, form_list_id, form_status_id) VALUES ($1, 8, 1) RETURNING form_id`,
        [audId]
      );
      const NewformId = newFormRes.rows[0].form_id;

      await client.query(
        `INSERT INTO audit_form_actions (action_form_id, action_status_id, action_date, action_by) VALUES ($1, 1, current_timestamp, $2)`,
        [NewformId, userId]
      );
    }
    const formResLast = await client.query(
      `SELECT form_id FROM audit_forms WHERE form_aud_id = $1 AND form_list_id = 8`,
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
        p.plan_id,
        p.plan_form_id,
        p.plan_type_id,
        t.type_label plan_type_name,
        to_char(plan_date,'YYYY.MM.DD') plan_date,
        to_char(plan_comp_date,'YYYY.MM.DD') plan_comp_date,
        p.plan_description,
        p.plan_user_id,
        u.user_firstname,
        u.user_phone,
        p.plan_file_id
        from audit_plan p 
        join ref_plan_type t on p.plan_type_id = t.type_id
        join reg_users_new u on p.plan_user_id = u.user_id
        where p.plan_form_id = $1
    `,
      [formId]
    );

    return NextResponse.json(
      {
        formData: formDataRes.rows[0],
        data: dataRes.rows,
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
  const planId = body.plan_id;
  const planTypeId = body.plan_type_id;
  const planDate = body.plan_date;
  const planCompDate = body.plan_comp_date;
  const planDescription = body.plan_description;
  const planFileId = body.plan_file_id;

  if (!planTypeId || !planFileId || !planDate) {
    return NextResponse.json({ error: "Төлөвлөгөөний мэдээлэл бүрэн оруулна уу" }, { status: 400 });
  }

  const client = await db.connect();

  try {
    if (planId) {
      // audit_plan update
      await client.query(
        `UPDATE audit_plan SET plan_type_id = $1, plan_file_id = $2, plan_date = $3, plan_comp_date = $4, plan_description = $5, plan_user_id = $6 WHERE plan_id = $7`,
        [planTypeId, planFileId, planDate, planCompDate, planDescription, userId, planId]
      );
      return NextResponse.json({ message: "Audit plan updated successfully" }, { status: 201 });
    } else {
      // audit_plan insert
      const planRes = await client.query(
        `INSERT INTO audit_plan (plan_form_id, plan_type_id, plan_file_id, plan_date, plan_comp_date, plan_description, plan_user_id)
           VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING plan_id`,
        [formId, planTypeId, planFileId, planDate, planCompDate, planDescription, userId]
      );
      return NextResponse.json({ plan_id: planRes.rows[0].plan_id }, { status: 200 });
    }
  } catch (err: any) {
    await client.query("ROLLBACK").catch(() => {});
    console.error("Create plan error:", err);

    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  } finally {
    client.release();
  }
});

export const DELETE = withAuth(async (req: NextRequest, user: JwtPayload) => {
  //requirePermission(user.permissions, ["user.create"]);

  const body = await req.json();

  const planId = body.plan_id;
  if (!planId) {
    return NextResponse.json({ error: "Plan ID is required" }, { status: 400 });
  }

  const client = await db.connect();

  try {
    await client.query("BEGIN");

    // audit_plan delete
    await client.query(`DELETE FROM audit_plan WHERE plan_id = $1`, [planId]);

    await client.query("COMMIT");
    return NextResponse.json({ message: "Audit plan deleted successfully" }, { status: 200 });
  } catch (err: any) {
    await client.query("ROLLBACK").catch(() => {});
    console.error("Delete plan error:", err);

    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  } finally {
    client.release();
  }
});
